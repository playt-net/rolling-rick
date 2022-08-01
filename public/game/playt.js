var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const params = new URLSearchParams(window.location.search);
export const playerToken = params.get("playerToken");
export function getMatch() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/api/match?playerToken=${playerToken}`);
        const result = yield response.json();
        if (!response.ok) {
            throw result;
        }
        return result;
    });
}
export function getReplay(matchId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/api/replay?matchId=${matchId}&userId=${userId}`);
        const result = yield response.json();
        if (!response.ok) {
            throw result;
        }
        return result;
    });
}
export function updateScore(score) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/api/score`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                score,
                playerToken,
            }),
        });
        const result = yield response.json();
        if (!response.ok) {
            throw result;
        }
        return result;
    });
}
export function submitScore(score, commands) {
    return fetch(`/api/score`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            score,
            commands,
            playerToken,
            finalSnapshot: true,
        }),
    });
}
export function surrender(score) {
    return fetch(`/api/score`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playerToken,
            score,
            surrender: true,
        }),
    });
}
export function endTutorial() {
    return fetch(`${process.env.API_HOST}/api/tutorials/scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playerToken,
            score: 0,
            finalSnapshot: true,
        }),
    });
}
//# sourceMappingURL=playt.js.map