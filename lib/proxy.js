const { createProxyMiddleware } = require('http-proxy-middleware'); // 代理
const express = require('express')
const http = require('http');
const cors = require('cors')
const chalk = require('chalk');
const bodyParser = require('body-parser')

const { proxyLog } = require('./server');

const app = express()

const logList = [] // 存储log

// 创建 server
const httpService = http.createServer(app);

// 启动代理
const startProxyServer = (options = {}) => {
	let { target, path, proxyPort: port, host } = options
	try {
		// 允许所有域名跨域
		app.use(cors())
		app.all('*', function (req, res, next) {
			// 跨域请求CORS中的预请求
			if (req.method == "OPTIONS") {
				// res.send(200); //让options请求快速返回
			} else {
				if (res.req.url !== '/' && res.req.url !== '/proxy' && !res.req.url.includes('/public') && !res.req.url.includes('/favicon')) {
					proxyLog.data = { method: req.method, path: res.req.url }
					let log = { method: req.method, path: res.req.url }
					logList.push(log)
				}
			}
			next();
		});

		app.use(bodyParser.json());//数据JSON类型
		app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据
		app.set('host', host); // 设置 host

		let newPath = path.replace('/', ''); // 
		let config = {
			target,
			changeOrigin: true,
			pathRewrite: {}
		}
		config.pathRewrite[`^/${newPath}`] = '';
		// 服务器代理
		app.use(`/${newPath}`, createProxyMiddleware(config))

		httpService.listen(port, (res) => {
			console.log(chalk.green(`代理服务已启动  http://${host}:${port}`))

		})
	} catch (error) {
		console.log(chalk.red(error))
	}
}

// 停止代理
const stopProxyServer = (fn) => {
	httpService.close(() => {
		fn()
	})
}

module.exports = {
	startProxyServer,
	stopProxyServer
}




