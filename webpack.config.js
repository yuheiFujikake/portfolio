const path = require("path");
const webpack = require("webpack");
const globule = require("globule");
const ip = require("ip");
const TerserPlugin = require("terser-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const DIST_DIR = "./docs";
const MY_IP = ip.address();

const plugins = [];

const entries = {
  view: {},
  js: {},
  scss: {},
};

const targetTypes = {
  pug: { pug: "html" },
  js: { js: "js" },
  scss: { scss: "css" },
};

const devServerSetting = {
  contentBase: DIST_DIR,
  host: MY_IP,
};

plugins.push(new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
}));
plugins.push(new webpack.ProvidePlugin({
  'THREE': 'three/build/three'
}));

const getEntriesList = (targetTypes, srcBase) => {
  const entriesList = {};
  for (const [srcType, targetType] of Object.entries(targetTypes)) {
    const filesMatched = globule.find(
      [`**/*.${srcType}`, `!**/_*.${srcType}`],
      { srcBase: `src/${srcBase}` }
    );
    for (const srcName of filesMatched) {
      const targetName = srcName.replace(
        new RegExp(`.${srcType}$`, "i"),
        `.${targetType}`
      );
      entriesList[targetName] = `${__dirname}/src/${srcBase}/${srcName}`;
    }
  }
  return entriesList;
};

const pushEntries = (entryType, srcDir, distDir) => {
  for (const [targetName, srcName] of Object.entries(
    getEntriesList(entryType, srcDir)
  )) {
    const targetName_noExtension = targetName.replace(
      `.${Object.values(entryType)[0]}`,
      ""
    );
    const split = targetName_noExtension.split("/");
    const splitLength = split.length;
    const lastSplitItem = split[splitLength - 1];
    if (lastSplitItem && splitLength > 1) {
      let dir = "";
      for (let i = 0; i < splitLength - 1; i++) {
        dir += `${split[i]}/`;
      }
      entries[srcDir][`${dir}${distDir}/${lastSplitItem}`] = srcName;
    } else {
      entries[srcDir][`${distDir}/${targetName_noExtension}`] = srcName;
    }
  }
};

// js
pushEntries(targetTypes.js, "js", "js");

// scss
pushEntries(targetTypes.scss, "scss", "css");

//pug
const pugPlugin = [];
for (const [targetName, srcName] of Object.entries(
  getEntriesList(targetTypes.pug, "view")
)) {
  entries.view[targetName.replace(".html", "")] = srcName;
  pugPlugin.push(
    new HtmlWebpackPlugin({
      inject: false,
      filename: targetName,
      template: srcName,
    })
  );
}

module.exports = () => {
  return [
    {
      // ---------------------------------------- js ----------------------------------------
      devServer: devServerSetting,
      entry: entries.js,
      output: {
        filename: "[name].js",
        path: path.join(__dirname, `${DIST_DIR}`),
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { modules: false }]],
                },
              },
            ],
          },
        ],
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /node_modules/,
              name: `./vendor`,
              chunks: "initial",
              enforce: true,
            },
          },
        },
        minimizer: [
          new TerserPlugin({
            terserOptions: { compress: { drop_console: true } },
          }),
        ],
      },
      plugins: plugins,
    },
    {
      // ---------------------------------------- scss ----------------------------------------
      entry: entries.scss,
      output: {
        path: path.join(__dirname, `${DIST_DIR}`),
        filename: "[name].css",
      },
      module: {
        rules: [
          {
            test: /\.(css|sass|scss)$/,
            use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [
                {
                  loader: "css-loader",
                  options: { url: false },
                },
                "postcss-loader",
                "sass-loader",
              ],
            }),
          },
        ],
      },
      plugins: [new ExtractTextPlugin("[name].css")],
    },
    {
      // ---------------------------------------- pug ----------------------------------------
      entry: entries.view,
      output: {
        path: path.join(__dirname, `${DIST_DIR}`),
        filename: "./_trash/[name].js",
      },
      module: {
        rules: [
          {
            test: /\.pug$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "pug-loader",
                options: {
                  pretty: false,
                },
              },
            ],
          },
        ],
      },
      plugins: pugPlugin,
    },
  ];
};
