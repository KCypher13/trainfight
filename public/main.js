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


function createRoom() {
    user.changePseudo($('#connexion #pseudo').val());
    room.joinRoom($('#roomName').val());

    $('#connexion').addClass('hide');
    $('#waitingRoom').removeClass('hide');
    $('#launcher').removeClass('hide');

}

function sendAction() {
    var _station = $(this).data('id');
    socket.emit('createAction', {'station': _station, 'action': "greveSNCF"});
}

function setPseudo(){
    user.changePseudo($('#waitingRoom #pseudo').val());
}


$(function () {
    checkUrl();
    $('#createRoom').click(createRoom);
    $('.station').click(sendAction);
    $('#joinGame').click(setPseudo);


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