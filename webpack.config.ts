import { join } from "path";
import {
  EnvironmentPlugin,
  DefinePlugin,
  ProvidePlugin,
  type Configuration,
} from "webpack";
import dotenv from "dotenv";

const { parsed: dotenvVars } = dotenv.config();
if (dotenvVars == null) {
  throw new Error("Not .env vars present");
}

const config: Configuration = {
  mode: "production",
  entry: "./src/game/game.mts",
  module: {
    rules: [
      {
        test: /\.mts$/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".mts", ".mjs", ".ts", ".js"],
    extensionAlias: {
      ".mjs": [".mts", ".mjs"],
    },
  },
  output: {
    filename: "game.js",
    path: join(__dirname, "public", "bundles"),
  },
  plugins: [
    new DefinePlugin({
      "process.env": JSON.stringify(
        Object.fromEntries(
          Object.entries(dotenvVars).map(([key, value]) => [key, value])
        )
      ),
    }),
  ],
};

export default config;
