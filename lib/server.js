const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
const inquirer = require('inquirer');
const open = require('open');
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http');

const ejs = require('ejs');
const shell = require('shelljs')

const express = require('express')
const app = express()

const promptList = require('./inquirerConfig'); // inquirer询问的集合

const { dataWatch } = require('../util')  // 数据劫持 proxy

const appDirectory = fs.realpathSync(__dirname)
const resolveApp = (relativePath) => path.resolve(appDirectory, `../${relativePath}`)

const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

const log = {
    method: "",
    path: "",
    data: {}
};

const proxyLog = dataWatch(log, (target) => {
    io.sockets.emit('log', target.data);
})

const server = async () => {
    console.log(process.cwd())
    console.log(resolveApp('src'))
    const answers = await inquirer.prompt(promptList) // 询问返回的结果 (prot, host)
    const { port, host } = answers
    try {
        // 允许所有域名跨域
        app.use(cors())
        app.use(bodyParser.json());//数据JSON类型
        app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据

        app.use('/public', express.static(resolveApp('src'))) // 设置虚拟静态资源路径
        app.set('views', resolveApp('src')); // 
        app.set('view engine', 'ejs');
        app.set('host', host); // 设置 host

        // 路由
        app.get('/', (req, res) => {
            res.render('index', { title: 'NSP UI 服务器代理' })
        })

        // 代理请求
        app.post('/proxy', (req, res) => {
            let { host: target, port: proxyPort, path = 'api' } = req.body // path的默认值为api
            require('./proxy').startProxyServer({ target, proxyPort, path, host }) // 创建服务代理
            res.send({
                method: 'started',
                path: `${target}${path} 已被 http://${host}:${proxyPort}${path} 代理`,
                wsUrl: `ws://${host}:${port}`
            })
        })

        // 停止服务
        app.post('/stop', (req, res) => {
            require('./proxy').stopProxyServer(() => {
                // io.close()
            })
            res.send({
                method: 'stopped',
                msg: `代理服务已停止`,
            })
        })

        httpServer.listen(port, (data) => {
            console.log(chalk.green(`服务已启动  http://${host}:${port}`))
            open(`http://${host}:${port}`);
        })
    } catch (error) {
        console.log(chalk.red(error))
    }
}

module.exports = {
    server,
    proxyLog
}

