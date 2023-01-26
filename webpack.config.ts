import { join } from "path";
import { DefinePlugin, type Configuration } from "webpack";
import dotenv from "dotenv";
dotenv.config();

const config: Configuration = {
  mode: "production",
  entry: "./src/game/game.mts",
  module: {
    rules: [
      {
        test: /\.mts$/,
        use: "babel-loader",
      },
      {
        test: /\.wasm$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    fallback: {
      crypto: false,
      fs: false,
      path: false,
    },
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
      "process.env.API_HOST": JSON.stringify(process.env.API_HOST),
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};

export default config;
