/**
 * 更新静态资源版本
 * @author Paco
 */

const path = require('path');
const randomstring = require('randomstring');
const replace = require('replace');
const deployTag = randomstring.generate(7);

const argv = require('yargs').argv;
const project = argv.project;

let tplFilePaths = [path.join(__dirname, './config.js')];

replace({
    regex: '(deploy[\\w]+ = \')[\\w]+(\'; // deploy)',
    replacement: '$1' + deployTag + '$2',
    paths: tplFilePaths,
    recursive: true,
    silent: false,
});
