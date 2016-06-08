var socket = io();

function createRoom(){
    user.room = $('#roomName').val();
    user.pseudo = $('#pseudo').val();

	socket.emit('joinRoom', user.room);
    socket.emit('changePseudo', user.pseudo);
    $('#connexion').addClass('hide');
    $('#game').removeClass('hide');
}

function sendAction(){
    var _station = $(this).data('id');
    socket.emit('createAction', {'station': _station, 'action': "greveSNCF"});
}

$(function(){

	$('#createRoom').click(createRoom);
    $('.station').click(sendAction);
});

socket.on('newAction', function(data){
    alert (data.user+' a lancé '+ data.action +' à '+data.station);
});