var express = require('express');
var appExpress = express();
var http = require('http');

module.exports = function(app){
	return {
		instance : null,
		create : function(){
			this.instance =  http.Server(appExpress);
			app.routes.create(appExpress, express);
			if(app.config.socket){
				app.socket.init();
			}
			this.listen();
		},
		listen : function(){
			this.instance.listen(3000, function(){
				console.log('Server listening on *:3000');
			});
		}
	}

}