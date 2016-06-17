var socket = io();

function checkUrl() {
    var _argPathname = window.location.pathname.substr(1).split('/');

    var _roomName = _argPathname[_argPathname.indexOf("room") + 1];
    if (_roomName) {
        var userData = {};
        localforage.getItem('socketId').then(function(socketid){
            if(socketid){
                userData.socketId = localforage.getItem('socketId');
                userData.role = localforage.getItem('role');
                localforage.getItem('role').then(function(role){
                    userData.role = role;
                    if(userData.role == "manager"){
                        $('#launcher').removeClass('hide');
                    }
                    else{
                        $('#joiner').removeClass('hide');
                    }
                    localforage.getItem('socketId').then(function(socketId){
                        userData.socketId = socketId;
                        room.joinRoom(_roomName, userData);
                    });
                });

                localforage.getItem('pseudo').then(function(pseudo){
                    user.changePseudo(pseudo);
                });
                localforage.getItem('role').then(function(role){
                    user.setRole(role);
                });
                localforage.getItem('availableAgent').then(function(availableAgent){
                    user.setAvailableAgent(availableAgent);
                });
                localforage.getItem('actionPoint').then(function(actionPoint){
                    user.setActionPoint(actionPoint);
                });

            }
            else{
                room.joinRoom(_roomName);
                $('#joiner').removeClass('hide');
            }
            $('#connexion').addClass('hide');
            $('#waitingRoom').removeClass('hide');

        });


    }
    else{
        localforage.clear();
    }
}


function createRoom(e) {
    if(e){
        e.preventDefault();
    }
    user.changePseudo($('#connexion #pseudo').val());
    room.joinRoom($('#roomName').val());

    $('#connexion').addClass('hide');
    $('#waitingRoom').removeClass('hide');
    $('#launcher').removeClass('hide');

}

function sendAction() {
    var _station = $(this).parent().parent().parent().data('id');
    var _action = $(this).data('id');
    socket.emit('createAction', {'station': _station, 'action': _action});
    closeMenu();
}

function sendReaction(){
    var _station = $(this).parent().parent().parent().data('id');
    var _reaction = room.reactions[$(this).data('id')];
    if(!_reaction.asRecovery){
        var _nbAgent = prompt('combien d\'agent à envoyer ?');
        if(_nbAgent > user.availableAgent){
            alert('Vous n\'avez pas assez d\'agents');
        }
        else{
            socket.emit('createReaction', {'station': _station, 'reaction': _reaction, 'nbAgents': _nbAgent});
        }
    }
    else{
        socket.emit('createReaction', {'station': _station, 'reaction': _reaction});
    }

    closeMenu();
}

function closeMenu(){
    $('.customMenu').remove();
}

function openMenu(){
    var _station = $(this).parent().data('id');
    var _stationName = $(this).parent().data('name');
    var _lineStation = $(this).parent().data('line');
    var _actionId = $(this).parent().data('actions');
    var _actionMenu = $('#actionMenu');
    var _html = '<div class="customMenu"><div class="triangle"></div><p class="stationName">'+_stationName+'</p><p class="stationLine">'+_lineStation+'</p><ul>';

    if(user.role == 'disruptor'){
        _html += generateDisruptorMenu(_actionId, _station);
    }
    else{
       _html +=  generateManagerMenu(_station);
    }
    _html += "</ul></div>";

    closeMenu();
    $(this).parent().append(_html);
}

function generateDisruptorMenu(actionId, stationId){
    var _html = "";
    if(room.actionInProgress[stationId]){
        _html += "operation en cours";
    }
    else if(actionId){
        if(actionId.length>1){
            var _actionsArray = actionId.split(',');
            for(key in _actionsArray){

                if(room.actions[_actionsArray[key]].cost > user.actionPoint){
                    _html += '<li class="action disable" data-id="'+_actionsArray[key]+'">'+room.actions[_actionsArray[key]].name+'</li>';
                }
                else{
                    _html += '<li class="action" data-id="'+_actionsArray[key]+'">'+room.actions[_actionsArray[key]].name+'</li>';
                }

            }
        }
        else{
            if(room.actions[actionId].cost > user.actionPoint) {
                _html += '<li class="action disable" data-id="' + actionId + '">' + room.actions[actionId].name + '</li>';
            }
            else{
                _html += '<li class="action" data-id="' + actionId + '">' + room.actions[actionId].name + '</li>';
            }
        }

    }
    return _html;
}

