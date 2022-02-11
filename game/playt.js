const params = new URLSearchParams(window.location.search);

const playerToken = params.get("playerToken");

export function updateScore(score) {
  return fetch(`/api/score`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      playerToken,
    }),
  });
}

export function submitScore(score) {
  return fetch(`/api/score`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score,
      playerToken,
      gameOver: true,
    }),
  });
}
