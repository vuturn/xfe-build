/**
 * webpack 生产环境配置
 * @author zenglinxiang
 */

('use strict');

const shelljs = require('shelljs');
const extend = require('node.extend');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.js');
const config = require('infofe-build/build/config');


// prod 环境配置
let buildWebpackConfig = {
    devtool: config.buildConfig.sourceMap ? 'source-map' : false,
};

let buildPlugins = [
    // new OptimizeCssAssetsPlugin({
    //     assetNameRegExp: /\.css$/g,
    //     cssProcessor: require('cssnano'),
    //     cssProcessorOptions: {
    //         discardComments: {removeAll: true},
    //         /**
    //          * loader 中已经做了 autoprefixer 处理, 会导致一些 -webkit- 方法不能使用。
    //          */
    //         autoprefixer: false,
    //         safe: true,
    //     },
    //     canPrint: true,
    // }),
    // new webpack.optimize.UglifyJsPlugin({
    //     ie8: true,
    //     // 最紧凑的输出
    //     beautify: false,
    //     // 删除所有的注释
    //     comments: false,
    //     sourceMap: config.buildConfig.sourceMap,
    //     mangle: {
    //         screw_ie8: false,
    //         safari10: true,
    //     },
    //     compress: {
    //         properties: false,
    //         warnings: false,
    //         drop_debugger: true,
    //         // ie8 不支持 console
    //         drop_console: config.buildConfig.dropConsole,
    //         screw_ie8: false,
    //     },
    //     output: {
    //         quote_keys: true,
    //         screw_ie8: false,
    //     },
    // }),
    // new webpack.BannerPlugin({
    //     // 必须要放到 UglifyJsPlugin 后，否则 banner 注释会被压缩掉
    //     banner: 'hash: [chunkhash]',
    //     entryOnly: false,
    // }),
];

if (!process.env.isLib) {
    buildPlugins.push(
        new CleanWebpackPlugin(['dist'], {
            // removes 'dist' folder
            root: config.buildConfig.staticPublicProjectPath || config.paths.projectPath, // 也就是删除此目录下的 dist 文件夹
            verbose: true,
            dry: false,
            exclude: [],
        })
    );
}

// bundle analyzer
if (process.env.useBundleAnalyzer === "true") {
    let bundleAnalyzerPort = Math.floor(Math.random() * 9000) + 1000; // 随机生成端口号
    buildPlugins.push(
        new BundleAnalyzerPlugin({
            analyzerPort: bundleAnalyzerPort
        })
    );
}

baseWebpackConfig.plugins = baseWebpackConfig.plugins.concat(buildPlugins);

module.exports = extend(baseWebpackConfig, buildWebpackConfig);
