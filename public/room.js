var room = {
    name: null,
    manager: null,
    disruptors: null,
    joinRoom: function (roomName) {
        this.name = roomName;
        socket.emit('joinRoom', this.name);
        var stateObj = {page: "waitingRoom"};
        history.pushState(stateObj, "Room" + this.name, "/room/" + this.name);
    },
    generatePlayerlist: function(){
        $('.manager').text(this.manager);
        for(key in this.disruptors){
            $('.disruptors').append('<li>'+this.disruptors[key]+'</li>')
        }
    }
};