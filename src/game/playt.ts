import { paths } from "@playt/client/dist/types";

const params = new URLSearchParams(window.location.search);

export type Replay = {
  userId: string;
  name: string;
  score: number;
  commands: any;
};
export const playerToken = params.get("playerToken");

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
    `/api/replay?matchId=${matchId}&userId=${userId}`
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

export function submitScore(score: number, commands: Replay["commands"]) {
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
