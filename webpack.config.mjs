// @ts-check
import { fileURLToPath } from "url";
import webpack from "webpack";
import dotenv from "dotenv";

dotenv.config();

const { API_HOST } = process.env;
console.debug("env:", { API_HOST });

const plugins = [new webpack.EnvironmentPlugin(["API_HOST"])];

/** @type import('webpack').Configuration */
const config = {
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
    path: fileURLToPath(new URL("public/bundles", import.meta.url)),
  },
  plugins,
};

export default config;
