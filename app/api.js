const express = require('express');
const router = module.exports = express.Router();
const ldapOptions = require('config').ldap;
const ldap = require('ldapjs');         // http://ldapjs.org/client.html
const db = require('./db');
const TABLES = {
  aetna: {
      table: "convl.conversion_summary",
      date: "date",
      returnFields: [{field: "product", as: "product"}, {field: "type", as: "callerType"}, {field: "enrollment", as: "enrollment"}, {field: "home_appt", as: "hv"}, {field: "lacb", as: "lacb"}, {field: "rsvp", as: "rsvp"}, {field: "non_opp", as: "opportunity"}]
  },
  caresource: {
      table: "convl.caresource_conversion_summary",
      date: "interaction_date",
      returnFields: [{field: "product", as: "product"}, {field: "type", as: "callerType"}, {field: "enrollment", as: "enrollment"}, {field: "home_appt", as: "hv"}, {field: "lacb", as: "lacb"}, {field: "opp", as: "opportunity"}]
  },
  anthem: {
      table: "convl.anthem_conversion_summary",
      date: "interaction_datetime",
      returnFields: [{field: "interaction_datetime", as: "datetime"}, {field: "campaign_name", as: "product"}, {field: "call_termination_type", as: "dispo"}, {field: "call_termination_id", as: "dispoID"}, {field: "enrollment", as: "enrollment"}, {field: "conversion", as: "conversion"}, {field: "opportunity", as: "opportunity"}]
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
        db.con.query(query, function(err, rows){
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

    if (req.body.username.toLowerCase() === "admin" && req.body.password === "Connexion2019") res.status(201).send({username: req.body.username, hash: 'nuicsdj89fhsd789fnsdui'});
    else {
        let client = ldap.createClient(ldapOptions.connstr);
        client.bind(`CN=${req.body.username},${ldapOptions.base}`, req.body.password, (err) => {
            if(err) res.sendStatus(401);
            else res.status(201).send({username: req.body.username});
        });
    }
});

router.route('/me').post(function(req, res){
    const query = `
        SELECT stag.givenName AS name, stag.username, IF(stag.jobValue = "Licensed Healthcare Agent", true, false) AS licensed, nice.mu AS client, nice.callpro_userid AS userid
        FROM iex_data.stag_adp_employeeinfo AS stag, 
             iex_data.nice_agentroster_table AS nice 
        WHERE stag.positionStatusCode NOT IN ('T', 'D')
            AND nice.mu NOT LIKE '%Inactive'
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
    const client = req.params.client.toLowerCase().replace('%20', ' ');
    const hash = req.headers['x-authentication'];
    const table = TABLES[client];
    const aepStartDate = '2018-10-01';  //TODO: update this to actual first day -- set for testing value
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = dateFormat(yesterday);

    //Authorization
    if (id != veryBasicDecryption(hash)) {
        res.sendStatus(403);
        return;
    }


    function startOfWeek() {
        const date = new Date();
        const diff = date.getDate() - date.getDay();
        const firstDay = new Date(date.setDate(diff));
        return firstDay.getFullYear() + '-' + (firstDay.getMonth() + 1) + '-' + firstDay.getDate();
    }

    //Make queries into promises to resolve them all as one
    const yesterdayPromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as).join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND ${table.date} > "${yesterday}" AND ${table.date} < curdate();`, 'Yesterday');
    const aepToDatePromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as).join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND ${table.date} > "${aepStartDate}";`, 'AEP To Date');
    const TodayPromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as, '').join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND ${table.date} > curdate();`, 'Today');
    let weeklyPromise = get(`SELECT ${table.returnFields.map( val => val.field + ' AS ' + val.as).join(', ')} FROM ${table.table} WHERE employee_id="${id}" AND ${table.date} > "${startOfWeek()}" AND ${table.date} < curdate();`, 'This Week');

    let promises = [TodayPromise, yesterdayPromise, aepToDatePromise];
    if (client === 'anthem') promises.push(weeklyPromise);

    Promise.all(promises)
        .then( data => {
            //Convert data array to an associative array
            let conversions = {};
            for (let i = 0; i < data.length; i++) Object.assign(conversions, data[i])

            //Change timezone to MST to work with power hour
            conversions['AEP To Date'].map( el => {
               const date = new Date(el.datetime);
               const MSTDate = new Date(date.getTime() - 21600000);
               el.datetime = MSTDate.toJSON();
            });

            res.status(200).send(conversions)
        })
        .catch( err => console.log(err) );
});

router.route('/siteEnrollments/:client/:site').get(function(req, res){
    //Grab all stats for a client by site
    const client = req.params.client.toLowerCase().replace('%20', ' ');
    const site = req.params.site.toLowerCase().replace('%20', ' ');
    const startDate ='2018-10-01';
    const table = TABLES[client];

    const query = `
        SELECT 
            sum( if(conv.product = "MA" AND conv.type = "P" AND conv.enrollment = 1, 1, 0) ) AS mane
            ${ (client === 'aetna') ? ', sum( if(product = "PDP" AND type = "P" AND enrollment = 1, 1, 0) ) AS pdpne' : ''}
        FROM iex_data.nice_agentroster_table AS nice, ${ table.table } AS conv
        WHERE nice.callpro_userid = conv.employee_id
            AND conv.${table.date} > "${ startDate }"
            AND nice.mu LIKE "%${site}%";
    `;

    db.con.query(query, function(err, rows){
        if (err) console.log(err);
        res.status(201).send(rows);
    });
});

router.route('/report/:client/:site/:startDate/:endDate?').get(function(req, res){
    //Grab all stats for a client by site
    const client = req.params.client.toLowerCase().replace('%20', ' ');
    const site = req.params.site.toLowerCase().replace('%20', ' ');
    const startDate = req.params.startDate;
    const endDate = req.params.endDate ? req.params.endDate : null;
    const username = req.headers['username'];
    const table = TABLES[client];

    const query = `
    SELECT stag.familyName AS lastName, stag.givenName AS firstName, nice.callpro_userid AS userid, IF(stag.jobValue = "Licensed Healthcare Agent", true, false) AS licensed,
    ${table.returnFields.map(val => val.field + ' AS ' + val.as).join(', ')} 
    FROM iex_data.stag_adp_employeeinfo AS stag, iex_data.nice_agentroster_table AS nice, ${ table.table } AS conv
    WHERE stag.positionID = nice.adp_id
        AND nice.callpro_userid = conv.employee_id
        AND stag.positionStatusCode != 'T'
        AND stag.homeWorkLocationCity = "${ site }"
        AND conv.${table.date} > "${ startDate }"
        ${ endDate !== null ? 'AND conv.' + table.date + ' <= "' + endDate + '"' : '' }
        ${ username !== undefined ? 'AND stag.username = "' + username + '"' : '' };
    `;

    db.con.query(query, function(err, rows){
        if (err) console.log(err);
        res.status(201).send(rows);
    });
});