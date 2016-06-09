module.exports = function(app){
  return {
      createAction: function(data){
          //TODO function checking if enough point
          app.socket.io.to(this.activeRoom).emit('newAction', {station: data.station, action: data.action, user: this.pseudo});
      },
      startGame: function(data){
          var dataToSend = {};
        app.db.getLines(function(lines){
            for(key in lines){
                (function(lineKey){
                    dataToSend[lines[lineKey].id] = {};
                    dataToSend[lines[lineKey].id].stations = {};
                    app.db.getStations(lines[lineKey].id, function(stations){
                        dataToSend[lines[lineKey].id].stations = stations;
                        console.log(dataToSend);
                    })
                })(key)

            }
        });
      }
  }
};