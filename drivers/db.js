var mysql      = require('mysql');

module.exports = function(app){
    return {
        connector : mysql.createConnection(app.config.db),
        getLines: function(cb){
            this.connector.query('SELECT * FROM line', function(err, rows, fields){
                if (err) throw err;
                if(cb){
                    cb(rows);
                }
            })
        },
        getStations: function(line, cb){
            this.connector.query('SELECT s.name, s.annualVisitors FROM `line` as l LEFT JOIN `lineStation` AS ls ON l.id = ls.lineId LEFT JOIN `station` AS s ON ls.stationId = s.id WHERE l.id = ?;', line, function(err, rows, fields) {
                if (err) throw err;
                if(cb){
                    cb(rows);
                }
            });

        }
    }

};


