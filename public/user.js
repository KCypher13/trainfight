var user = {
    name: null,
    actionPoint: 0,
    availableAgent: 0,
    role: null,
    changePseudo: function (pseudo) {
        this.pseudo = pseudo;
        socket.emit('changePseudo', this.pseudo);
        localforage.setItem('pseudo', pseudo);
    },
    setActionPoint: function(point){
        this.actionPoint = point;
        $('.actionPoint').text('Nombre de points : '+point);
        localforage.setItem('actionPoint', point);
    },
    setAvailableAgent: function(agent){
        this.availableAgent = agent;
        $('.availableAgent').text('Nombre d\'agents disponibles : '+agent);
        localforage.setItem('availableAgent', agent);
    },
    setRole: function(role){
        this.role = role;
        if(role == "manager"){
            $('.actionPoint').css('display','none');
        }
        else{
            $('.availableAgent').css('display','none');
        }
        localforage.setItem('role', role);
        localforage.setItem('socketId', socket.id);
    }
};
