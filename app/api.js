const express = require('express');
const router = module.exports = express.Router();
const db = require('./db');
//const auth = require('./auth');
const TABLES = {
  aetnaConversions: "convl.conversion_summary",
  caresourceConversions: "convl.caresource_conversion_summary",
  anthemConversions: "convl.anthem_conversion_summary",
  agentRoster: "iex_data.nice_agentroster_table",
  agentStag: "iex_data.stag_adp_employeeinfo"
};

router.route('/me').get(function(req, res){
    res.status(200).send({name: "Joseph", age: 28});
});

router.route('/stats/:username').get(function(req, res){
    const username = req.params.username;

    db.query(`SELECT mu FROM ${TABLES.agentRoster} WHERE callpro_userid=${username};`, function(err, data){
        if (err) throw err;
        const client = data[0].mu.substring(0, data[0].mu.indexOf(' ')).toLowerCase();
        console.log(`SELECT * FROM ${TABLES[client + 'Conversions']} WHERE callpro_userid=${username} AND date LIKE "%2018-07%";`);
        db.query(`SELECT * FROM ${TABLES[client + 'Conversions']} WHERE employee_id="${username}" AND date LIKE "%2018-07%";`, function(err, rows){
            if (err) throw err;
            res.status(200).send(rows);
        });
    });
});