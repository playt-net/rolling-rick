import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.mjs";

// import PlaytClient from "@playt/client";
setTimeout(() => import("@playt/client"), 0);
import express from "express";

const API_HOST = process.env.API_HOST;
const API_KEY = process.env.API_KEY;

if (!API_HOST || !API_KEY) {
  console.error({ API_HOST, API_KEY });
  throw new Error("Missing environment variables");
}

// const client = PlaytClient({
//   apiKey: API_KEY,
//   apiUrl: API_HOST,
// });
const app = express();

app.use(express.json());
app.use(express.static("public"));

// app.get("/api/match", async (req, res) => {
//   try {
//     const { playerToken } = req.query;
//     if (typeof playerToken !== "string") {
//       res.status(400).json({
//         message: "playerToken is missing",
//       });
//       return;
//     }
//
//     const {
//       data: match,
//       ok,
//       status,
//       statusText,
//     } = await client.searchMatch({ playerToken });
//     if (!ok) {
//       res.status(status).json({
//         message: statusText,
//       });
//       return;
//     }
//     res.json(match);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// });
//
// app.get("/api/replay", async (req, res) => {
//   try {
//     const { matchId, userId } = req.query;
//     if (typeof matchId !== "string" || typeof userId !== "string") {
//       res.status(400).json({
//         message: "Invalid matchId or userId",
//       });
//       return;
//     }
//
//     const {
//       data: replay,
//       ok,
//       status,
//       statusText,
//     } = await client.getReplay({ matchId, userId });
//     if (!ok) {
//       res.status(status).json(statusText);
//       return;
//     }
//     const payload = JSON.parse(replay.payload);
//     res.status(200).json({ userId, name: replay.name, ...payload });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// });
//
// app.post("/api/score", async (req, res) => {
//   try {
//     const { score, commands, playerToken, finalSnapshot, surrender } = req.body;
//     if (typeof playerToken !== "string") {
//       res.status(400).json({
//         message: "playerToken is missing",
//       });
//       return;
//     }
//     if (finalSnapshot) {
//       const { ok, status, statusText } = await client.submitReplay({
//         playerToken,
//         payload: JSON.stringify({
//           score,
//           commands: commands,
//         }),
//       });
//       if (!ok) {
//         res.status(status).json(statusText);
//         return;
//       }
//     }
//     const { status, statusText } = await client.submitScore({
//       playerToken,
//       score,
//       finalSnapshot,
//       surrender,
//     });
//
//     res.status(status).json(statusText);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// });
//
// app.post("/api/quit", async (req, res) => {
//   try {
//     const { playerToken } = req.body;
//
//     if (typeof playerToken !== "string") {
//       res.status(400).json({
//         message: "playerToken is missing",
//       });
//       return;
//     }
//
//     const message = await client.quitMatch({
//       playerToken,
//     });
//
//     res.status(message.status).json(message.status);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// });

export default app;
