// @ts-check
import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.js";
import express from "express";
import { ApiError, PlaytClient } from "@playt/client";

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
    const { data: match } = await client.getMatchByPlayerToken({ playerToken });
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

app.get("/api/player", async (req, res) => {
  try {
    const { matchId, playerToken } = req.query;
    if (typeof matchId !== "string" || typeof playerToken !== "string") {
      res.status(400).json({
        message: "Invalid payload",
      });
      return;
    }
    const { data: player } = await client.getPlayer({
      id: matchId,
      playerToken,
    });
    res.json(player);
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

app.post("/api/match", async (req, res) => {
  try {
    const { playerToken } = req.body;
    if (typeof playerToken !== "string") {
      res.status(400).json({
        message: "playerToken is missing",
      });
      return;
    }

    const { status, data } = await client.postMatchJoin({ playerToken });
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

app.get("/api/replay", async (req, res) => {
  try {
    const { matchId, userId } = req.query;
    if (typeof matchId !== "string" || typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid matchId or userId",
      });
      return;
    }

    const { status, data } = await client.getReplay({
      matchId: matchId,
      userId: userId,
    });
    const replay = JSON.parse(data.payload);
    res.status(status).json(replay);
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

    const { data: match } = await client.getMatchByPlayerToken({ playerToken });
    const { data: player } = await client.getPlayer({
      id: match.id,
      playerToken,
    });

    if (finalSnapshot) {
      await client.postReplay({
        matchId: match.id,
        playerToken,
        payload: JSON.stringify({
          name: player.username,
          score,
          commands: commands,
        }),
      });
    }
    const { status, data } = await client.postScore({
      id: match.id,
      playerToken,
      score,
      finalSnapshot,
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

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
