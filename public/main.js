var socket = io();

function createRoom(){
    user.room = $('#room').val();
    user.pseudo = $('#pseudo').val();
	socket.emit('joinRoom', user.room);
    socket.emit('changePseudo', user.pseudo)
}

$(function(){

	$('#createRoom').click(createRoom);
});

