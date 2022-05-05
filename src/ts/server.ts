import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.ts";
import express from "express";
import { ApiError, components, PlaytClient } from "@playt/client";

const { API_HOST, API_KEY, PORT = 8080 } = process.env;

const client = new PlaytClient({ apiKey: API_KEY, apiHost: API_HOST });

const app = express();

app.use(express.json());
app.use(express.static("game"));

const matchByPlayerToken: {
  [playerToken: string]: components["schemas"]["MatchResponse"];
} = {};

app.post("/api/match", async (req, res) => {
  try {
    const { playerToken } = req.body;

    const { data: match } = await client.postMatchJoin({ playerToken });
    matchByPlayerToken[playerToken] = match;
    const promises = match.availableReplays.map((availableReplay) =>
      client.getReplay({
        matchId: availableReplay.matchId,
        userId: availableReplay.userId,
      })
    );
    const replayResponses = await Promise.all(promises);
    const replays = replayResponses.map((replayReponse) => {
      const replay = JSON.parse(replayReponse.data.payload);
      return {
        name: replayReponse.data.participant.username,
        score: replay.score,
        commands: replay.commands,
      };
    });
    res.json(replays);
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
    const match = matchByPlayerToken[playerToken];
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
    await client.postAbort({
      id: match.id,
      playerToken,
    });
    res.status(200).json({});
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
    const { score, replay, playerToken, finalSnapshot } = req.body;

    const match = matchByPlayerToken[playerToken];

    if (!match) {
      res.status(400).end();
      return;
    }

    if (finalSnapshot) {
      await client.postReplay({
        matchId: match.id,
        playerToken,
        payload: JSON.stringify({
          score,
          commands: replay,
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
