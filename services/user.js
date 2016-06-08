module.exports = function(app){
    return {
        setPseudo: function(data){
            this.pseudo = data;
        },
        joinRoom: function(data){
            this.join(data);
            this.activeRoom = data;
            if(app.socket.io.sockets.adapter.rooms[data].length > 1){
                this.manager = false;
                if(app.socket.io.sockets.adapter.rooms[data].disruptors.indexOf(this.pseudo) == -1){
                    app.socket.io.sockets.adapter.rooms[data].disruptors.push(this.pseudo)
                }
                else{
                    //TODO send error message : pseudo is already used in this room
                }
            }
            else{
                this.manager = true;
                app.socket.io.sockets.adapter.rooms[data].manager = this.pseudo;
                app.socket.io.sockets.adapter.rooms[data].disruptors = [];
            }
            console.log(app.socket.io.sockets.adapter.rooms[data].manager)
        console.log(app.socket.io.sockets.adapter.rooms[data].disruptors)
        }
    }
};