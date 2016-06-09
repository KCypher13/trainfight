var user = {
    name: null,
    actionPoint: 0,
    availableAgent: 0,
    role: null,
    changePseudo: function (pseudo) {
        this.pseudo = pseudo;
        socket.emit('changePseudo', this.pseudo);
    },
    setActionPoint: function(point){
        this.actionPoint = point;
        $('.actionPoint').text(point);
    },
    setAvailableAgent: function(agent){
        this.availableAgent = agent;
        $('.availableAgent').text(agent);
    }
};
