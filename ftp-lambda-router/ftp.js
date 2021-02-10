// FTP class suitable for single uploads only

'use strict';

const ftp = require('basic-ftp');
const fs = require('fs');
let access; 
let upload;
let permissions; 

class FTPClient {
    constructor(host = 'localhost', port = 21, username = 'anonymous', password = 'guest', secure = false) {
        this.client = new ftp.Client();
        this.settings = {
            host: host,
            port: port,
            user: username,
            password: password,
            secure: secure
        };
    }
	
    upload(sourcePath, remotePath, permissions) {
        let self = this;
        (async () => {
            try {
                access = await self.client.access(self.settings);
                upload = await self.client.upload(fs.createReadStream(sourcePath), remotePath);
                permissions = await self.changePermissions(permissions.toString(), remotePath);
            } catch(err) {
                console.log(err);
            }
            self.client.close();
        })();
    }

    close() {
        this.client.close();
    }

    changePermissions(perms, filepath) {
        let cmd = 'SITE CHMOD ' + perms + ' ' + filepath;
        return this.client.send(cmd, false);
    }
	
}

module.exports = FTPClient;