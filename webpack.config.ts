import { join } from "path";
import { EnvironmentPlugin, type Configuration } from "webpack";
import dotenv from "dotenv";

dotenv.config();

const { API_HOST } = process.env;
console.debug("env:", { API_HOST });

const plugins = [new EnvironmentPlugin(["API_HOST"])];

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
  plugins,
};

export default config;
