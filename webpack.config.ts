import { join } from "path";
import { DefinePlugin, type Configuration } from "webpack";
import dotenv from "dotenv";

dotenv.config();

const plugins = [];
plugins.push(
  new DefinePlugin({
    "process.env": JSON.stringify(
      Object.fromEntries(
        Object.entries(process.env).map(([key, value]) => [key, value])
      )
    ),
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
