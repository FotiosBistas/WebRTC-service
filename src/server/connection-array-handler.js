

let active_connections = []; 
let rooms = []; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

module.exports =  {


    createRoom: function(room_code){
        log("Creating new room"); 
        //users are added on the connection based on the room code 
        rooms.push({
            code: room_code,
            users: [], 
        }); 
    },

    /**
     * Adds user to the specific room if it exists. 
     * @param {*} room the room OBJECT that the user is going to be added to 
     * @param {*} clientID the user that is going to be added to the room 
     * @returns 
     */
    addUserToRoom: function(room, clientID){
        if(!room){
            log("given erroneous room"); 
            return;  
        }
        room.users.push(clientID);
    },

     /**
     * Finds the OBJECT room with the specific room code. 
     * @param {*} room_code the room code that we'll check if it exists 
     */
    doesRoomExists: function(room_code){
        let room = rooms.find((room) => room.code == room_code);

        if(!room){
            log("room doesn't exist"); 
            return 
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



