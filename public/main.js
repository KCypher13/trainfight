var socket = io();

function sendMessage(){
	var _v = $('input').val();
	socket.emit('send', _v);
	$('input').val("");
}

$(function(){
	$('button').click(sendMessage)
});

document.addEventListener('keyup', function(ev){
	if(ev.keyCode == 13){
		sendMessage();
	}
});


socket.on('receiveMsg', function(msg){
	$('ul').prepend('<li>'+msg+'</li>');
});