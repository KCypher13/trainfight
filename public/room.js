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
    },
    generateStation: function(lines){
        var html = "";
        for(key in lines){
            var line = lines[key];
            var stations = lines[key].stations;
            for(key in stations){
                var station = stations[key];
                html += '<div id='+station.name+' class="station mdl-button mdl-js-button mdl-button--icon" data-name="'+station.name+'" data-line="'+line.name+'">';
                html += '<div class="markerProgress hide"><p>100%</p></div>';
                html += '<p>'+station.name+'</p>';
                html += '</div>';
            }
        }
        $('.mapLine').html(html);

    }
};