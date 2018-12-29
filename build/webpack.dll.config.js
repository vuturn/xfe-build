const webpack = require('webpack');
const path = require('path');
let config = require('./config');
let projectPath = config.paths.projectPath;
let dllConfig = config.buildConfig.dllConfig;
console.log( config.buildConfig)
dllConfig.plugins = [
  new webpack.DllPlugin({
      path: path.join(projectPath, '/dist/dll/manifest.json'),
      name: '[name]_[chunkhash]',
      context: projectPath,
  })
]

module.exports = dllConfig;