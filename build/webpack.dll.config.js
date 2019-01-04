const webpack = require('webpack');
const path = require('path');
let config = require('./config');
let projectPath = config.paths.projectPath;
let dllConfig = config.buildConfig.dllConfig;
dllConfig.plugins = [
  new webpack.DllPlugin({
      path: path.join(projectPath, '/dist/dll/manifest.json'),
      name: '[name]',
      context: projectPath,
  })
]

module.exports = dllConfig;