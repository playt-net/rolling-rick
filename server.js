import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";

const { API_HOST, API_CLIENT_ID, API_CLIENT_SECRET, PORT = 8080 } = process.env;

const app = express();

app.use(express.json());
app.use(express.static("game"));

const matchIdByPlayerToken = {};

app.post("/api/match", async (req, res) => {
  const { playerToken } = req.body;

  const match = await joinMatch(playerToken);
  matchIdByPlayerToken[playerToken] = match.id;
  res.json(match);
});

app.post("/api/score", async (req, res) => {
  const { score, replay, playerToken, isFinal } = req.body;

  const matchId = matchIdByPlayerToken[playerToken];

  if (!matchId) {
    res.status(400).end();
    return;
  }
  const result = await updateScore(matchId, playerToken, score, isFinal);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

const authToken = Buffer.from(`${API_CLIENT_ID}:${API_CLIENT_SECRET}`).toString(
  "base64"
);
const headers = {
  Accept: "application/json",
  Authorization: `Basic ${authToken}`,
  "Content-Type": "application/json",
};

async function joinMatch(playerToken) {
  const response = await fetch(`${API_HOST}/match/join`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playerToken,
    }),
  });
  return await response.json();
}

async function updateScore(matchId, playerToken, score, isFinal = false) {
  const response = await fetch(`${API_HOST}/match/${matchId}/score`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playerToken,
      score,
      isFinal,
    }),
  });
  return await response.json();
}
