import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.ts";
import express from "express";
import { ApiError, components, PlaytClient } from "@playt/client";
import { fetcher } from "../lib/fetcher";

const { API_HOST, API_KEY, PORT = 8080 } = process.env;

if (!API_HOST || !API_KEY) {
  throw new Error("Missing API_HOST or API_KEY environment variables");
}

const client = new PlaytClient({ apiKey: API_KEY, apiHost: API_HOST });

const app = express();

app.use(express.json());
app.use(express.static("game"));

app.get("/api/match", async (req, res) => {
  try {
    const { playerToken } = req.query;
    if (typeof playerToken !== "string") {
      res.status(400).json({
        message: "playerToken is missing",
      });
      return;
    }

    const response = await fetcher(
      `/api/matches/search?playerToken=${playerToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerToken,
        }),
      }
    );

    if (!response.ok) {
      res.status(response.status).json({
        message: response.statusText,
      });
      return;
    }

    const match = await response.json();
    res.json(match);
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      const { status, statusText } = error;

      res.status(status).json({
        message: statusText,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});

app.get("/api/replay", async (req, res) => {
  try {
    const { matchId, userId } = req.query;
    if (typeof matchId !== "string" || typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid matchId or userId",
      });
      return;
    }

    const response = await fetcher(
      `/api/replays?matchId=${matchId}&userId=${userId}`
    );
    if (!response.ok) {
      res.status(response.status).json(response.statusText);
      return;
    }
    const replay = await response.json();
    const payload = JSON.parse(replay.payload);
    res.status(200).json({ name: replay.name, ...payload });
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      const { status, statusText } = error;

      res.status(status).json({
        message: statusText,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});

app.post("/api/match/abort", async (req, res) => {
  try {
    const { playerToken } = req.body;
    if (typeof playerToken !== "string") {
      res.status(400).json({
        message: "playerToken is missing",
      });
      return;
    }

    const { data: match } = await client.getMatchByPlayerToken({ playerToken });
    const { status, data } = await client.postAbort({
      id: match.id,
      playerToken,
    });
    res.status(status).json(data);
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      const { status, statusText } = error;
      res.status(status).json({
        message: statusText,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});

app.post("/api/score", async (req, res) => {
  try {
    const { score, commands, playerToken, finalSnapshot } = req.body;
    if (typeof playerToken !== "string") {
      res.status(400).json({
        message: "playerToken is missing",
      });
      return;
    }
    if (finalSnapshot) {
      const response = await fetcher("/api/replays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerToken,
          payload: JSON.stringify({
            score,
            commands: commands,
          }),
        }),
      });
      if (!response.ok) {
        res.status(response.status).json(response.statusText);
        return;
      }
    }

    const response = await fetcher("/api/matches/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerToken,
        score,
        finalSnapshot,
      }),
    });

    res.status(response.status).json(response.statusText);
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      const { status, statusText } = error;
      res.status(status).json({
        message: statusText,
      });
    } else {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
