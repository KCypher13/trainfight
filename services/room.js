module.exports = function(app){
  return {
      createAction: function(data){
          //TODO function checking if enough point
          console.log(app.socket.io.sockets.manager.roomClients[this.id])
          //app.socket.io.to()
      }
  }
};