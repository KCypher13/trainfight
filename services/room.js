module.exports = function (app) {
    return {
        createAction: function (data) {
            //TODO function checking if enough point
            var _socket = this;
            app.db.getStation(data.station, function(station){
               app.db.getAction(data.action, function(action){
                   app.socket.io.to(_socket.activeRoom).emit('newAction', {
                       station: station.name,
                       action: action.name,
                       user: _socket.pseudo
                   });
               })
            });

        },
        startGame: function (data) {
            var socket = this;
            app.db.getLines(function (lines) {
                app.db.getStationsFromLines(lines, function (data) {
                    app.socket.io.to(socket.activeRoom).emit('generateLine', data);
                });
            });
            app.db.getActions(function(actions){
                app.socket.io.to(socket.activeRoom).emit('hydrateActions', actions);
            });
        }
    }
};