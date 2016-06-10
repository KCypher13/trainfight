module.exports = function(app){
    return {
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
            this.join(data);
            this.activeRoom = data;
            if(app.socket.io.sockets.adapter.rooms[data].length > 1){
                this.manager = false;
                app.socket.io.to(data).emit('playersList', {manager:app.socket.io.sockets.adapter.rooms[data].manager.pseudo, disruptors: app.socket.io.sockets.adapter.rooms[data].disruptors})
            }
            else{
                this.manager = true;
                app.socket.io.sockets.adapter.rooms[data].manager = {pseudo: this.pseudo, socketId: this.id, reactionUsed:{}};
                app.socket.io.sockets.adapter.rooms[data].disruptors = {};
                this.emit('playersList', {manager: this.pseudo, disruptors: {}});
                this.emit('role', 'manager');
            }
        }
    }
};