const config = require('config');
const mysql = require('mysql');

//Connect to MySQL Database
var con;

function handleDisconnect(){
    con = mysql.createConnection(config.mysql);
    con.connect(function(err) {
        if (err) {
            console.error('error connecting to MySQL: ' + err.stack);
            return;
        }
        console.log('connected to MySQL as id ' + con.threadId);
    });
    con.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnecting to server...');
            handleDisconnect();
        }
        else throw err;
    });
}
handleDisconnect();

module.exports = con;