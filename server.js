import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";

const { API_HOST, API_CLIENT_ID, API_CLIENT_SECRET, PORT = 8080 } = process.env;

const app = express();

app.use(express.json());
app.use(express.static("game"));

app.patch("/api/score", async (req, res) => {
  const { score, playerToken } = req.body;
  // Send score to PLAYT API
  console.log(req.body, { score, playerToken });

  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
