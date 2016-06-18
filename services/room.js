module.exports = function (app) {
    return {
        createAction: function (data) {
            //TODO function checking if enough point
            var _socket = this;
            var _activeRoomName = _socket.activeRoom;
            var _activeRoom = app.socket.io.sockets.adapter.rooms[_activeRoomName];
            var _disruptor = _activeRoom.disruptors[_socket.id];


            app.db.getStation(data.station, function (station) {
                app.db.getAction(data.action, function (action) {

                    if (action.cost <= _disruptor.actionPoint) {
                        _disruptor.actionPoint = _disruptor.actionPoint - action.cost;
                        app.socket.io.sockets.connected[_disruptor.socketId].emit('changeActionPoint', _disruptor.actionPoint);

                        _activeRoom.actionInProgress[station.id] = {
                            station: station,
                            action: action,
                            user: _disruptor.socketId,
                            gravity: action.gravity,
                            visitors: (station.annualVisitors / 365) / 24,
                            startTime: Date.now()
                        };

                        app.socket.io.to(_socket.activeRoom).emit('newAction', {
                            station: station,
                            action: action,
                            user: _socket.pseudo,
                        });
                    }
                })
            });

        },
        createReaction: function (data) {
            var _socket = this;
            var _activeRoomName = _socket.activeRoom;
            var _activeRoom = app.socket.io.sockets.adapter.rooms[_activeRoomName];
            var _manager = _activeRoom.manager;
            var _actionTarget = _activeRoom.actionInProgress[data.station];

            app.db.getReaction(data.reaction.id, function (reaction) {
                var _resolutionTime;
                var _gravity;

                if (!reaction.asRecovery) {
                    if (_manager.availableAgent >= data.nbAgents) {
                        _gravity = _actionTarget.gravity;
                        _resolutionTime = _gravity / data.nbAgents * 5000;
                        _actionTarget.agents = data.nbAgents;
                        _activeRoom.manager.availableAgent = _manager.availableAgent - data.nbAgents;
                        _socket.emit('changeAvailableAgent', _activeRoom.manager.availableAgent);
                        setTimeout(function () {
                            app.room.solveAction(_activeRoom, data.station, _activeRoomName)
                        }, _resolutionTime);
                        _socket.emit('notification', 'Les agents sont en route');

                        app.socket.io.to(_activeRoomName).emit('newReaction', data.station)
                    }
                }
                else {
                    if(!_activeRoom.manager.reactionUsed[reaction.id]){
                        _gravity = _actionTarget.gravity;
                        _resolutionTime = _gravity / reaction.efficiency;
                        _activeRoom.manager.reactionUsed[reaction.id] = true;
                        _socket.emit('reactionUsed', _activeRoom.manager.reactionUsed[reaction.id]);
                        setTimeout (function(){
                            _activeRoom.manager.reactionUsed[reaction.id] = false;
                            _socket.emit('reactionUsed', _activeRoom.manager.reactionUsed[reaction.id]);
                        }, reaction.recoveryTime*1000);
                        setTimeout(function () {
                            app.room.solveAction(_activeRoom, data.station, _activeRoomName)
                        }, _resolutionTime);
                        app.socket.io.to(_activeRoomName).emit('newReaction', data.station)
                    }
                    else{
                        _socket.emit('notification', 'Ils sont déjà occupé ailleurs');
                    }

                }
            });
        },
        solveAction: function (_activeRoom, station, _activeRoomName) {
            var _action = _activeRoom.actionInProgress[station];
            var _dateNow = Date.now();
            var _scoring = Math.round((_dateNow - _action.startTime) / 1000);
            var _newPoint = (Math.round((_dateNow - _action.startTime) / 600) + parseInt(_activeRoom.disruptors[_action.user].actionPoint) >= 10) ? Math.round((_dateNow - _action.startTime)/ 800)+parseInt(_activeRoom.disruptors[_action.user].actionPoint) : 10;

            if (_action.agents) {
                _activeRoom.manager.availableAgent = _activeRoom.manager.availableAgent + parseInt(_action.agents);
                app.socket.io.sockets.connected[_activeRoom.manager.socketId].emit('changeAvailableAgent', _activeRoom.manager.availableAgent);
            }

            _activeRoom.disruptors[_action.user].actionPoint = _newPoint;
            _activeRoom.disruptors[_action.user].score += _scoring;
            app.socket.io.sockets.connected[_action.user].emit('changeActionPoint', _newPoint);

            delete _activeRoom.actionInProgress[station];
            app.socket.io.to(_activeRoomName).emit('actionSolved', {station: station});
            app.db.getStation(station, function(station){
                app.socket.io.to(_activeRoomName).emit('notification', 'Le problème à ' + station.name + ' a été réglé.');
            });

        },
        startGame: function (data) {
            var socket = this;

            app.room.sendMap(function(data){
                app.socket.io.to(socket.activeRoom).emit('generateLine', data);
            });

            app.db.getActions(function (actions) {
                app.socket.io.to(socket.activeRoom).emit('hydrateActions', actions);
            });
            app.db.getReactions(function (reactions) {
                app.socket.io.sockets.connected[app.socket.io.sockets.adapter.rooms[socket.activeRoom].manager.socketId].emit('hydrateReaction', reactions);
            });
            app.room.initialisePoint(socket.activeRoom);

        },
        sendMap:function(cb){
            app.db.getLines(function (lines) {
                app.db.getStationsFromLines(lines, function (data) {
                    if(cb) {
                        cb(data);
                    }
                });
            });
        },
        initialisePoint: function (activeRoomName) {
            var _activeRoom = app.socket.io.sockets.adapter.rooms[activeRoomName];
            _activeRoom.satisfaction = 10000;
            _activeRoom.manager.availableAgent = Object.keys(_activeRoom.disruptors).length * 3;
            _activeRoom.startTime = Date.now();
            _activeRoom.actionInProgress = {};

            app.socket.io.to(activeRoomName).emit('initisalisePoint', {
                satisfaction: _activeRoom.satisfaction,
                startTime: _activeRoom.startTime
            });

            for (key in _activeRoom.disruptors) {
                var _disruptor = _activeRoom.disruptors[key];
                _disruptor.actionPoint = 10;
                app.socket.io.sockets.connected[_disruptor.socketId].emit('changeActionPoint', _disruptor.actionPoint);
            }

            app.socket.io.sockets.connected[_activeRoom.manager.socketId].emit('changeAvailableAgent', _activeRoom.manager.availableAgent);
            _activeRoom.satisfactionChecker = setInterval(function () {
                app.room.satisfactionChecker(activeRoomName)
            }, 1000);

        },
        satisfactionChecker: function (activeRoomName) {
            var _activeRoom = app.socket.io.sockets.adapter.rooms[activeRoomName];
            var _actionsInProgress = _activeRoom.actionInProgress;
            for (key in _actionsInProgress) {
                var _action = _actionsInProgress[key];
                _activeRoom.satisfaction = Math.round(_activeRoom.satisfaction - (_action.visitors / 20));
            }
            if (_activeRoom.satisfaction > 0) {
                app.socket.io.to(activeRoomName).emit('changeSatisfaction', _activeRoom.satisfaction);
            }
            else {
                var _gameTime = (Date.now() - _activeRoom.startTime) / 1000;
                app.socket.io.to(activeRoomName).emit('stopGame', {
                    disruptors: _activeRoom.disruptors,
                    gameTime: _gameTime
                });
                clearInterval(_activeRoom.satisfactionChecker);
            }

        }

    }
};