function generateManagerMenu(stationId){
    var _html = "";
    if(room.reactionInProgress[stationId]){
        _html += "operation en cours";
    }
   else if(room.actionInProgress[stationId]){
        for(key in room.reactions){
            var _reaction = room.reactions[key];

            if(_reaction.actions.indexOf(room.actionInProgress[stationId].action.id) >-1){
                if(room.reactionUsed && room.reactionUsed[room.actionInProgress[stationId].action.id]){
                    _html += '<li class="reaction disable" data-id="'+_reaction.id+'">'+_reaction.name+'</li>';
                }
                else{
                    _html += '<li class="reaction" data-id="'+_reaction.id+'">'+_reaction.name+'</li>';
                }

            }
        }

    }else{
        _html += "Tout vas bien";
    }
    return _html;
}

function setPseudo(){
    user.changePseudo($('#waitingRoom #pseudo').val());
}

function startGame(){
    socket.emit('startGame');
}

function notification(message){
    var _data;
    var snackbarContainer = document.querySelector('#notificationSnackbar');
    if (typeof(message) == "string") {
        _data = {message: message};
        snackbarContainer.MaterialSnackbar.showSnackbar(_data);
    }
}

function initializeHeaderMap(){
    var heightHeaderMap = $('.mapInformations').height();
    return heightHeaderMap;
}

$(function () {
    checkUrl();
    $('#createRoom').click(createRoom);



    $('body').on('click', '.station .buttonStation', openMenu);
    $('#joinGame').click(setPseudo);
    $('.startGame').click(startGame);
    $('body').on('click', '.action', sendAction);
    $('body').on('click', '.reaction', sendReaction);




    new Clipboard('.shareLink', {
        text: function (trigger) {
            return location.href;
        }
    });

});


socket.on('newAction', function (data) {
    room.actionInProgress[data.station.id] = data;

    var _message = data.user+' a provoqué '+data.action.name+' à '+data.station.name;
    notification(_message);
    $('#'+data.station.id+' .buttonStation').addClass('animated pulse infinite '+data.action.class);
});

socket.on('newReaction', function (data) {
    room.reactionInProgress[data] = data;
    $('#'+data+' .buttonStation').addClass('reactionInProgress');
});

socket.on('actionSolved', function (data) {
    room.actionInProgress[data.station.id] = data;
    removeAllActionClass(data.station);
    delete room.actionInProgress[data.station];
    delete room.reactionInProgress[data.station]
});

function removeAllActionClass(station){
    $('#'+station+ ' .buttonStation').removeClass('animated pulse infinite greve signal lama aperitif horse bag reactionInProgress');
};

socket.on('playersList', function (data) {
    room.manager = data.manager;
    room.disruptors = data.disruptors;
    room.generatePlayerlist();
});

socket.on('generateLine', function(data){
    $('#waitingRoom').addClass('hide');
    $('#scoreEndGame').addClass('hide');
    $('#game').removeClass('hide');
    $('.container').addClass('reset');
    var heightHeaderMap = initializeHeaderMap();
    $('#mapGame').css('padding-top', heightHeaderMap+15);
    room.generateStation(data);
    room.reInit();
});

socket.on('hydrateActions', function(actions){
    room.actions = actions;
});

socket.on('hydrateReaction', function(reactions){
    room.reactions = reactions
});

socket.on('initisalisePoint', function(data){
    room.setSatisfaction(data.satisfaction);
    room.startTime = data.startTime;
});

socket.on('changeActionPoint', function(data){
   user.setActionPoint(data);
});

socket.on('changeAvailableAgent',function(data){
    user.setAvailableAgent(data);
});

socket.on('changeSatisfaction', function(data){
   room.setSatisfaction(data);
});

socket.on('role', function(data){
    user.setRole(data);

});

socket.on('notification', notification);

socket.on('reactionUsed', room.setReactionUsed);

socket.on('stopGame', function (data) {
    console.log(data);
    $('#game').addClass('hide');
    $('#scoreEndGame').removeClass('hide');
    $('.container').removeClass('reset');
    $('.gameTime').text(data.gameTime);
    for(key in data.disruptors){
        var _disruptorId = (data.disruptors[key].socketId).replace('/#','');
        $('#scoreEndGame .'+_disruptorId+' .score').text(data.disruptors[key].score)
    }
});