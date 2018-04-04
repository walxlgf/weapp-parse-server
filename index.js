const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const app = express();

const {
  APP_ID,
  DATABASE_URI,
  MASTER_KEY,
  REST_API_KEY,
  CLIENT_KEY,
  READ_ONLY_MASTER_KEY
} = process.env;

const api = new ParseServer({
  appName: 'Timer',
  // databaseURI: 'mongodb://mongo-parse-server/', // Connection string for your MongoDB database
  databaseURI: DATABASE_URI,//'mongodb://mongo-parse-server:27017/timer', 
  cloud: __dirname + '/cloud/main.js', // Absolute path to your Cloud Code
  appId: APP_ID,
  masterKey: MASTER_KEY,
  // restAPIKey: REST_API_KEY,
  // clientKey: CLIENT_KEY,
  // readOnlyMasterKey: READ_ONLY_MASTER_KEY,
  serverURL: 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Game', 'Device','Pattern', 'Pin']
  },
  // push: {
  //   android: {
  //     senderId: GCM_SENDER_ID,
  //     apiKey: GCM_API_KEY
  //   },
  //   ios: [
  //     {
  //       pfx: PFX_PATH_DEV, // The filename of private key and certificate in PFX or PKCS12 format from disk
  //       passphrase: PFX_PASS_DEV, // optional password to your p12
  //       bundleId: APP_BUNDLE_ID, // The bundle identifier associate with your app
  //       production: false // Specifies which APNS environment to connect to: Production (if true) or Sandbox
  //     },
  //     {
  //       pfx: PFX_PATH_PROD, // Prod PFX or P12
  //       bundleId: PFX_PASS_PROD,
  //       production: true // Prod
  //     }
  //   ]
  // }
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

// app.listen(1337, () => {
//   console.log('parse-server running on port 1337.');
// });


app.get('/', (req, res) => res.redirect(301, '/parse'));

// app.listen(PORT, (err) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(`parse api listening on ${config.serverURL}`);
// });

// Initialize a LiveQuery server instance, app is the express app of your Parse Server
let httpServer = require('http').createServer(app);
let port = process.env.LIVEQUERY_PORT || 1337;
httpServer.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`httpServer api listening on ws://localhost: ${port}/parse`);
});
ParseServer.createLiveQueryServer(httpServer);
