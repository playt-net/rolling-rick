import type { paths } from "@playt/client";
import { client } from "./game.mjs";

const params = new URLSearchParams(window.location.search);

export type Replay = {
  userId: string;
  name: string;
  score: number;
  commands: any;
};
const playerTokenQueryParam = params.get("playerToken");
if (!playerTokenQueryParam) {
  throw new Error("playerToken query param is required");
}
export const playerToken = playerTokenQueryParam;

export async function getMatch() {
  const response = await fetch(`/api/match?playerToken=${playerToken}`);

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as paths["/api/matches/search"]["post"]["responses"]["200"]["content"]["application/json"];
}

export async function getReplay(matchId: string, userId: string) {
  const response = await fetch(
    `/api/replay?matchId=${matchId}&userId=${userId}`,
  );

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as Replay;
}

export async function updateScore(score: number) {
  const response = await fetch("/api/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      playerToken,
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as unknown;
}

export function submitScore(score: number, commands?: Replay["commands"]) {
  return fetch("/api/score", {
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

export async function surrender(score: number) {
  await fetch("/api/score", {
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
  await client.quitMatch();
}

export async function endTutorial() {
  await submitScore(0);
  await client.quitMatch();
}

export function isMuted() {
  return params.get("mute") === "true";
}