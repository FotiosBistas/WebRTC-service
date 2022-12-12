const send_data_handlers = require("./send-data.js");
const room_handlers = require("./room-handler.js");

let active_connections = []; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

/**
 * Active connection handlers 
 */
module.exports =  {

    /**
     * Adds new connection to the active connections array 
     * @param {*} connection new web socket connection
     */
    addConnection: function (connection){
        log("Adding new connection to array"); 
        active_connections.push(connection);
    },

    /**
     * filter all non dead connections using connection.connected. 
     * Inform the other users using the room that a specific user's connection was terminated. 
     */
    removeConnection: function(){
        log("Removing connection from array");
        let connection_room_code = null; 
        let clientID = null; 

        //remove the connection with 
        active_connections = active_connections.filter((connection) => {
            if(!connection.connected){
                connection_room_code = connection.room_code; 
                clientID = connection.user_id; 
            }else{
                return connection.connected; 
            }
        });

        room_handlers.removeConnectionFromRoom(connection_room_code, clientID); 

        let message = {
            type: "user-left",
            identifier: clientID, 
            room_code: connection_room_code, 
        }

        send_data_handlers.sendToRoomParticipants(connection_room_code, message); 
    },  
    
    /**
     * Finds the connection with the specific client id.(hopefully unique)
     * @param {*} clientID the id we want the connection for 
     * @returns the connection with the given client ID
     * @throws {*} connection doesn't exist error 
     */
    getClientIDConnection: function(clientID){
        let connection = active_connections.find((connection) => {
            connection.user_id == clientID
        });

        if(!connection){
            throw new Error("connection doesn't exist"); 
        }
        return connection; 
    },

    
    /**
     * Creates a unique identifier for the user based on the sha-256 algorithm. 
     * @param {*} identifier a sequence number increased by one with each connection
     * @returns the hash hex produced. 
     */
    createIdentifierForUser: async function(identifier){
        const key = "newuserjoins"
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(key + identifier);                    
    
        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
    
        // convert bytes to hex string                  
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        log("Created new identifier: " + hashHex);
        return hashHex;
    }


}



