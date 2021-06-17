const path = require("path");
const webpack = require("webpack");
const config = require("config");
const ConfigWebpack = require("config-webpack");

if (!config.has("api.osmTileMapUrl")) console.log("API: api.osmTileMapUrl not set; users will not be able to set their location using a map.");
if (!config.has("api.osmAttribution")) console.log("API: api.osmAttribution not set; the map will not have any attribution.");

module.exports = {
  entry: "./quadweb/src/index.jsx",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env", "@babel/preset-react"], plugins: ["@babel/plugin-transform-runtime"] }
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
