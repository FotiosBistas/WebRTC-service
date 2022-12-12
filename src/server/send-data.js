const room_handlers = require('./room-handler.js');
const active_connection_handlers = require("./connection-array-handler.js"); 

/**
 * This module will handle all the sending to user related functionality 
 */
module.exports = {

    /**
     * Sends a message to a specific user from the active connections array. 
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
        let current_room = null , current_room_connections = null; 
        try{
            ({current_room,current_room_connections}= room_handlers.getConnectionsFromRoom(room_code));
        }catch(err){
            throw err; 
        }

        current_room_connections.forEach((connection) => {
            connection.send(JSON.stringify(message));
        });
    }, 

}