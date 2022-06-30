/**
 * 
 * Node-Red.Cloud
 * 流程和证书
 * 
 **/

const fs = require('fs-extra');
const fspath = require("path");

const util = require("./util");

var settings;
var runtime;
var initialFlowLoadComplete = false;

var flowsFile;
var flowsFullPath;
var flowsFileExists = false;
var flowsFileBackup;
var credentialsFile;
var credentialsFileBackup;

var usingHostName = "";


function getBackupFilename(filename) {
    var ffName = fspath.basename(filename);
    var ffDir = fspath.dirname(filename);
    return fspath.join(ffDir, "." + ffName + ".backup");
}

module.exports = {
    init: function (_settings, _runtime) {
        settings = _settings;
        runtime = _runtime;

        if (settings.flowFile) {
            flowsFile = settings.flowFile;
            // handle Unix and Windows "C:\" and Windows "\\" for UNC.
            if (fspath.isAbsolute(flowsFile)) {
                //if (((flowsFile[0] == "\\") && (flowsFile[1] == "\\")) || (flowsFile[0] == "/") || (flowsFile[1] == ":")) {
                // Absolute path
                flowsFullPath = flowsFile;
            } else if (flowsFile.substring(0, 2) === "./") {
                // Relative to cwd
                flowsFullPath = fspath.join(process.cwd(), flowsFile);
            } else {
                try {
                    fs.statSync(fspath.join(process.cwd(), flowsFile));
                    // Found in cwd
                    flowsFullPath = fspath.join(process.cwd(), flowsFile);
                } catch (err) {
                    // Use userDir
                    flowsFullPath = fspath.join(settings.userDir, flowsFile);
                }
            }
        } else {
            flowsFile = 'flows_' + require('os').hostname() + '.json';
            flowsFullPath = fspath.join(settings.userDir, flowsFile);
            usingHostName = true;
        }
        var ffExt = fspath.extname(flowsFullPath);
        var ffBase = fspath.basename(flowsFullPath, ffExt);

        flowsFileBackup = getBackupFilename(flowsFullPath);
        credentialsFile = fspath.join(settings.userDir, ffBase + "_cred" + ffExt);
        credentialsFileBackup = getBackupFilename(credentialsFile)

        return Promise.resolve();
    },
    getFlows: async function () {
        if (!initialFlowLoadComplete) {
            initialFlowLoadComplete = true;
            // 通过initialFlowLoadComplete判断第一次加载流文件的处理流程。
        }

        return util.readFile(flowsFullPath, flowsFileBackup, null, 'flow').then(function (result) {
            if (result === null) {
                flowsFileExists = false;
                return [];
            }
            flowsFileExists = true;
            return result;
        });
    },
    saveFlows: async function (flows) {
        console.log("saveFlows");
        if (settings.readOnly) {
            return
        }
        flowsFileExists = true;

        var flowData;
        if (settings.flowFilePretty) {
            flowData = JSON.stringify(flows, null, 4);
        } else {
            flowData = JSON.stringify(flows);
        }
        return util.writeFile(flowsFullPath, flowData, flowsFileBackup);

        /*
        return util.writeFile(flowsFullPath, flowData, flowsFileBackup).then(() => {
            return Promise.resolve();
        });
        */
    },
    getCredentials: async function (flows) {
        return util.readFile(credentialsFile, credentialsFileBackup, {}, 'credentials');
    },
    saveCredentials: async function (credentials) {
        console.log("saveCredentials");

        if (settings.readOnly) {
            return;
        }

        var credentialData;
        if (settings.flowFilePretty) {
            credentialData = JSON.stringify(credentials, null, 4);
        } else {
            credentialData = JSON.stringify(credentials);
        }
        return util.writeFile(credentialsFile, credentialData, credentialsFileBackup);
    }
}
