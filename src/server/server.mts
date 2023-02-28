import dotenv from "dotenv";
dotenv.config();

import app from "./app.mjs";

const PORT = process.env.PORT;

if (!PORT) {
  console.error({ PORT });
  throw new Error("Missing environment variables");
}

app.listen(PORT, () => {
  console.log(`Rolling Rick listening on http://localhost:${PORT}`);
});
