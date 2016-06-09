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
    socket.emit('createAction', {'station': _station, 'action': "greveSNCF"});
}

function openMenu(){
    var _station = $(this).data('id');
    var _actionId = $(this).data('actions');
    var _html = "";
    if(_actionId){
        if(_actionId.length>1){
            var _actionsArray = _actionId.split(',');
            for(key in _actionsArray){
                _html += '<li class="mdl-menu__item action" data-id="'+_actionsArray[key]+'">'+room.actions[_actionsArray[key]].name+'</li>';
            }
        }
        else{
           _html += '<li class="mdl-menu__item action" data-id="'+_actionId+'">'+room.actions[_actionId].name+'</li>';
        }

        $('#actionMenu').html(_html);
    }
    $('#actionMenu').attr('for',_station).css('clip', 'auto');
    $('.mdl-menu__container.is-upgraded').addClass('is-visible');
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
    $('.action').click(sendAction);


    new Clipboard('.shareLink', {
        text: function (trigger) {
            return location.href;
        }
    });

});


socket.on('newAction', function (data) {
    alert(data.user + ' a lancé ' + data.action + ' à ' + data.station);
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