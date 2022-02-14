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
  console.log({ match });
  matchIdByPlayerToken[playerToken] = match.id;

  res.end();
});

app.post("/api/score", async (req, res) => {
  const { score, playerToken, gameOver } = req.body;

  const matchId = matchIdByPlayerToken[playerToken];

  if (!matchId) {
    res.status(400).end();
    return;
  }
  if (gameOver) {
    const result = await submitScore(matchId, playerToken, score);
    console.log({ result });
  } else {
    const result = await updateScore(matchId, playerToken, score);
    console.log({ result });
  }
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function joinMatch(playerToken) {
  const response = await fetch(`${API_HOST}/match/join/${playerToken}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      clientId: API_CLIENT_ID,
      clientSecret: API_CLIENT_SECRET,
    }),
  });
  return await response.json();
}

async function updateScore(matchId, playerToken, score) {
  const response = await fetch(`${API_HOST}/match/${matchId}/score`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playerToken,
      score,
      clientId: API_CLIENT_ID,
      clientSecret: API_CLIENT_SECRET,
    }),
  });
  return await response.json();
}

async function submitScore(matchId, playerToken, score) {
  const response = await fetch(`${API_HOST}/match/${matchId}/score/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playerToken,
      score,
      clientId: API_CLIENT_ID,
      clientSecret: API_CLIENT_SECRET,
    }),
  });
  return await response.json();
}
