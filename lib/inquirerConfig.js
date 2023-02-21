const { getIPAdress } = require('../util');

let iPAdress = getIPAdress() // 获取本机ip


const promptList = [{
    type: 'input',
    message: "请输入端口号",
    name: "port",
    default: 3000
},{
    type: 'list',
    message: "请选择要启动的地址",
    name: "host",
    choices: [ // 
        {name: "localhost",value: 'localhost'},
        {name: "IP",value: iPAdress}
    ],
    default: 'localhost'
}];


module.exports = promptList