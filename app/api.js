const express = require('express');
const router = module.exports = express.Router();
const ldapOptions = require('config').ldap;
const ldap = require('ldapjs');         // http://ldapjs.org/client.html
const db = require('./db');
const TABLES = {
  aetna: {
      table: "convl.conversion_summary",
      date: "date",
      returnFields: [{field: "product", as: "product"}, {field: "type", as: "callerType"}, {field: "enrollment", as: "enrollment"}, {field: "home_appt", as: "hv"}, {field: "lacb", as: "lacb"}, {field: "non_opp", as: "opportunity"}]
  },
  caresource: {
      table: "convl.caresource_conversion_summary",
      date: "interaction_date",
      returnFields: [{field: "product", as: "product"}, {field: "type", as: "callerType"}, {field: "enrollment", as: "enrollment"}, {field: "home_appt", as: "hv"}, {field: "lacb", as: "lacb"}, {field: "opp", as: "opportunity"}]
  },
  anthem: {
      table: "convl.anthem_conversion_summary",
      date: "interaction_datetime",
      returnFields: [{field: "interaction_datetime", as: "datetime"}, {field: "campaign_name", as: "product"}, {field: "call_termination_type", as: "dispo"}, {field: "enrollment", as: "enrollment"}, {field: "conversion", as: "conversion"}, {field: "opportunity", as: "opportunity"}]
  },
  agentRoster: { table: "iex_data.nice_agentroster_table" },
  agentStag: { table: "iex_data.stag_adp_employeeinfo" }
};

function dateFormat(date){
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();
    return [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('-');
}

function get(query, nameForData){
    return new Promise(function(resolve, reject){
        db.query(query, function(err, rows){
            if (err) reject(err);
            if (!nameForData) resolve(rows);
            let data = {};
            data[nameForData] = rows;
            resolve(data);
        });
    });
}

function veryBasicEncryption(str){
    let encrypted = Buffer.from(str).toString('base64');
    encrypted = Buffer.from(encrypted + 'Monkeys are bananas').toString('base64');
    return encrypted;
}

function veryBasicDecryption(str){
    let decrypted = Buffer.from(str, 'base64').toString();
    decrypted = Buffer.from(decrypted.replace('Monkeys are bananas', ''), 'base64').toString();
    return decrypted;
}

router.route('/login').post(function(req, res){
    if (!req.hasOwnProperty('body')) res.sendStatus(401);
    if (req.body.username == null || req.body.password == null) res.sendStatus(401);
    if(!ldap) res.sendStatus(401);

    let client = ldap.createClient(ldapOptions.connstr);
    client.bind(`CN=${req.body.username},${ldapOptions.base}`, req.body.password, (err) => {
        if(err) res.sendStatus(401);
        else res.status(201).send({username: req.body.username});
    });
});

router.route('/me').post(function(req, res){
    const query = `
        SELECT stag.givenName AS name, stag.username, nice.mu AS client, nice.callpro_userid AS userid
        FROM iex_data.stag_adp_employeeinfo AS stag, 
             iex_data.nice_agentroster_table AS nice 
        WHERE stag.positionStatusCode NOT IN ('T', 'D')
            AND nice.skill_team != 'Inactive'
            AND stag.positionID = nice.adp_id
            AND stag.username = '${req.body.username}';
    `;
    get(query)
        .then( function(data){
            let user = data[0];
            user.site = user.client.substr(user.client.indexOf(' ') + 1);
            user.client = user.client.substr(0, user.client.indexOf(' '));
            user.hash = veryBasicEncryption(user.userid);
            res.status(201).send(user)
        })
        .catch( err => res.sendStatus(401) );
});

router.route('/stats/:client/:id').get(function(req, res){
    const id = req.params.id.toLowerCase();
    const client = req.params.client.toLowerCase();
    const hash = req.headers['x-authentication'];
    const table = TABLES[client];
    const aepStartDate = '2018-07-01';  //TODO: update this to actual first day -- set for testing value
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = dateFormat(yesterday);

    //Authorization
    if (id != veryBasicDecryption(hash)) {
        res.sendStatus(403);
        return;
    }

    //Make queries into promises to resolve them all as one
    const yesterdayPromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as).join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date})="${yesterday}";`, 'yesterday');
    const aepToDatePromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as).join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date}) > "${aepStartDate}";`, 'aepToDate');
    const TodayPromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as, '').join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND DATE(${table.date})=CURDATE();`, 'today');
    Promise.all([TodayPromise, yesterdayPromise, aepToDatePromise])
        .then( data => {
            if (client.toLowerCase() === "anthem") {
                for (let set of data) {
                    set[Object.keys(set)[0]].forEach(function (el) {     //due to the data structure, we have to find the object attribute name to access the data
                        //convert campaign_name into a valid product field
                        if (el.product.includes('- MA')) el.product = "MA";
                        else if (el.product.includes('- PDP')) el.product = "PDP";
                        else el.product = "None";

                        //convert call_termination_type HPA to plan change and T2 to New Enrollment

                    })
                }
            }

            //Convert data array to an associative array
            let conversions = {};
            for (let i = 0; i < data.length; i++) Object.assign(conversions, data[i])

            res.status(200).send(conversions)
        })
        .catch( err => console.log(err) );
});