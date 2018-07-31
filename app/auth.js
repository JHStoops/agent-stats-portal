const LOGIN_query = 'SELECT id, password, salt, domainuser FROM users WHERE username = ?';
const ADD_TOKEN = 'INSERT INTO tokens(user_id, token) VALUES(?,?)';
const common = require('./common');
const ldap = require('ldapjs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./models/User');

function verifyToken(token) {
    // TODO: remove me! skip auth, use admin
    // return new Promise( (resolve) => {resolve(1);});

    if(!token) {
        return Promise.reject('no token sent');
    }

    let s = {
        sql: 'SELECT user_id from tokens where token = ?',
        values: [token]
    };

    return new Promise( (resolve, reject) => {
        common.query(s).then( (result) => {
            if(result.length != 1) {
                console.error('token not found');
                return reject();
            }
            resolve(result[0].user_id);
        });
    });
}

function authenticate(req, res, next) {
    if(req.url == '/api/login') {
        next();
    }
    // else if(!req.headers.hasOwnProperty('x-authentication')) {
    // 	res.sendStatus(401);
    // }
    else {
        verifyToken(req.headers['x-authentication']).then( (user_id) => {
            if(!user_id || isNaN(user_id)) {
                console.error('bad user_id: ' + user_id);
                res.sendStatus(401);
                return;
            }
            common.findById(User, user_id, null, true).then( (result) => {
                req.user = result;
                next();

            });
        }).catch( (err) => {
            console.error(err);
            res.sendStatus(401);
        });
    }
}


function generateToken(user_id) {
    let token = crypto.randomBytes(32).toString('hex');
    return common.query(ADD_TOKEN, [user_id, token]).then( () => {
        return({'token': token});
    }).catch( (error) => {
        console.error(error);
        throw Error(error);
    });
}

function login(req, res) {
    let username;
    let password;

    try {
        username = req.body.username;
        password = req.body.password;
    } catch(error) {
        console.error('Failed to parse body' + req.body);
    }

    if(username == null || password == null) {
        res.sendStatus(401);
        return;
    }

    common.query(LOGIN_query, [username]).then( (rows) => {
        if(rows.length != 1) {
            res.sendStatus(401);
            return;
        }
        let row = rows[0][User.tableName];
        // Do they have a domain user linked?
        if(ldap != null && row.domainuser != null && row.domainuser.length > 0) {
            let client = ldap.createClient(ldapOptions.connstr);

            client.bind(`CN=${row.domainuser},${ldapOptions.base}`, password, (err) => {
                if(err) {
                    console.error(err);
                    res.sendStatus(401);
                    return;
                }
                generateToken(row.id)
                    .then( (token) => {
                        res.send(token);
                    });
            });
        }
        // Use their stored password instead
        // TODO: maybe make this fall through if it fails on domain auth, at least if it can't hit the server
        else {


            bcrypt.compare(password+row.salt, row.password, function(err, result) {
                if(err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }
                if(result) {
                    generateToken(row.id)
                        .then( (token) => {
                            res.send(token);
                        });
                }
                else {
                    res.sendStatus(401);
                }
            });
        }
    }).catch( (error) => {
        console.error('error logging in');
        console.error(error);
        res.sendStatus(500);
        return;
    });
}


module.exports = { authenticate, login };
