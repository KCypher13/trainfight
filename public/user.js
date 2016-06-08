var user = {
    name: null,
    changePseudo: function (pseudo) {
        this.pseudo = pseudo;
        socket.emit('changePseudo', this.pseudo);
    }
};
