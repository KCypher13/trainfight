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
            }
            else{
                this.manager = true;
            }

        }
    }
};