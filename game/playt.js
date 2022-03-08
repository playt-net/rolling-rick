const params = new URLSearchParams(window.location.search);

const playerToken = params.get("playerToken");

export function joinMatch() {
  return fetch(`/api/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerToken,
    }),
  });
}

export function updateScore(score) {
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

export function submitScore(score, replay) {
  return fetch(`/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      replay,
      playerToken,
      isFinal: true,
    }),
  });
}
