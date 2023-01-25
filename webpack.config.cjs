require("dotenv").config();
const path = require("path");
const webpack = require("webpack");

module.exports = {
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
    path: path.resolve(__dirname, "public"),
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_HOST": JSON.stringify(process.env.API_HOST),
    }),
  ],
};
