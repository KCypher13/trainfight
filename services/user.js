module.exports = function(app){
    return {
        activeStation:null,
        activeReaction:null,
        setPseudo: function(data){

            var _room = (app.socket.io.sockets.adapter.rooms[this.activeRoom]) ? app.socket.io.sockets.adapter.rooms[this.activeRoom] : null;


            if (_room) {
                this.pseudo = data;

                _room.disruptors[this.id] = ({pseudo: this.pseudo, socketId: this.id, actionPoint: 10, score: 0});
                app.socket.io.to(this.activeRoom).emit('playersList', {manager:_room.manager.pseudo, disruptors: _room.disruptors});
                this.emit('role', 'disruptor');
            }
            else if (!_room) {
                this.pseudo = data;
            }
            else {
                //TODO send error message : pseudo is already used in this room
                console.log('error, pseudo is already used');
            }


        },
        joinRoom: function(data){
            var _socket = this;
            _socket.join(data.room);
            _socket.activeRoom = data.room;

            var _activeRoom = app.socket.io.sockets.adapter.rooms[data.room];
            if(data.userData){
                var _oldSocket = '/#'+data.userData.socketId;
                app.socket.io.to(data.room).emit('playersList', {manager:app.socket.io.sockets.adapter.rooms[data.room].manager.pseudo, disruptors: app.socket.io.sockets.adapter.rooms[data.room].disruptors});
                if(data.userData.role == "manager"){
                    _activeRoom.manager.socketId = _socket.id
                }
                else{
                    var _disruptors = app.socket.io.sockets.adapter.rooms[data.room].disruptors;
                    for(key in _disruptors){
                        if(_disruptors[key].socketId == _oldSocket){
                            _disruptors[_socket.id] = _disruptors[key];
                            _disruptors[_socket.id].socketId = _socket.id;
                            delete _disruptors[key];
                        }
                    }
                    for(key in _activeRoom.actionInProgress){
                        if(_activeRoom.actionInProgress[key].user == _oldSocket){
                            console.log('test');
                            _activeRoom.actionInProgress[key].user = _socket.id;
                        }
                    }
                }
                if(app.socket.io.sockets.adapter.rooms[data.room].startTime){
                    app.room.sendMap(function(data){
                        _socket.emit('generateLine', data);
                    });
                    app.db.getActions(function (actions) {
                        _socket.emit('hydrateActions', actions);
                    });
                    if(data.userData.role == "manager"){
                        app.db.getReactions(function (reactions) {
                            _socket.emit('hydrateReaction', reactions);
                        });
                    }
                }

            }
            else if(app.socket.io.sockets.adapter.rooms[data.room].length > 1){
                this.manager = false;
                app.socket.io.to(data.room).emit('playersList', {manager:app.socket.io.sockets.adapter.rooms[data.room].manager.pseudo, disruptors: app.socket.io.sockets.adapter.rooms[data.room].disruptors})
            }
            else{
                this.manager = true;
                app.socket.io.sockets.adapter.rooms[data.room].manager = {pseudo: this.pseudo, socketId: this.id, reactionUsed:{}};
                app.socket.io.sockets.adapter.rooms[data.room].disruptors = {};
                this.emit('playersList', {manager: this.pseudo, disruptors: {}});
                this.emit('role', 'manager');
            }
        }
    }
};