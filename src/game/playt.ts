import type { components } from "@playt/client";

const params = new URLSearchParams(window.location.search);

export type Replay = {
  name: string;
  score: any;
  commands: any;
};
export const playerToken = params.get("playerToken");

export async function getMatch() {
  const response = await fetch(`/api/match?playerToken=${playerToken}`);

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as components["schemas"]["MatchResponse"];
}

export async function joinMatch() {
  const response = await fetch(`/api/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerToken,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as {
    match: components["schemas"]["MatchResponse"];
    replays: Replay[];
  };
}

export function updateScore(score: number) {
  return fetch(`/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      playerToken,
    }),
  });
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

export function abortMatch() {
  return fetch(`/api/match/abort`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerToken,
    }),
  });
}
