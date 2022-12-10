

let connection_array = []; 


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

module.exports =  {

    addConnection: function (connection){
        log("Adding new connection to array"); 
        connection_array.push(connection);
    },

    removeConnection: function(){

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



