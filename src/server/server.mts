import app from "./app.mjs";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Rolling Rick listening on http://localhost:${PORT}`);
});
