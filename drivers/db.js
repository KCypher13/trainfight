var mysql = require('mysql');
var async = require('async');
module.exports = function (app) {
    return {
        connector: mysql.createConnection(app.config.db),
        getLines: function (cb) {
            this.connector.query('SELECT * FROM line', function (err, rows, fields) {
                if (err) throw err;
                if (cb) {
                    cb(rows);
                }
            })
        },
        getStationsFromLines: function (lines, cb) {
            var lineWithStations = {};
            async.forEachOf(lines, function (value, key, callback) {
                    lineWithStations[value.id] = {};
                    lineWithStations[value.id].name = value.name;
                    app.db.connector.query('SELECT s.* FROM `line` as l LEFT JOIN `lineStation` AS ls ON l.id = ls.lineId LEFT JOIN `station` AS s ON ls.stationId = s.id WHERE l.id = ?;', value.id, function (err, rows, fields) {
                        if (err) throw err;
                        app.db.getActionsFromStations(rows, function (stationsWithActions) {
                            lineWithStations[value.id].stations = stationsWithActions;
                            callback()
                        })
                    });
                },
                function (err) {
                    if (cb) {
                        cb(lineWithStations)
                    }
                });
        },
        getActionsFromStations: function (stations, cb) {
            var stationsWithActions = {};
            async.forEachOf(stations, function (value, key, callback) {
                app.db.connector.query('SELECT actionId FROM stationAction WHERE stationId = ?', value.id, function (err, rows, fields) {
                    if (err) throw err;
                    var refactedRows = [];
                    for (key in rows) {
                        refactedRows.push(rows[key].actionId);
                    }
                    value.actions = refactedRows;
                    stationsWithActions[value.id] = value;
                    callback();
                });
            }, function (err) {
                if (cb) {
                    cb(stationsWithActions);
                }
            });
        },
        getActions: function (cb) {
            this.connector.query('SELECT * FROM action', function (err, rows, fields) {
                if (err) throw err;
                var actions = {};
                for (key in rows) {
                    actions[rows[key].id] = rows[key];
                }
                if (cb) {
                    cb(actions);
                }
            })
        },
        getAction: function (actionId, cb) {
            this.connector.query('SELECT * FROM action WHERE id = ?', actionId, function (err, rows, fields) {
                if (err) throw err;
                if(cb){
                    cb(rows[0]);
                }
            });
        },
        getStation: function (stationId, cb) {
            this.connector.query('SELECT * FROM station WHERE id = ?', stationId, function (err, rows, fields) {
                if (err) throw err;
                if(cb){
                    cb(rows[0]);
                }
            });
        }
    }

};


