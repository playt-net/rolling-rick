var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
dotenv.config();
import PlaytClient from "@playt/client";
import express from "express";
const { API_HOST, API_KEY } = process.env;
if (!API_HOST || !API_KEY) {
    throw new Error("Missing environment variables");
}
const client = PlaytClient({
    apiKey: API_KEY,
    apiUrl: API_HOST,
});
const app = express();
app.use(express.json());
app.use(express.static("game"));
app.get("/api/match", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerToken } = req.query;
        if (typeof playerToken !== "string") {
            res.status(400).json({
                message: "playerToken is missing",
            });
            return;
        }
        const { data: match, ok, status, statusText, } = yield client.searchMatch({ playerToken });
        if (!ok) {
            res.status(status).json({
                message: statusText,
            });
            return;
        }
        res.json(match);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
app.get("/api/replay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId, userId } = req.query;
        if (typeof matchId !== "string" || typeof userId !== "string") {
            res.status(400).json({
                message: "Invalid matchId or userId",
            });
            return;
        }
        const { data: replay, ok, status, statusText, } = yield client.getReplay({ matchId, userId });
        if (!ok) {
            res.status(status).json(statusText);
            return;
        }
        const payload = JSON.parse(replay.payload);
        res.status(200).json(Object.assign({ userId, name: replay.name }, payload));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
app.post("/api/score", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { score, commands, playerToken, finalSnapshot, surrender } = req.body;
        if (typeof playerToken !== "string") {
            res.status(400).json({
                message: "playerToken is missing",
            });
            return;
        }
        if (finalSnapshot) {
            const { ok, status, statusText } = yield client.submitReplay({
                playerToken,
                payload: JSON.stringify({
                    score,
                    commands: commands,
                }),
            });
            if (!ok) {
                res.status(status).json(statusText);
                return;
            }
        }
        const { status, statusText } = yield client.submitScore({
            playerToken,
            score,
            finalSnapshot,
            surrender,
        });
        res.status(status).json(statusText);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
export default app;
//# sourceMappingURL=app.js.map