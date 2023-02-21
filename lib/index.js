
const fs = require('fs');
const chalk = require('chalk');
const program = require('commander');
const version = require('../package.json').version // 当前的版本
const { server } = require('./server')

module.exports = () => {
    program
        .version(chalk.green(version))
        .option('-v, --version', '当前的版本')
        .option('-h, --help', '帮助')
        .usage('<command> [options]')

    program
        .command('ui') // 命令
        .description('nsp ui node服务器代理工具')  // 描述
        .action(server)

    program.parse(process.argv) // 主进程的参数 获取命令的参数
}

