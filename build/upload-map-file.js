const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 配置 CMS 每个年份文件夹对应的 fundebug api key
const cmsAPIKey = {
    'ACT-2017': '9d4e9de772b5555cc9b4b2fec974c88b67f0660e44b96b8cb57ae4e1728f96e6',
    'ACT-2018': '18e09f074590b886e467bd3015b1b66f815372c7c49ea39e6afb66e8c0089f6e',
};

let total = 0;                      // 需要上传 Source Map 文件总数, 仅用于 console.log 输出进度
let curr = 0;                       // 已经上传 Source Map 文件总数, 仅用于 console.log 输出进度

let config;                         // 构建环境的配置信息
let projectDistPath;                // 项目 dist 目录
let projectStaticPublicPath;        // 项目对应的公共静态资源目录
let projectMonitorAPIKey;           // fundebug api key

function doUpload(files) {
    return new Promise((resolve, reject) => {
        if (!projectMonitorAPIKey) {
            reject(new Error('apikey 为空, 请检查项目目录下的 build.config.js 是否配置了 monitorApikey.'));
            return;
        }
        if (files.length > 0) {
            let file = files.shift();
            curr ++;
            console.log(`Uploading file for ${file} (${curr}/${total})`);
            uploadMapFile(file).then(() => {
                console.log(`Upload success for ${file} (${curr}/${total})`);
                return doUpload(files);
            }).then(() => {
                resolve('Upload finished!');
            }).catch(err => {
                reject(err);
            });
        } else {
            resolve();
        }
    });
};

function uploadMapFile(file) {
    let formData = {
        'apikey': projectMonitorAPIKey,
        'sourceMap': fs.createReadStream(path.join(projectDistPath, file)),
    };
    let option = {
        url: 'https://fundebug.com/javascript/sourcemap/upload',
        formData: formData,
    };
    return request.post(option);
};

function getApiKey(projectPath) {
    if (process.env.isACT) {
        let year = projectPath.split('/cms/')[1].split('/')[0];
        let projectName = `ACT-${year}`;
        return cmsAPIKey[projectName];
    } else {
        return config.buildConfig.monitorApikey;
    }
};

module.exports = function (projectPath) {
    // 动态加载 config.js 文件, 如果放在头部, 会因为 bin/mfex-build 没有执行导致 process.env.* 的变量没有赋值
    config = require('./config.js');
    projectStaticPublicPath = config.buildConfig.staticPublicProjectPath;
    projectDistPath = path.join(projectStaticPublicPath || projectPath, 'dist');
    projectMonitorAPIKey = getApiKey(projectPath);

    console.log(chalk.green('projectPath =', projectPath));
    console.log(chalk.green('projectStaticPublicPath =', projectStaticPublicPath));
    console.log(chalk.green('projectDistPath =', projectDistPath));
    console.log(chalk.green('projectMonitorAPIKey =', projectMonitorAPIKey), '\n');

    if (!config.buildConfig.sourceMap) {
        console.log(`项目目录下 [${projectPath}]\nbuild.config.js 配置文件中 sourceMap 值为 false, 无需上传 Source Map 文件.`);
        return Promise.resolve();
    }
    if (!fs.existsSync(projectDistPath)) {
        console.log(chalk.red(`项目目录下 [${projectPath}] 不存在 dist 目录, 没有上传任何文件.`));
        return Promise.resolve();
    }
    let files = fs.readdirSync(projectDistPath);
    files = files.filter(file => {
        return /\.js\.map$/.test(file);
    });
    if (files.length === 0) {
        console.log(chalk.red(`[${projectDistPath}] 目录下并没有 Source Map 文件, 没有上传任何文件.`));
        return Promise.resolve();
    }
    total = files.length;
    return doUpload(files, projectDistPath, projectMonitorAPIKey).then(msg => {
        return msg;
    });
};
