const express = require('express');
const router = module.exports = express.Router();
const db = require('./db');
//const auth = require('./auth');

router.route('/me').get(function(req, res){
    res.status(200).send({name: "Joseph"});
});

router.route('/stats').get(function(req, res){
    db.query(`SELECT * FROM convl.conversion_summary WHERE date LIKE "%2018-07%";`, function(err, rows){
        if (err) throw err;
        res.status(200).send(rows);
    });
});