process.noDeprecation = true;

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const extend = require('node.extend');
const config = require('./config');
const buildConfig = config.buildConfig;

let resolveModules = [path.join(__dirname, '../node_modules'), path.join(config.paths.projectPath, 'node_modules')];
const excludeRegexStr = `node_modules`;
const excludeRegex = new RegExp(excludeRegexStr);
const POSTCSS = require('../postcss.config')


let scssLoader = []


let basePlugins = [
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: buildConfig.outputNamingPattern === 'hash' ? '[name]-[hash].css' : '[name].css',
        chunkFilename: "[id].css"
    }),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // new webpack.DefinePlugin({
    //     'process.env': {
    //         STATIC_FILES_HOST: '"' + config.paths.staticFilesHost + '"',
    //         ASSETS_HOST: '"' + config.paths.assetsHost + '"',
    //         ASSETS_RELATIVE_PATH: '"' + config.paths.assetsRelativePath + '"',
    //         ASSETS_URL: '"' + config.paths.assetsURLJS + '"',
    //         DEPLOY_TAG: '"' + config.deployTag + '"',
    //         NODE_ENV: config.isProduction ? '"production"' : '"development"',
    //     },
    // }),
];

if (buildConfig.entry.vendor) {
    // basePlugins.push(
    //     new webpack.optimize.CommonsChunkPlugin({
    //         name: 'vendor',
    //         /**
    //          * 因为此项项目除了 vendor 入口外，只有 app 入口，所以此参数暂时无效。
    //          * 如果除了 vendor 外有多个入口，那么多个入口中引用 2 次以上（也就是说至少有两个入口引用了同一个模块）的模块会被打包到 vendor 里
    //          * @see https://segmentfault.com/a/1190000006808865#articleHeader5
    //          * @type {Number}
    //          */
    //         minChunks: 2, // 提取使用 2 次以上的模块，打包到 vendor 里
    //     }),
    //     new webpack.optimize.CommonsChunkPlugin({
    //         name: 'z-mainifest',
    //         chunks: ['vendor'],
    //     }),
    //     new webpack.optimize.CommonsChunkPlugin({
    //         names: ["app"],
    //         children: true,
    //         minChunks: 2, // 提取使用 2 次以上的模块，打包到 vendor 里
    //     })
    // );
}

basePlugins.push(new DllReferencePlugin())

// 注入多个模版文件
(buildConfig.htmlWebpackPlugin || []).forEach(html => {
    Object.assign(html, {
        inject: false,
        alwaysWriteToDisk: true
    });

    basePlugins.push(new HtmlWebpackPlugin(html));
});

basePlugins.push(new HtmlWebpackHarddiskPlugin());

let addAssetHtmlPluginOption = {
    filepath: path.join(__dirname, '/dist/dll/[name].[chunkhash].js'),
    includeSourcemap: false
};

basePlugins.push(
    new webpack.DllReferencePlugin({
        manifest: require(path.join(__dirname, '/dist/dll/manifest.json')),
    }),
    new AddAssetHtmlPlugin()
);

let babelLoaderOptions = {
    babelrc: false,
    presets: [[require.resolve('babel-preset-env'), {modules: false}], require.resolve('babel-preset-stage-2')],
    plugins: [require.resolve('babel-plugin-transform-runtime')],
};

/**
 * Webpack配置数据
 * @type {Object}
 */
console.log(config.paths)
let baseWebpackConfig = {
    // 项目的标识符名称，请使用英文
    name: buildConfig.name || 'build',
    // 项目代码检查设置  一般不改动
    // 模块loader
    entry: buildConfig.entry,
    output: {
        filename: buildConfig.outputNamingPattern === 'hash' ?
            '[name]-[' + (config.isProduction ? 'chunkhash' : 'hash') + ':8].js' : '[name].js',
        chunkFilename: 'chunk-[chunkhash:8].js',
        path: config.paths.dist,
        publicPath: config.paths.publicPath,
    },
    module: {
        rules: [{
            test: /\.js$/, // 输入文件正则
            use: {
                loader: 'babel-loader', // 使用什么loader
                options: babelLoaderOptions // 选项
            },
            exclude: excludeRegex // 排除的文件
        }, {
            test: /\.vue$/,
            use: {
                loader: 'vue-loader', // 使用 vue loader
                options: {
                    loader: {
                        scss: ExtractTextPlugin.extract({
                            fallback: 'vue-style-loader',
                            use: [...scssLoader]
                        }),
                        js: {
                            loader: 'babel-loader',
                            options: babelLoaderOptions,
                        },
                    }
                }
            }
        }, {
            test: /\.(scss|css)$/,
            use: [MiniCssExtractPlugin.loader, {
                loader: 'css-loader',
                options: {
                    url: false,
                    sourceMap: true
                }
            }, {
                loader: 'postcss-loader',
                ident: 'postcss',
                options: {
                    sourceMap: true,
                    plugins: POSTCSS.plugins,
                }
            },{
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                },
            }, {
                loader: 'import-glob-loader'
            }]
        }, {
            test: /\.art$/,
            use: [{
                loader: 'art-template-loader',
            }]
        }]
    },
    resolveLoader: {
        modules: resolveModules,
    },
    resolve: {
        extensions: ['.js', '.vue'],
        modules: resolveModules,
        alias: {
            js: path.join(config.paths.src, 'js'),
            scss: path.join(config.paths.src, 'scss'),
            tpl: path.join(config.paths.src, 'tpl'),
            common: path.join(config.paths.src, 'js/common'),
            component: path.join(config.paths.src, 'js/component'),
            page: path.join(config.paths.src, 'js/page'),
            vendor: path.join(config.paths.src, 'vendor')
            // 'v-component': path.join(config.paths.src, 'js/v-component'),
            // 'v-components': path.join(config.paths.src, 'js/v-components'), // 暂时兼容旧版项目
            // 'v-directive': path.join(config.paths.src, 'js/v-directive'),
            // 'v-filter': path.join(config.paths.src, 'js/v-filter'),
            // 'v-mixin': path.join(config.paths.src, 'js/v-mixin'),
            // 'v-plugin': path.join(config.paths.src, 'js/v-plugin'),
            // 'v-store': path.join(config.paths.src, 'js/v-store'),
            // 'site-config': path.join(config.paths.src, 'js/common/' + configFile),
            // 'build-util': path.join(__dirname, '../common/util.js')
        }
    },
    plugins: basePlugins,
    stats: {
        hash: false,
        version: true,
        timings: true,
        assets: false,
        chunks: true,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: true,
        publicPath: false,
    }
}

module.exports = baseWebpackConfig;