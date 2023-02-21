const os = require('os');

//获取本机ip
function getIPAdress() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

// 数据劫持
function dataWatch(obj = {}, fn) {
    const proxy = new Proxy(obj, {
        get(target, propKey) {
            if (propKey in target) {
                return target[propKey]
            } else {
                throw new ReferenceError(`属性：${propKey} 不存在`)
            }
        },
        set(target, propKey, value) {
            target[propKey] = value
            fn(target)
            return true
        },
    })
    return proxy
}

module.exports = {
    getIPAdress,
    dataWatch
}