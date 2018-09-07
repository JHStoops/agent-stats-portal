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

const anthemStatsQuery = `
    count( * ) AS calls,
    sum( 
        if (stag.jobValue = "Licensed Healthcare Agent", 
            if (conv.opportunity AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0), 
            if (conv.opportunity AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0) 
        )
    ) AS opportunities,
    sum( 
        if (stag.jobValue = "Licensed Healthcare Agent", 
            if (conv.conversion AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0), 
            if (conv.enrollment AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0) 
        )
    ) AS totalEnrollments,
    sum( 
        if( conv.campaign_name LIKE "%T2%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS t2,
    sum( 
        if( conv.campaign_name LIKE "%HPA%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS hpa,
    sum( 
        if( conv.campaign_name LIKE "%MA%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS mapd,
    sum( 
        if( conv.campaign_name LIKE "%PDP%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS pdp,
    sum( 
        if( conv.campaign_name LIKE "%AE%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS ae,
    sum( 
        if( conv.campaign_name LIKE "%MS" AND campaign_name NOT LIKE "%MS NON-GI%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS ms,
    sum( 
        if( conv.campaign_name LIKE "%MS NON-GI%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS 'ms non-gi',
    sum( 
        if( conv.campaign_name LIKE "%DNSP%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS dnsp,
    sum( 
        if( conv.campaign_name LIKE "%ABCBS%", 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion, 1, 0), 
                if (conv.enrollment, 1, 0) 
            ),
            0
        ) 
    ) AS abcbs,
    (
        sum( 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.conversion AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0), 
                if (conv.enrollment AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0) 
            )
        )
        /
        sum( 
            if (stag.jobValue = "Licensed Healthcare Agent", 
                if (conv.opportunity AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0), 
                if (conv.opportunity AND conv.campaign_name REGEXP 't2|hpa|ma|pdp|ae|ms|dnsp|abcbs', 1, 0) 
            )
        ) * 100
    ) AS convRate
`;

module.exports = {con, anthemStatsQuery};