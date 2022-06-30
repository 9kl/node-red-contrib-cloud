const fs = require('fs-extra');
const fspath = require('path');

function parseJSON(data) {
    if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1)
    }
    return JSON.parse(data);
}

function readFile(path, backupPath, emptyResponse, type) {
    return new Promise(function (resolve) {
        fs.readFile(path, 'utf8', function (err, data) {
            if (!err) {
                if (data.length === 0) {
                    try {
                        var backupStat = fs.statSync(backupPath);
                        if (backupStat.size === 0) {
                            return resolve(emptyResponse);
                        }

                        fs.copy(backupPath, path, function (backupCopyErr) {
                            if (backupCopyErr) {
                                resolve([]);
                            } else {
                                resolve(readFile(path, backupPath, emptyResponse, type));
                            }
                        });
                        return;
                    } catch (backupStatErr) {
                        return resolve(emptyResponse);
                    }
                }

                try {
                    return resolve(parseJSON(data));
                } catch (parseErr) {
                    return resolve(emptyResponse);
                }
            } else {
                if (type === 'flow') {
                    //log.info(log._("storage.localfilesystem.create",{type:type}));
                }
                resolve(emptyResponse);
            }
        });
    });
}

async function writeFile(path, content, backupPath) {
    var backupPromise;
    if (backupPath && fs.existsSync(path)) {
        backupPromise = fs.copy(path, backupPath);
    } else {
        backupPromise = Promise.resolve();
    }

    const dirname = fspath.dirname(path);
    const tempFile = `${path}.$$$`;

    await backupPromise;
    if (backupPath) {
    }
    await fs.ensureDir(dirname);
    await new Promise(function (resolve, reject) {
        var stream = fs.createWriteStream(tempFile);
        stream.on('open', function (fd) {
            stream.write(content, 'utf8', function () {
                fs.fsync(fd, function (err) {
                    if (err) {
                    }
                    stream.end(resolve);
                });
            });
        });
        stream.on('error', function (err_1) {
            //log.warn(log._("storage.localfilesystem.fsync-fail",{path: tempFile, message: err.toString()}));
            reject(err_1);
        });
    });
    return await new Promise(function (resolve_1, reject_1) {
        fs.rename(tempFile, path, err_2 => {
            if (err_2) {
                //log.warn(log._("storage.localfilesystem.fsync-fail",{path: path, message: err.toString()}));
                return reject_1(err_2);
            }
            //log.trace(`utils.writeFile - renamed ${tempFile} to ${path}`)
            resolve_1();
        });
    });
}

module.exports = {
    /**
    * Write content to a file using UTF8 encoding.
    * This forces a fsync before completing to ensure
    * the write hits disk.
    */
    writeFile: writeFile,
    readFile: readFile,
    parseJSON: parseJSON
}
