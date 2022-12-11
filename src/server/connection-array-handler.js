

let active_connections = []; 
let rooms = []; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

module.exports =  {


    /**
     * Creates a new room with the code given. 
     * @param {*} room_code the room code that the new room will have 
     * @throws {*} throws room already exists if the room already exists.  
    */
    createRoom: function(room_code){
        log("Creating new room"); 

        let room = this.doesRoomExists(room_code);
        
        if(room){
            throw new Error("Room already exists"); 
        }
        //users are added on the connection based on the room code 
        rooms.push({
            code: room_code,
            users: [], 
        }); 
    },

    /**
     * Adds user to the specific room if it exists. 
     * @param {*} room_code the room code that the user is going to be added to 
     * @param {*} clientID the user that is going to be added to the room 
     * @throws {*} room doesn't exist error if room doesn't exist.  
    */
    addUserToRoom: function(room_code, clientID){
        let room = this.doesRoomExists(room_code);
        if(!room){
            throw new Error("Room doesn't exist");   
        }
        room.users.push(clientID);
    },

     /**
     * Finds the OBJECT room with the specific room code. 
     * @param {*} room_code the room code that we'll check if it exists 
     * @returns {*} returns false if the room doesn't exist. Return the room OBJECT if the room exists. 
     */
    doesRoomExists: function(room_code){
        let room = rooms.find((room) => room.code == room_code);

        if(!room){
            return false; 
        }
        return room; 
    },

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



