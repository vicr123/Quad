//Set up the configuration files
process.env["NODE_CONFIG_DIR"] = "../config/";

const path = require("path");
const webpack = require("webpack");
const config = require("config");
const ConfigWebpack = require("config-webpack");

module.exports = {
  entry: "./src/index.jsx",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/dist/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: config.get("server.port"),
    publicPath: `${config.get("server.rootAddress")}/dist/`,
    hotOnly: true
  },
  plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ConfigWebpack()
  ]
};
