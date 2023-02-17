import dotenv from "dotenv";
dotenv.config();

import app from "./app.mjs";

const { PORT = 3001 } = process.env;

app.listen(PORT, () => {
  console.log(`Rolling Rick listening on http://localhost:${PORT}`);
});
