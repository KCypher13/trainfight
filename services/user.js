module.exports = function(app){
    return {
        setPseudo: function(data){
            this.pseudo = data;
        },
        joinRoom: function(data){
            this.join(data);
        }
    }
};