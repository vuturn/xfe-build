/**
 * webpack 开发环境配置
 * @author zenglinxiang
 */

'use strict';

const extend = require('node.extend');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const baseWebpackConfig = require('./webpack.base');
const config = require('./config');

// dev 环境配置
let devWebpackConfig = {
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(config.paths.projectPath, './'), // 本地服务器所加载的页面所在的目录
        historyApiFallback: true,
        port: config.devServerPort,
        hot: true,
        inline: config.buildConfig.inline || false, // 是否启用自动刷新
        stats: {
            assets: false,
            warnings: true,
            errors: true,
            modules: false,
            hash: false,
            version: false,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        /**
         * @see https://webpack.js.org/configuration/dev-server/#devserver-disablehostcheck
         * @description 在有一些需要种 cookie 的情况，需要绑 host 来访问，不能直接使用 ip。
         */
        disableHostCheck: true,
        /**
         * @see https://webpack.js.org/configuration/dev-server/#devserver-proxy
         */
        proxy: config.buildConfig.proxyTable || {},
        /**
         * @see https://webpack.js.org/configuration/dev-server/#devserver-proxy
         * devServer.allowedHosts
         * This option allows you to whitelist services that are allowed to access the dev server.
         */
        allowedHosts: config.buildConfig.allowedHosts || []
    },
};

let devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
];

baseWebpackConfig.plugins = baseWebpackConfig.plugins.concat(devPlugins);

module.exports = extend(baseWebpackConfig, devWebpackConfig);