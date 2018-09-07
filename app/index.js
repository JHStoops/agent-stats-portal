const express = require('express');
const logger = require('morgan');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const config = require('config');
const WEB = __dirname.replace('app', 'src');
const app = module.exports = express();
const api = require('./api');
const db = require('./db');

app.use(helmet());
app.use(logger(config.logFormat));
app.use(favicon(config.favicon));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API router
app.use('/api', api);

// Vue & static assets
app.use(express.static(WEB.substring(0, WEB.length -3)));

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
    db.con.end(function(err) {
        if (err) throw err;
        server.close(function() {
            console.log('\nShutdown Complete');
        });
    });
}