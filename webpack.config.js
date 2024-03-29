const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require("glob");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const WebpackHookPlugin = require("webpack-hook-plugin");

const files = {
  blocks_scssPath: "./src/scss/blocks/*.scss",
  critical_scssPath: "./src/scss/critical.scss",
  common_scssPath: "./src/scss/common.scss",
  sections_jsPath: "./src/scripts/sections/*.js",
  components_jsPath: "./src/scripts/components/*.js",
  common_jsPath: "./src/scripts/common.js",
  assetsDir: __dirname + "/assets",
  snippetsDir: __dirname + "/snippets",
  resources: __dirname + "/src/scss/resources.scss",
};

function getFileName(path) {
  let isSnippet = false;
  let isAsset = true;
  const rgx = /[^\\\/]+(?=\.)/g;
  let fileName = path.match(rgx)[0];
  const fileExtension = path.split(".").pop();

  if (path.includes("scripts/components")) {
    fileName = `component-${fileName}`;
  }

  /* create a snippet rather than an asset */
  const snippetRgx = new RegExp("\\.snippet$");
  if (fileName.match(snippetRgx)) {
    isSnippet = true;
    isAsset = false;
    fileName = fileName.replace(snippetRgx, "");
  }

  /* create both: a snippet and an asset */
  const snippetOnlyRgx = new RegExp("\\.snippet-asset$");
  if (fileName.match(snippetOnlyRgx)) {
    isSnippet = true;
    isAsset = true;
    fileName = fileName.replace(snippetOnlyRgx, "");
  }

  /* don't create neither an asset nor a snippet  */
  const ignoreRgx = new RegExp("\\.ignore$");
  if (fileName.match(ignoreRgx)) {
    isAsset = false;
    isSnippet = false;
    fileName = fileName.replace(ignoreRgx, "");
  }

  return [fileName, isSnippet, isAsset, fileExtension];
}

function templatesEntry(arr) {
  let entries = {};
  for (let i = 0; i < arr.length; i++) {
    for (let file of glob.sync(arr[i])) {
      let [fileName, , isAsset, fileExtension] = getFileName(file);
      if (fileExtension === "js") fileName = `js-${fileName}.min`;
      if (fileExtension === "scss") fileName = `css-${fileName}.min`;
      if (!isAsset) continue;
      entries[fileName] = file;
    }
  }

  return entries;
}

const entries = {
  "css-common.min": [files.common_scssPath],
  "js-common.min": [files.common_jsPath],
  ...templatesEntry([files.blocks_scssPath]),
  ...templatesEntry([files.sections_jsPath]),
  ...templatesEntry([files.components_jsPath]),
};

const criticalEntries = {
  "critical.css": files.critical_scssPath,
};

for (let file of glob.sync(files.blocks_scssPath)) {
  const [fileName, isSnippet] = getFileName(file);
  if (!isSnippet) continue;
  criticalEntries[`css-${fileName}.css`] = file;
}

module.exports = (env, argv) => {
  mode = argv.mode || "development";
  console.log(mode);
  const config = {
    mode: mode,
    devtool: false, //disable sourcemap for js
    resolve: {
      // resolve file extensions
      extensions: [".scss", ".js", ".css"],
    },
    watchOptions: {
      ignored: "**/node_modules",
    },
  };

  const commonFilesConfig = Object.assign({}, config, {
    name: "Common",
    entry: entries,
    output: {
      path: files.assetsDir,
    },
    module: {
      rules: [
        // {
        //   test: /\.(?:js)$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: [
        //         ['@babel/preset-env', { targets: "since 2022" }] // https://github.com/browserslist/browserslist
        //       ],
        //       plugins: ['@babel/plugin-transform-private-methods']
        //     }
        //   }
        // },
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options:
                mode === "development"
                  ? {
                      sourceMap: true,
                      sassOptions: {
                        outputStyle: "expanded",
                      },
                    }
                  : {},
            },
            {
              loader: "sass-resources-loader",
              options: {
                sourceMap: false,
                resources: [files.resources],
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg|jpe?g|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "./",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new WebpackHookPlugin({
        onBuildExit: ["node clean.js"],
      }),
    ],
    optimization: {
      minimizer:
        mode === "production"
          ? [
              new TerserPlugin({
                extractComments: false,
              }),
            ]
          : [],
    },
    stats: "errors-only",
  });

  const criticalCssConfig = Object.assign({}, config, {
    name: "Liquid CSS",
    entry: criticalEntries,
    output: {
      path: files.snippetsDir,
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options:
                mode === "development"
                  ? {
                      sourceMap: true,
                      sassOptions: {
                        outputStyle: "expanded",
                      },
                    }
                  : {},
            },
            {
              loader: "sass-resources-loader",
              options: {
                sourceMap: false,
                resources: [files.resources],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name].liquid",
      }),
    ],
    stats: "errors-only",
  });

  return [commonFilesConfig, criticalCssConfig];
};
