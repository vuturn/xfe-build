const webpack = require('webpack');
const path = require('path');
let config = require('./config');
let projectPath = config.paths.projectPath;
let dllConfig = config.buildConfig.dllConfig;
delete dllConfig.isOpenDll;
delete dllConfig.injectFiles;
delete dllConfig.filepath;
dllConfig.plugins = [
  new webpack.DllPlugin({
      path: path.join(projectPath, '/dist/dll/manifest.json'),
      name: '[name]',
      context: projectPath,
  })
]

module.exports = dllConfig;