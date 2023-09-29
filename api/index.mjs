import app from "../dist/src/server/app.mjs";
import { readFileSync, readdirSync } from "node:fs";

console.log(readdirSync("/var/task"));
console.log(readdirSync("/var/task/node_modules"));
console.log(readdirSync("/var/task/node_modules/@playt"));
console.log(readdirSync("/var/task/node_modules/@playt/client"));
console.log(readdirSync("/var/task/node_modules/@playt/client/dist"));
console.log(
  readFileSync("/var/task/node_modules/@playt/client/package.json", "utf8")
);

export default app;
