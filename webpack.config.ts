import { join } from "path";
import { EnvironmentPlugin, type Configuration } from "webpack";
import dotenv from "dotenv";

dotenv.config();

const { PORT, API_HOST, API_KEY } = process.env;
console.debug("env:", { PORT, API_HOST, API_KEY });

const plugins = [];
plugins.push(
  new EnvironmentPlugin({
    PORT: 3001,
    API_HOST: undefined,
    API_KEY: undefined,
  })
);

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
