// @ts-check
const dotenv = require("dotenv");
dotenv.config();

require("./fetch-polyfill.js");
const express = require("express");
const { PlaytClient, ApiError } = require("@playt/client");

const { API_HOST, API_KEY, PORT = 8080 } = process.env;

if (!API_HOST || !API_KEY) {
  throw new Error("Missing API_HOST or API_KEY environment variables");
}

const client = new PlaytClient({ apiKey: API_KEY, apiHost: API_HOST });

const app = express();

app.use(express.json());
app.use(express.static("game"));

const matchByPlayerToken = {};

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

app.post("/api/match", async (req, res) => {
  try {
    const { playerToken } = req.body;
    if (typeof playerToken !== "string") {
      res.status(400).json({
        message: "playerToken is missing",
      });
      return;
    }

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
    res.json({ match, replays });
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

    const match = matchByPlayerToken[playerToken];
    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }
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
