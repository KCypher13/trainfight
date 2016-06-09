var socket = io();

function checkUrl() {
    var _argPathname = window.location.pathname.substr(1).split('/');

    var _roomName = _argPathname[_argPathname.indexOf("room") + 1];
    if (_roomName) {
        room.joinRoom(_roomName);
        $('#connexion').addClass('hide');
        $('#waitingRoom').removeClass('hide');
        $('#joiner').removeClass('hide');
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
    var _station = $(this).parent().attr('for');
    var _action = $(this).data('id');
    socket.emit('createAction', {'station': _station, 'action': _action});
}

function sendReaction(){
    var _station = $(this).parent().attr('for');
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

    }
}

function openMenu(){
    var _station = $(this).data('id');
    var _actionId = $(this).data('actions');


    if(user.role == 'disruptor'){
        generateDisruptorMenu(_actionId, _station);
    }
    else{
        generateManagerMenu(_station);
    }

    $('#actionMenu').attr('for',_station).css('clip', 'auto');
    $('.mdl-menu__container.is-upgraded').addClass('is-visible');
}

function generateDisruptorMenu(actionId, stationId){
    var _html = "";
    var _actionMenu = $('#actionMenu');
    if(room.actionInProgress[stationId]){
        _html += "operation en cours";
    }
    else if(actionId){
        if(actionId.length>1){
            var _actionsArray = _actionId.split(',');
            for(key in _actionsArray){
                _html += '<li class="mdl-menu__item action" data-id="'+_actionsArray[key]+'">'+room.actions[_actionsArray[key]].name+'</li>';
            }
        }
        else{
            _html += '<li class="mdl-menu__item action" data-id="'+actionId+'">'+room.actions[actionId].name+'</li>';
        }

        _actionMenu.html(_html);
    }
}

function generateManagerMenu(stationId){
    var _html = "";
    var _actionMenu = $('#actionMenu');
    if(room.actionInProgress[stationId]){
        for(key in room.reactions){
            var _reaction = room.reactions[key];

            if(_reaction.actions.indexOf(room.actionInProgress[stationId].action.id) >-1){
                _html += '<li class="mdl-menu__item reaction" data-id="'+_reaction.id+'">'+_reaction.name+'</li>';
            }
        }

    }else{
        _html += "tout vas bien";
    }
    _actionMenu.html(_html);
}

function setPseudo(){
    user.changePseudo($('#waitingRoom #pseudo').val());
}

function startGame(){
    socket.emit('startGame');
}

$(function () {
    checkUrl();
    $('#createRoom').click(createRoom);
    $('body').on('click', '.station', openMenu);
    $('#joinGame').click(setPseudo);
    $('#startGame').click(startGame);
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
});

socket.on('playersList', function (data) {
    room.manager = data.manager;
    room.disruptors = data.disruptors;
    room.generatePlayerlist();
});

socket.on('generateLine', function(data){
    $('#waitingRoom').addClass('hide');
    $('#game').removeClass('hide');
    room.generateStation(data);
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
    user.role = data;
});

socket.on('notification', function(message){
    alert(message);
});