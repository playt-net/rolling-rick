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

  res.end();
});

app.post("/api/score", async (req, res) => {
  const { score, playerToken, gameOver } = req.body;

  const matchId = matchIdByPlayerToken[playerToken];

  if (gameOver) {
    await submitScore(matchId, playerToken, score);
  } else {
    await updateScore(matchId, playerToken, score);
  }
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

const auth = Buffer.from(`${API_CLIENT_ID}:${API_CLIENT_SECRET}`).toString(
  "base64"
);
const headers = {
  Authorization: `Basic ${auth}`,
  "Content-Type": "application/json",
};

async function joinMatch(playerToken) {
  const response = await fetch(`${API_HOST}/match/join/${playerToken}`, {
    method: "POST",
    headers,
  });
  return await response.json();
}

async function updateScore(matchId, playerToken, score) {
  const response = await fetch(`${API_HOST}/match/${matchId}/score`, {
    method: "POST",
    headers,
    body: JSON.stringify({ playerToken, score }),
  });
  return await response.json();
}

async function submitScore(matchId, playerToken, score) {
  const response = await fetch(`${API_HOST}/match/${matchId}/score/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ playerToken, score }),
  });
  return await response.json();
}
