/**
 * 配置处理
 * @author zenglinxiang
 */

 'use strick';

const argv = require('yargs').argv;
const slash = require('slash');
const path = require('path');
const ip = require('ip');
const extend = require('node.extend');
const readlineSync = require('readline-sync');

const isProduction = process.env.NODE_ENV === 'production';
const projectPath = process.env.projectPath;
const srcPath = path.join(projectPath, 'src');
const defaultStaticPublicProjectPath = path.join(projectPath, 'dist');

// 接收具体项目工程化配置
const projectBuildConfig = require(path.join(projectPath, 'build.config'));
let defaultInjectAllTPL = path.join(__dirname, '/tpl/index.tpl');
let defaultInjectStylesTPL = path.join(__dirname, '/tpl/styles.tpl');
let defaultInjectScriptsTPL = path.join(__dirname, '/tpl/scripts.tpl');

let defaultInjectAllTarget = path.join(projectPath, 'index.html');
let defaultInjectStylesTarget = path.join(projectPath, 'styles.html');
let defaultInjectScriptsTarget = path.join(projectPath, 'scripts.html');

// 默认配置，为以后工程化做准备
let defaultEntry = {
    app: path.join(srcPath, 'js/app.js'),
    vendor: path.join(srcPath, 'js/vendor.js'),
};

let defaultBuildConfig = {
    entry: defaultEntry,    // 配置入口文件
    projectRelativePath: '/projectRelativePath/',  // 配置项目的相对路径
    outputNamingPattern: 'hash',    // 输出命名方式
    devServerPort: 'random',    // 端口号生成方式
    enableIPHost: true,     // 是否允许通过ip调试
    sourceMap: false,   // 开启sourcemap
    dropConsole: true,  // 打包之后是否去掉 console.log
    staticPublicProjectPath: defaultStaticPublicProjectPath,    // 打包后代码路径
    cdnHost: 'static-src.4399.cn',  // 静态资源域名
    assetHost: 'static-src.4399.cn', // 输出静态文件域名
    dllConfig: {}
};

const buildConfig = extend(defaultBuildConfig, projectBuildConfig);

// buildConfig.htmlWebpackPlugin.forEach((item) => {
//     item.template =  path.join(__dirname, item.template);
// })
if (process.env.staticPublicProjectPath) {
    // 优先取命令行参数
    buildConfig.staticPublicProjectPath = process.env.staticPublicProjectPath;
}

let assetsRelativePath = slash(path.join(buildConfig.projectRelativePath, 'asset/'));

let devServerPort = Math.floor(Math.random() * 9000) + 1000; // 随机生成端口号，避免多项目同时开发时端口被占用（极端情况下会出现重复端口，重新运行命令即可）
let devServerHost = 'localhost';

let publicPath = "";
let cdnHost = buildConfig.cdnHost || '';
let cdnHostTemplate = buildConfig.cdnHostTemplate;
if (isProduction) {
    // 配置 cdn host
    // cdnHost / cdnHostTemplate 值协商
    console.log(cdnHost)
    if (!(typeof cdnHost === 'string' && cdnHost.length > 0)) {
        if ('cdnHostTemplate' in buildConfig) {
            if (!(typeof cdnHostTemplate === 'string' && cdnHostTemplate.length > 0)) {
                console.log('你在 build.config 指定了 cdnHostTemplate，但为不合法值，这意味着你需要自己补全模板的 cdnHost，确定请按回车继续进行构建。');
                readlineSync.question('> ');
            } else {
                cdnHost = cdnHostTemplate;
            }
        } else {
            // 做点询问
            console.log('build.config 配置中的 cdnHost 为但为不合法值，且没有配置模板变量 cdnHostTemplate，你可以输入对应的模板变量来进行下一步');
            let res = readlineSync.question('> ');
            cdnHostTemplate = res;
            cdnHost = cdnHostTemplate;
            console.log('你输入的 cdnHostVariable 为：' + cdnHostTemplate);
            console.log('如果你想之后的构建不再弹出该询问，请在 build.config 中设置好后端的模板变量 cdnHostVariable。')
        }
    }

    // assetsHost / assetsURL 值协商
    if (!(typeof assetsHost === "string" && assetsHost.length > 0)) {

        // 如果 cdnHost 等于 cdnHostTemplate 那么就意味着进入了用后端模板控制链接的模式
        if (cdnHostTemplate === cdnHost) {
            assetsHost = "";
            // css 的 assetsURL 为相对路径
            assetsURLCSS = slash("../asset/");
            assetsURLJS = slash(path.join(assetsHost, assetsRelativePath)); // 兼容 Unix/Windows 路径分隔符
        } else {
            assetsHost = cdnHost;
            assetsURL = slash(path.join(assetsHost, assetsRelativePath));
            assetsURLCSS = assetsURL;
            assetsURLJS = assetsURL;
        }
    }

    // 兼容 Unix/Windows 路径分隔符
    // 注意：会被打包到打包文件的路径都要考虑系统分隔符的差异
    publicPath = slash(path.join(cdnHost, buildConfig.projectRelativePath, 'dist/'));
} else {
    if (buildConfig.enableIPHost) {
        devServerHost = ip.address();
    }

    if (buildConfig.devServerPort !== 'random' && !isNaN(buildConfig.devServerPort)) {
        devServerPort = buildConfig.devServerPort;
    }

    cdnHost = devServerHost;
    assetsRelativePath = 'asset';
    assetsHost = `${devServerHost}:${devServerPort}`;
    publicPath = `${devServerHost}:${devServerPort}/`;
    assetsURL = `${assetsHost}/${assetsRelativePath}/`;
    assetsURLCSS = assetsURL;
    assetsURLJS = assetsURL;
}

let distName = 'dist';
let distPath = buildConfig.staticPublicProjectPath ?
    path.join(buildConfig.staticPublicProjectPath, distName) :
    path.join(projectPath, distName);

exports.paths = {
    projectPath: projectPath,
    assetsHost: assetsHost,
    assetsRelativePath: assetsRelativePath,
    assetsURLCSS: assetsURLCSS,
    assetsURLJS: assetsURLJS,
    src: srcPath,
    dist: distPath,
    publicPath: publicPath,
};

exports.inject = {
    defaultInjectAllTPL,
    defaultInjectStylesTPL,
    defaultInjectScriptsTPL,
    defaultInjectAllTarget,
    defaultInjectStylesTarget,
    defaultInjectScriptsTarget,
};

exports.buildConfig = buildConfig;
exports.deployTag = 'eUZZbGl'; // deployTag
exports.devServerPort = devServerPort;
exports.isProduction = isProduction;