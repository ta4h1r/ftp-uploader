const fs = require("fs");
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fetch = require('node-fetch');

const baseUrlCtrl = 'http://xxx.xx.xxx.xxx:port' + '/api/send-file';

exports.handler = async (event) => {
    // TODO implement
    
    // console.log(event);
    
    const Bucket = event.Records[0].s3.bucket.name;
    var Key = event.Records[0].s3.object.key;
	
	decodeURIComponent(Key);
	
    var uploadDetails = {
    	bucket: Bucket,
    	key: Key
    };
    
    // console.log(uploadDetails);
    
    var res = await Promise.all([sendData(uploadDetails, 'POST', baseUrlCtrl)]);//, sendData(uploadDetails, 'POST', baseUrlDE), sendData(uploadDetails, 'POST', baseUrlAU)]);
    
    // console.log(res);

    return res;
};

// HTTP Request handler (returns a promise which resolves to the api response) 
function sendData(data, method, url) {
	if (method == 'GET') {
		return fetch(url, {
		  method: method, // POST, PUT, GET, DELETE
		  mode: 'cors',
		  headers: {
			//"Access-Control-Allow-Origin":"*",
			//"Access-Control-Allow-Methods":"OPTIONS,POST",
			//"Access-Control-Allow-Headers":"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
			"Content-Type":"application/json"
		  }
		}); 
	} else {
		return fetch(url, {
		  method: method, // POST, PUT, GET, DELETE
		  mode: 'cors',
		  headers: {
			//"Access-Control-Allow-Origin":"*",
			//"Access-Control-Allow-Methods":"OPTIONS,POST",
			//"Access-Control-Allow-Headers":"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
			"Content-Type":"application/json"
		  },
		  body: JSON.stringify(data)
		}); 
	}       
}
