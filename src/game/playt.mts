import { paths } from "@playt/client";

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
  const response = await fetch(`/api/score`, {
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

export function quitMatch() {
  return fetch(`/api/quit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerToken,
    }),
  });
}

export function surrender(score: number) {
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

export async function endTutorial() {
  await submitScore(0);
  await quitMatch();
}
