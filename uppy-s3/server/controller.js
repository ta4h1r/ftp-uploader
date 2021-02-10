const AWS = require('aws-sdk');
AWS.config.update(
  {
    accessKeyId: "***",
    secretAccessKey: "***",
  }
);
const s3 = new AWS.S3({region: 'us-east-1'});

exports.index = async (req, res) => {

  // The stuff for which we want a signed url
  const params = {
  	Metadata: { 'uploadDateUTC': Date() },
  	Bucket: 'ftp-buffer',
  	//Key: `testFold/${Date.now().toString()}-${JSON.parse(Object.keys(req.body)[0]).filename}`,  // Fancy naming if you want
  	Key: `testFold/${JSON.parse(Object.keys(req.body)[0]).filename}`,    // file destination
  	ContentType: JSON.parse(Object.keys(req.body)[0]).contentType
  };

  s3.getSignedUrl('putObject', params, (err, url) => { // get the pre-signed URL from AWS - if you alter this URL, it will fail
     console.log("Here: ", url);
     res.status(200).json({                   // send response to client
         method: 'put',
         url,                                 // signed URL
         fields: {},                          // You're asking me?
         //headers: {'x-amz-tagging': combinedTags} // here we add the tags we created above
     });
  });

  /* res.send({
    src: "controller.js",
    statusCode: 200,
    message: "OK"
  }); */

};
