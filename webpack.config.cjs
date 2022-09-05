require("dotenv").config();
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/game/game.ts",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.game.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "public"),
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_HOST": JSON.stringify(process.env.API_HOST),
    }),
  ],
};
