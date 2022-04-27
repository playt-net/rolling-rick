import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.ts";
import express from "express";
import { components, PlaytClient } from "@playt/client";

const { API_HOST, API_KEY, PORT = 8080 } = process.env;

const client = PlaytClient({ apiKey: API_KEY, apiHost: API_HOST });

const app = express();

app.use(express.json());
app.use(express.static("game"));

const matchByPlayerToken: {
  [playerToken: string]: components["schemas"]["MatchResponse"];
} = {};

app.post("/api/match", async (req, res, next) => {
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
    const replays = replayResponses.map((replayReponse) =>
      JSON.parse(replayReponse.data.payload)
    );
    res.json(replays);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

app.post("/api/score", async (req, res) => {
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
        name: "Bob",
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
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
