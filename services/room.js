module.exports = function (app) {
    return {
        createAction: function (data) {
            //TODO function checking if enough point
            app.socket.io.to(this.activeRoom).emit('newAction', {
                station: data.station,
                action: data.action,
                user: this.pseudo
            });
        },
        startGame: function (data) {
            var socket = this;
            app.db.getLines(function (lines) {
                app.db.getStationsFromLines(lines, function (data) {
                    app.socket.io.to(socket.activeRoom).emit('generateLine', data);
                });

            });
        }
    }
};