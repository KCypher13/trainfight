var io = require('socket.io');

module.exports = function(app){
	return {
		io : null,
		init : function(){
			this.io = io(app.server.instance);
			this.listen();
		},
		listen : function(){
			this.io.on('connection', function (socket) {
				console.log('user connected');

				for(key in app.config.events){
					var _socketEvent = app.config.events[key];
					var _service 	= _socketEvent.method.split('::')[0];
					var _method 	= _socketEvent.method.split('::')[1];
					socket.on(_socketEvent.listener, app[_service][_method]);
				}
			});
		}
	}
}