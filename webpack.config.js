var nodeExternals = require('webpack-node-externals');
//var JavaScriptObfuscator = require('webpack-obfuscator');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: "./compiled-lib/main.js",
    target: 'node',
    externals: [
      'atom',
      'electron',
      'remote',
      'log4js', // It's bundled with Atom.
      nodeExternals()],
    output: {
      filename: "./lib/main.js",
      libraryTarget: 'commonjs'
    },
    module: {
      loaders: [
          {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: /node_modules/
          }
      ]
  }
  ,plugins: [
    new UglifyJsPlugin()
    /*
      new JavaScriptObfuscator ({
          rotateUnicodeArray: true
      }, [])
      */
  ]

  }