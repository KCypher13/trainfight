var socket = io();

function createRoom(){
    user.room = $('#roomName').val();
    user.pseudo = $('#pseudo').val();

	socket.emit('joinRoom', user.room);
    socket.emit('changePseudo', user.pseudo);
    $('#connexion').addClass('hide');
    $('#waitingRoom').removeClass('hide');

    var stateObj = { page: "waitingRoom" };
    history.pushState(stateObj, "Room"+user.room, "#"+user.room);

}

function sendAction(){
    var _station = $(this).data('id');
    $('#actionMenu').attr('for',_station).css('clip', 'auto');
    $('.mdl-menu__container.is-upgraded').addClass('is-visible');
    socket.emit('createAction', {'station': _station, 'action': "greveSNCF"});
}



$(function(){

	$('#createRoom').click(createRoom);
    $('.station').click(sendAction);

    new Clipboard('.shareLink', {
        text: function(trigger) {
            return location.href;
        }
    });

});



socket.on('newAction', function(data){
    alert (data.user+' a lancé '+ data.action +' à '+data.station);
});