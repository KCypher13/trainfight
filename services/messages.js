module.exports = function(app){
	return {
		publish : function(message){
			app.socket.io.emit('receiveMsg', message);
		}
	}
}