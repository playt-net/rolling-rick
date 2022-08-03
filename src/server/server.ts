import dotenv from "dotenv";
dotenv.config();

import "./fetch-polyfill.js";
import app from "./app.js";

const { PORT = 8080 } = process.env;

app.listen(PORT, () => {
  console.log(`Rolling Rick listening on http://localhost:${PORT}`);
});
