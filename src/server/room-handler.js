
let rooms = []; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

/**
 * Room handlers. 
 */
module.exports = {

    /**
     * Creates a new room with the code given. Also add the creator to the room's connection list. 
     * @param {*} room_code the room code that the new room will have 
     * @param {*} connection the connection of the user that will create the room 
     * @throws {*} throws room already exists if the room already exists.  
    */
    createRoom: function(room_code, connection){
        log("Creating new room"); 

        let room = this.doesRoomExists(room_code);
        
        if(room){
            throw new Error("Room already exists"); 
        }

        //IMPORTANT IOUOUOUOUOU add room code to connection 
        connection.room_code = room_code;  

        //users are added on the connection based on the room code 
        let new_room = {
            code: room_code,
            room_history: [], //array of messages sent over the server 
            users: [], 
        }

        //the user that created the room should be given elevated privilages for the connection 
        connection.creator = true; 
        //push the connection to the active users of the room 
        new_room.users.push(connection); 

        rooms.push(new_room); 
        log("Successfully created new room");
    },

    /**
     * Returns all sent messages in the room. 
     * @param {*} room_code The room code we want to retrive the message history for
     * @returns the message history of the room
     */
    getMessageHistory: function(room_code){
        let room = this.doesRoomExists(room_code); 

        if(!room){
            throw new Error("Room doesn't exist"); 
        }
        return room.room_history; 
    },

    /**
     * Adds a new message to the room's history. 
     * @param {*} room_code the room code that the message is going to be added to. 
     * @param {*} message the message added to the history 
     */
    addMessageToRoomHistory: function(room_code, message){
        let room = this.doesRoomExists(room_code); 

        if(!room){
            throw new Error("Room doesn't exist"); 
        }

        room.room_history.push(message);
        log("Added message to room history");
    },

    /**
     * Returns all connections with the specified room code. 
     * @param {*} room_code the room code that we want to receive the connections for
     * @returns the room and the connections (or connection) with the specified room code. These are encapsulated in an object {current_room: room, current_room_connections: room.users}
     * @throws {*} connection with the specified room code does not exist error
     */
    getConnectionsFromRoom: function(room_code){
        let room = this.doesRoomExists(room_code); 

        if(!room){
            throw new Error("Room doesn't exist"); 
        }
        log("Returning connections from room");
        return {
            current_room: room,
            current_room_connections: room.users,
        }; 
    },

    /**
     * Removes the client connection based on the roomcode and the client ID. This can be done not only when a connection terminates but 
     * when a privileged user wants to remove a user from the connection(reminder creator connections have the creator field set to true). 
     * @param {*} room_code the room code to find the client connection 
     * @param {*} clientID the client ID for find the corresponding connection we want to remove 
     * @throws {*} the error that getconnectionsFromRoom throws 
     */
    removeConnectionFromRoom: function(room_code, clientID){
        let current_room = null ,current_room_connections = null; 
        try{
            ({current_room,current_room_connections} = this.getConnectionsFromRoom(room_code));
        }catch(err){
            throw err; 
        }
        
        current_room_connections = current_room_connections.filter((connection) => {
            return clientID !== connection.user_id; 
        }); 

        current_room.users = current_room_connections; 
        //if length is equal to zero means no more users are using the room 
        if(!(current_room.users.length)){
            this.removeRoom(room_code); 
        }
        log("Removed connection from room");
    },

    /**
     * Removes a room from the active rooms. 
     * @param {*} room_code 
     */
    removeRoom: function(room_code){
        rooms = rooms.filter((room) => room_code !== room.code); 
        log("Removed room from active rooms");
    },

    /**
     * Adds user to the specific room if it exists. 
     * @param {*} room_code the room code that the user is going to be added to 
     * @param {*} connection the user connection that is going to be added to the room 
     * @throws {*} room doesn't exist error if room doesn't exist.  
    */
    addUserToRoom: function(room_code, connection){
        let room = this.doesRoomExists(room_code);
        if(!room){
            throw new Error("Room doesn't exist");   
        }
        //IMPORTANT IOUOUOUIOIOU add room code to connection 
        connection.room_code = room_code;
        connection.creator = false; 
        //connection should have a user id accompanied with it from the initiation phase of the connection. 
        room.users.push(connection);
        log("Added new user:" + connection.user_id + " to room:" + room.code);
    },

    /**
     * Finds the OBJECT room with the specific room code. 
     * @param {*} room_code the room code that we'll check if it exists 
     * @returns {*} returns false if the room doesn't exist. Return the room OBJECT if the room exists. 
     */
    doesRoomExists: function(room_code){
        let room = rooms.find((room) => room.code === room_code);

        if(!room){
            return false; 
        }
        return room; 
    }
}