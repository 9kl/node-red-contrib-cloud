/**
 * 
 * Node-Red.Cloud
 * 回话
 * 
 **/

const fs = require('fs-extra');
const fspath = require("path");

const log = require('./log');
const util = require("./util");

var sessionsFile;
var settings;

module.exports = {
    init: function (_settings) {
        console.log("sessions init");
        settings = _settings;
        sessionsFile = fspath.join(settings.userDir, ".sessions.json");
    },
    getSessions: async function () {
        console.log("sessions getSessions");
        return new Promise(function (resolve, reject) {
            fs.readFile(sessionsFile, 'utf8', function (err, data) {
                if (!err) {
                    try {
                        return resolve(util.parseJSON(data));
                    } catch (err2) {
                        log.trace("损坏的会话文件,正在重置.");
                    }
                }
                resolve({});
            })
        });
    },
    saveSessions: async function (sessions) {
        console.log("sessions saveSessions");
        if (settings.readOnly) {
            return;
        }
        return util.writeFile(sessionsFile, JSON.stringify(sessions));
    }
}
