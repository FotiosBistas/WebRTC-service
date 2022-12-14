const room_handlers = require('./room-handler.js');
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}
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
    sendToOneUser: function(connection, message){
        log("Sending data: " +  message.type + " to specific user");
        connection.send(JSON.stringify(message)); 
    },


    /**
     * "Broadcasts" a message to all the specified room participants. Message must have an ID specified. 
     * The ID here essentially acts the same as a source and prevents the messages to be broadcasted 
     * back to the sender. 
     * @param {*} room_code the room that the message is going to broacasted 
     * @param {*} message the message that is going to be broadcasted. Must have a client id specified to determine origin. 
     * @throws {*} any error caught by the underlying active connection handler functions 
     */
    sendToRoomParticipants: function(room_code, message){


        if(!("id" in message) || !message.id){
            throw new Error("message doesn't have an ID specified");
        }

        let current_room = null , current_room_connections = null; 
        try{
            ({current_room,current_room_connections}= room_handlers.getConnectionsFromRoom(room_code));
        }catch(err){
            throw err; 
        }

        if(!(current_room_connections.length)){
            throw new Error("no connection to send the data to"); 
        }

        log("Sending data:" + message.type + " to room participants");

        current_room_connections.forEach((connection) => {
            //don't broadcast to yourself. 
            if(connection.user_id !== message.id){
                connection.send(JSON.stringify(message));
            }
            
        });
    }, 

}