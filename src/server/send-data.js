const room_handlers = require('./room-handler.js');
const active_connection_handlers = require("./connection-array-handler.js"); 

/**
 * This module will handle all the sending to user related functionality 
 */
module.exports = {

    /**
     * 
     * @param {*} clientID 
     * @param {*} message 
     * @throws {*} any error caught by the underlying active connection handler functions 
     */
    sendToOneUser: function(clientID, message){
        let connection = null; 

        try{
            connection = active_connection_handlers.getClientIDConnection(clientID); 
        }catch(err){
            throw err; 
        }

        connection.send(JSON.stringify(message)); 
    },

    /**
     * "Broadcasts" a message to all the specified room participants. 
     * @param {*} room_code the room that the message is going to broacasted 
     * @param {*} message the message that is going to be broadcasted. 
     * @throws {*} any error caught by the underlying active connection handler functions 
     */
    sendToRoomParticipants: function(room_code, message){
        let connections = null; 
        try{
            connections = active_connection_handlers.getRoomCodeConnections(room_code);
        }catch(err){
            throw err; 
        }

        connections.forEach((connection) => {
            connection.send(JSON.stringify(message));
        });
    }, 

}