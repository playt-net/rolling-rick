import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fs from "fs";
import { components, PlaytClient } from "@playt/client";

const players = JSON.parse(fs.readFileSync("./samples.json", "utf-8"));

const { API_HOST, API_KEY, PORT = 8080 } = process.env;

const client = PlaytClient({ apiKey: API_KEY, apiHost: API_HOST });

const app = express();

app.use(express.json());
app.use(express.static("game"));

const matchIdByPlayerToken: {
  [playerToken: string]: string;
} = {};

app.post("/api/match", async (req, res) => {
  const { playerToken } = req.body;

  const { data } = await client.postMatchJoin({ playerToken });
  const match = data as components["schemas"]["MatchResponse"];
  matchIdByPlayerToken[playerToken] = match.id;
  // Temporary fake result
  const matchWithTimeseries = {
    players: players,
  };
  res.json(matchWithTimeseries);
});

app.post("/api/score", async (req, res) => {
  const { score, replay, playerToken, isFinal } = req.body;

  const matchId = matchIdByPlayerToken[playerToken];

  if (!matchId) {
    res.status(400).end();
    return;
  }
  const result = await client.postScore({
    id: matchId,
    playerToken,
    score,
    final: isFinal,
  });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

export {};
