var room = {
    name: null,
    manager: null,
    disruptors: null,
    actions : {},
    reactions :{},
    actionInProgress:{},
    joinRoom: function (roomName) {
        this.name = roomName;
        socket.emit('joinRoom', this.name);
        var stateObj = {page: "waitingRoom"};
        //history.pushState(stateObj, "Room" + this.name, "/room/" + this.name);
    },
    generatePlayerlist: function(){

        $('.manager').text(this.manager);
        for(key in this.disruptors){
            $('.disruptors').append('<li class="mdl-list__item"><span class="mdl-list__item-primary-content"><i class="material-icons mdl-list__item-avatar">person</i><span>'+this.disruptors[key].pseudo+'</span></span></li>')
        }
    },
    generateStation: function(lines){
        var _html = "";
        for(key in lines){
            var _line = lines[key];
            var _stations = _line.stations;
            for(key in _stations){
                var _station = _stations[key];
                _html += '<div id='+_station.name+' class="station mdl-button mdl-js-button mdl-button--icon" data-id="'+_station.id+'" data-name="'+_station.name+'" data-line="'+_line.name+'" ';
                if(_station.actions.length>0){
                    _html += 'data-actions="';
                    for(key in _station.actions){
                        if(key != 0){
                            _html += ","+_station.actions[key];
                        }
                        else{
                            _html += _station.actions[key];
                        }
                    }
                    _html += '"';
                }
                _html += ' style="top:'+_station.locationY+'px;left:'+_station.locationX+'px">';
                _html += '<div class="markerProgress hide"><p>100%</p></div>';
                _html += '<p>'+_station.name+'</p>';
                _html += '</div>';
            }
        }
        $('.mapLine').html(_html);
    },
    setSatisfaction: function(satisfaction){
        this.satisfaction = satisfaction;
        $('.satisfaction').text(satisfaction);
    }
};