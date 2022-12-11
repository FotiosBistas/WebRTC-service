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
        let new_room = {
            code: room_code,
            users: [], 
        }
        rooms.push(new_room); 

        log("Created new room: " + JSON.stringify(new_room));
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
        room.users.push(clientID);
        log("Added new user:" + clientID + " to room:" + JSON.stringify(room));
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
    }
}