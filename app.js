var config = require('config');

var app = {
	root : __dirname,
	config : config
};

app.server = require('./drivers/server')(app);
app.routes = require('./drivers/routes')(app);
app.socket = require('./drivers/socket')(app);
app.messages = require('./services/messages')(app);
app.server.create();
