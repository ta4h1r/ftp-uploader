const AWS = require('aws-sdk');
AWS.config.update(
  {
    accessKeyId: "***",
    secretAccessKey: "***",
  }
);
const s3 = new AWS.S3({region: 'us-east-1'});
const ftp = require('basic-ftp');
const fs = require('fs');

let queue = [];
let savePathsLocal = [];
let savePathsRemote = [];

var params;

var fileNames;
var file;
var bucket;

var queueEmpty = true;

var j = 0;
const maxRetries = 1;

async function putItems(queue, res) {

    if (queue.length != 0) {
      queueEmpty = false;
      console.log("Files in queue: " + queue.length);
    }

    try {
      console.log("Downloading: " + queue[0].Key);
      file = await addItemToList(queue[0]);    // Resolved file buffer
    } catch (err) {
      console.log("Skipping file: " + queue[0].Key);
      skip(queue, res);
      return;
    }

    const savePathLocal = savePathsLocal[0];
    const savePathRemote = savePathsRemote[0];

    try {
      await fs.writeFile(savePathLocal, file, async function () {
        // if (err) throw err;
        console.log('Saved file to local directory: ' + savePathLocal);
        console.log('Uploading to server: ' + savePathRemote);

        const client = new ftp.Client();
        client.ftp.verbose = false;

        try {
            await client.access({
                host: "www.ctrlrobotics.com",
                port: 21,
                user: "***",
                password: "***",
                secure: false
            });
            await client.uploadFrom(savePathLocal, savePathRemote).then(async () => {
                await changePermissions(770, savePathRemote, client);
                await client.close();
                console.log("DONE");

                await fs.unlink(savePathLocal, async (err) => {
                  if (err) throw err;
                  console.log('Deleted file from local directory: ' + savePathLocal);

                  // Delete file from s3
                  s3.deleteObject(queue[0], (err, data) => {
                    if (err) console.log("Error deleting s3 object: " + err);
                    else {
                      // console.log(data);  data = {}
                      console.log("Deleted file from s3 bucket: " + queue[0].Key);

                      if (queue.length == 1) {
                        queueEmpty = false;
                        console.log("DONE ALL");
                      }

                      queue.shift();
                      savePathsLocal.shift();
                      savePathsRemote.shift();

                      // Don't continue if we're out of items.
                      if (queue.length != 0) {
                        queueEmpty = false;
                        putItems(queue, res);                     // Call again with the rest of the items.
                      } else {
                        queueEmpty = true;
                        return;
                      }

                    }

                  });

                });
            });
        } catch(err) {

          await client.close();
          console.log("FTP exception " + err);
          if (j < maxRetries) {
            console.log("Retry attempt: " + (j+1));
            retry(queue, res);
          } else {
            j = 0;
            console.log("Maximum retries (" + maxRetries + ") exhausted. Skipping file: " + queue[0].Key);
            skip(queue, res);
          }
          return;

        }
      });

    } catch (error) {

      // await client.close();
      // console.log("FTP exception " + err);
      // if (j < maxRetries) {
      //   console.log("Retry attempt: " + (j+1));
      //   retry(queue, res);
      // } else {
      //   j = 0;
      //   console.log("Maximum retries (" + maxRetries + ") exhausted. Skipping file: " + queue[0].Key);
      //   skip(queue, res);
      // }
      // return;

      await client.close();
      console.log("Write file exception " + error);
      restart();
      return;
    }

}


// VIEW ALL
exports.index = async (req, res) => {

  // For input with an array of filenames
  // const uploadDetails = await req.body;
	// fileNames = uploadDetails.fileNames;
  //
	// for (i = 0; i < fileNames.length; i++) {
  //   file = fileNames[i];
  //
    // params = {
    //   Bucket: "ftp-file-buffer",
    //   Key: file
    // }
  //
  //   console.log(params);
  //
  //   queue.push(params);
  //   savePathsLocal.push('temp/'+ file.split("/")[file.split("/").length -1]);
  //   savePathsRemote.push('Test/' + file.split("/")[file.split("/").length -1]);
  //
	// }

  uploadDetails = req.body;

  bucket = uploadDetails.bucket;
  file = uploadDetails.key;

  params = {
    Bucket: bucket,
    Key: file
  }

  console.log(params);

  queue.push(params);
  savePathsLocal.push('temp/'+ file.split("/")[file.split("/").length -1]);
  savePathsRemote.push('Test/' + file.split("/")[file.split("/").length -1]);

  if (queue.length == 0) {
    queueEmpty = true;
  }

  if (queueEmpty) {
    putItems(queue, res);
  }

  res.send({
    src: "ftp-handler/controller.js",
    statusCode: 200,
    message: "OK"
  });

};

function addItemToList(params) {
	return new Promise((res, rej) => {
		s3.getObject(params, (error, data) => {
			if (error != null) {
				console.log("Failed to retrieve an object: " + error);
        rej(error);
			} else {
				console.log("Loaded " + data.ContentLength + " bytes");
				// do something with data.Body
				res(data.Body);
			}
		});
	});
}

function changePermissions(perms, filepath, client) {
    let cmd = 'SITE CHMOD ' + perms.toString() + ' ' + filepath;
    return client.send(cmd, false);
}

function restart() {
  console.log("Restarting");
  queue = [];
  savePathsLocal = [];
  savePathsRemote = [];
  j = 0;
  queueEmpty = true;
  console.log("Files in queue: " + queue.length);
}

function retry(queue, res) {
  j += 1;
  if (queue.length != 0) {
    queueEmpty = false;
    putItems(queue, res);                     // Call again with the rest of the items.
  } else {
    queueEmpty = true;
    return;
  }
}

function skip(queue, res) {
  queue.shift();
  savePathsLocal.shift();
  savePathsRemote.shift();

  if (queue.length != 0) {
    queueEmpty = false;
    putItems(queue, res);                     // Call again with the rest of the items.
  } else {
    queueEmpty = true;
    console.log("DONE ALL");
    restart();
    return;
  }
}
