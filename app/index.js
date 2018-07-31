const express = require('express');
const logger = require('morgan');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const config = require('config');
//const history = require('connect-history-api-fallback');  //For single page app routing
const WEB = __dirname.replace('app', 'src');
const app = module.exports = express();
const api = require('./api');
const db = require('./db');
//const auth = require('./auth');

app.use(helmet());
app.use(logger(config.logFormat));
app.use(favicon(config.favicon));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Authenticate
//app.use(auth.authenticate);

// API router
app.use('/api', api);
//app.use(history());

// Vue & static assets
app.use(express.static(WEB.substring(0, WEB.length -3)));

// The Interwebz said to have the server only serve index.html when using routing on client-side
// app.get('*', function(req, res) {
//     res.status(201).sendFile(WEB.substring(0, WEB.length -3) + '/index.html');
// });

//Start Node Server
var server = app.listen(config.apiPort, function(err) {
    if (err) console.log(err);
    console.log(`\nNode server started.\nListening on port ${config.apiPort}...`);
});

process.on('SIGTERM', gracefulShutdown);//kill (terminate)
process.on('SIGINT', gracefulShutdown); //Ctrl+C (interrupt)


//Functions
function gracefulShutdown() {
    console.log('\nStarting Shutdown');
    db.end(function(err) {
        if (err) throw err;
        server.close(function() {
            console.log('\nShutdown Complete');
        });
    });
}