const express = require('express');
const router = module.exports = express.Router();
const db = require('./db');
//const auth = require('./auth');
const TABLES = {
  aetna: {
      table: "convl.conversion_summary",
      date: "date",
      returnFields: ["product", "type", "enrollment", "home_appt", "lacb", "non_opp"],
      additionalWhere: [""]},
  caresource: {
      table: "convl.caresource_conversion_summary",
      date: "interaction_date",
      returnFields: ["product", "type", "enrollment", "home_appt", "lacb", "opp"],
      additionalWhere: [""]},
  anthem: {
      table: "convl.anthem_conversion_summary",
      date: "interaction_datetime",
      returnFields: ["campaign_name", "conversion", "enrollment", "opportunity"],
      additionalWhere: ["(campaign_name LIKE \"T%- MA%\" OR campaign_name LIKE \"T%- PDP%\")"]},
  agentRoster: {table: "iex_data.nice_agentroster_table"},
  agentStag: {table: "iex_data.stag_adp_employeeinfo"}
};

router.route('/me').get(function(req, res){
    res.status(200).send({name: "Joseph", age: 28});
});

function dateFormat(date){
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [date.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('-');
}

function get(nameForData, query){
    return new Promise(function(resolve, reject){
        db.query(query, function(err, rows){
            if (err) throw err;
            console.log('it finished');
            let data = {};
            data[nameForData] = rows;
            resolve(data);
        });
    });
}

router.route('/stats/:client/:id').get(function(req, res){
    const id = req.params.id;
    const client = req.params.client;
    const table = TABLES[client];
    const AEPStartDate = '2018-07-01';  //TODO: update this to actual first day -- set for testing value
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = dateFormat(yesterday);

    // Make queries into promises to resolve them all as one
    const yesterdayPromise = get('yesterday', `SELECT ${table.returnFields.join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date})="${yesterday}" ${(table.additionalWhere.length) ? 'AND' : ''} ${table.additionalWhere.join(' AND ')};`);
    const AEPtoDatePromise = get('AEPtoDate', `SELECT ${table.returnFields.join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date}) > "${AEPStartDate}" ${(table.additionalWhere.length) ? 'AND' : ''} ${table.additionalWhere.join(' AND ')};`);
    const TodayPromise = get('today', `SELECT ${table.returnFields.join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date})=CURDATE() ${(table.additionalWhere.length) ? 'AND' : ''} ${table.additionalWhere.join(' AND ')};`);
    Promise.all([TodayPromise, yesterdayPromise, AEPtoDatePromise])
        .then( data => res.status(200).send(data) )
        .catch( err => console.log(err) );
});