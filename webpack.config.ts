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
        test: /\.(js|ts|mjs|mts$)/,
        exclude: /node_modules\/(?!(@playt)\/)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
    ],
  },
  node: {
    fs: "empty",
  },
  resolve: {
    extensions: [".mts", ".mjs", ".ts", ".js"],
    alias: {
      "@playt/anybrain-sdk":
        "@playt/anybrain-sdk/webpack4/anybrain.helper.compiled.js",
    },
  },
  output: {
    publicPath: "/bundles/",
    filename: "game.js",
    path: join(__dirname, "public", "bundles"),
  },
  plugins,
};

export default config;
