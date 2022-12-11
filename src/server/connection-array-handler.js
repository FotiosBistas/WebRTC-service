

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



