var config = require('config');

var app = {
	root : __dirname,
	config : config
};

app.server = require('./drivers/server')(app);
app.routes = require('./drivers/routes')(app);
app.socket = require('./drivers/socket')(app);
app.user = require('./services/user')(app);
app.server.create();
