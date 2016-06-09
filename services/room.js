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
            app.room.initialisePoint(socket.activeRoom);

        },
        initialisePoint: function(activeRoomName){
            var _activeRoom = app.socket.io.sockets.adapter.rooms[activeRoomName];
            _activeRoom.satisfaction = 10000;
            _activeRoom.manager.availableAgent = _activeRoom.disruptors.length*5;
            _activeRoom.startTime = Date.now();

            app.socket.io.to(activeRoomName).emit('initisalisePoint', {satisfaction : _activeRoom.satisfaction, startTime : _activeRoom.startTime});

            for(key in _activeRoom.disruptors){
                var _disruptor = _activeRoom.disruptors[key];
                app.socket.io.sockets.connected[_disruptor.socketId].emit('changeActionPoint', _disruptor.actionPoint);
            }

            app.socket.io.sockets.connected[_activeRoom.manager.socketId].emit('changeAvailableAgent', _activeRoom.manager.availableAgent);
        }

    }
};