const https = require("https");
const { createHmac } = require("crypto");

const BinanceApiHttps = (function () {
    const parseParams = (data) => {
        try {
            var tempArr = [];
            for (var i in data) {
                var key = encodeURIComponent(i);
                var value = encodeURIComponent(data[i]);
                tempArr.push(key + '=' + value);
            }
            var urlParamsStr = tempArr.join('&');
            return urlParamsStr;
        } catch (err) {
            return '';
        }
    }

    const getQueryString = (data) => {
        data = data || {};
        let timestamp = new Date().getTime() - 3000;
        data.recvWindow = 60000;
        data.timestamp = timestamp.toString();
        let querystring = parseParams(data);

        // 对querystring加密生成签名
        let hmac = createHmac("sha256", conf.security_key);
        let signature = hmac.update(querystring).digest('hex');
        data.signature = signature;

        // 对签名后的querydata生成新的带签名的querystring
        let signatureQuerystring = parseParams(data);
        // console.log(signatureQuerystring);
        return signatureQuerystring;
    };

    const request = function (method, path, data) {
        return new Promise(function (resolve, reject) {
            let querystring = getQueryString(data);
            const options = {
                hostname: "fapi.binance.com",
                port: 443,
                method: method,
                path: `${path}?${querystring}`,
                headers: {
                    'Content-Type': "application/json",
                    'X-MBX-APIKEY': conf.api_key
                }
            };

            console.log(options.path);
            const req = https.request(options, res => {
                console.log(`http code:${res.statusCode}`);
                let data = [];
                res.on('data', d => {
                    data.push(d);
                });

                res.on('end', () => {
                    let buffer = Buffer.concat(data);
                    if (res.statusCode === 200) {
                        resolve(buffer.toString());
                    } else {
                        reject(buffer.toString());
                    }
                })
            });

            req.on('error', err => {
                reject(err);
            })
            req.end();
        });
    };


    const Constructor = function (path) {
        this.path = path;

        this.post = (data) => {
            return request("POST", path, data);
        };

        this.get = (data) => {
            return request("GET", path, data);
        };

        this.delete = (data) => {
            return request("DELETE", path, data);
        };

        this.put = (data) => {
            return request("PUT", path, data);
        };
    };
    return Constructor;
})();

const getFlows = () => {

};

const saveFlows = (flows) => {
    let data = {
        symbol: symbol, side: "BUY", type: "MARKET", quantity: quantity, positionSide: 'SHORT', newClientOrderId: newClientOrderId
    };
    const api = new BinanceApiHttps('/fapi/v1/order');
    return api.post(data);
};

const getCredentials = () => {

};


const saveCredentials = (credentials) => {

};

const getSettings = () => {

};

const saveSettings = (settings) => {

};

const getSessions = () => {

};

const saveSessions = (sessions) => {

};

const getLibraryEntry = (type, name) => {

};

const saveLibraryEntry = (type, name, meta, body) => {

};



module.exports = {
    getFlows, saveFlows, getCredentials, saveCredentials, getSettings, saveSettings,
    getSessions, saveSessions, getLibraryEntry, saveLibraryEntry
};