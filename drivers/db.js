var mysql   = require('mysql');
var async   = require('async');
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
        getStationsFromLines: function(lines, cb){
            var lineWithStations = {};
            async.forEachOf(lines, function(value, key, callback){
                lineWithStations[value.id] = {};
                lineWithStations[value.id].name = value.name;
                app.db.connector.query('SELECT s.* FROM `line` as l LEFT JOIN `lineStation` AS ls ON l.id = ls.lineId LEFT JOIN `station` AS s ON ls.stationId = s.id WHERE l.id = ?;', value.id, function(err, rows, fields) {
                    if (err) throw err;
                    lineWithStations[value.id].stations = rows;
                    callback();
                });
            },
            function(err){
                if(cb){
                    cb(lineWithStations)
                }
            });
        }
    }

};


