

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
     * filter all non dead connections using connection.connected 
     */
    removeConnection: function(){
        log("Removing connection from array");
        active_connections = active_connections.filter((connection) => connection.connected);
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
     * Finds all connections with the specified room code. 
     * @param {*} room_code the room code that we want to receive the connections for
     * @returns the connections (or connection) with the specified room code
     * @throws {*} connection with the specified room code does not exist error
     */
    getRoomCodeConnections: function(room_code){
        let connections = active_connections.filter((connection) => connection.room_code == room_code);

        if(!connections){
            throw new Error("connection with the specified room code does not exist");
        }

        return connections;  
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



