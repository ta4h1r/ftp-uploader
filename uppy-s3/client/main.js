const Uppy = require('@uppy/core');
const Dashboard = require('@uppy/dashboard');
// const XHRUpload = require('@uppy/xhr-upload');
// const Tus = require('@uppy/tus');
const AwsS3 = require('@uppy/aws-s3');

const uppy = Uppy({
  debug: true,
  meta: { something: 'xyz' }
})

uppy.use(Dashboard, {
  target: '#app',
  inline: true,
  hideRetryButton: true,
  hideCancelButton: true,
  theme: 'light',
  proudlyDisplayPoweredByUppy: false,
  showRemoveButtonAfterComplete: true,
  width: 750,
  height: 550,
  thumbnailWidth: 280,
  hideUploadButton: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  // locale: defaultLocale,
  hideCancelButton: false
});

uppy.use(AwsS3, {
 fields: [ ],
 getUploadParameters(file){                                                          // prepare request
    return fetch('http://xxx.xx.xxx.xxx:2001/api/get-url', {                         // send to server endpoint to return s3-signed url
       method: 'POST',
       headers: {
           'content-type': 'application/x-www-form-urlencoded',                      // examples I found via the Uppy site used 'content-type': 'application/json' and did not work
       },
       body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            metadata: {
                'name': file.meta['name'],
                'caption': file.meta['caption']
             },
       })
    }).then((response) => {
        return response.json();                                                         // server's response as a JSON promise
    }).then((data) => {
        // console.log('>>>', data);
        return {
           method: data.method,
           url: data.url,                                                               // Voila.
           fields: data.fields,
           //headers: data.headers
        };
    });
  },
});

uppy.on('complete', (result) => {
 if(result.successful){
   console.log('Uploaded files: ', result.successful);
  } else {
   console.log('Upload error: ', result.failed);
  }
});



// uppy.use(Tus, {
//   endpoint: 'https://1207a81e56c0.ngrok.io/upload', // use your tus endpoint here
//   resume: true,
//   autoRetry: true,
//   retryDelays: [0, 1000, 3000, 5000],
//   fieldName: 'files'
// })
