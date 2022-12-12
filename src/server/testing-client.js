

/* 


A TESTING CLIENT TO CHECK SERVER FUNCTIONALITY EASILY 

SUPPLY IT WITH TWO COMMAND LINE ARGUMENTS: 
-ROOM CODE 
-ACTION 
*/

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();


let serverURL; 
let scheme = "ws"; 
let server_port = 62000; 
let hostname = "localhost"
let clientID = null; 

let current_room_code = process.argv[2];
let current_action = process.argv[3];

// print process.argv
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

let connection = null;

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}



function sendToServer(message){
    /* all messages sent to the server must have a type property */
    if (!("type" in message) || !message.type) {
        log("Error: message doesn't have type property")
        return 
    }
    
    /* all messages sent to the server must have an id property (id of the client) */
    if(!("id" in message) || !message.id){
        log("Error: message doesn't have ID property");
        return
    }

    /* all messages sent to the server must have a room code property */
    if((!("room_code") in message) || !message.room_code){
        log("Error: message doesn't have room code property");
        return 
    }

    try{
        let json_message = JSON.stringify(message); 
        log("Sending message: " + json_message + "to server"); 
        connection.send(json_message); 
    }catch(err){
        log("Error occured while sending data to server: ", err);
    }

}

serverURL = scheme + "://" + hostname + ":" + server_port; 
log("Server URL is: " + serverURL);

client.connect(serverURL, "json"); 
client.on('connect', function(web_socket_connection){
    connection = web_socket_connection; 
    //assing event handlers 
    connection.on('close',onCloseEventHandler); 
    connection.on('error',onErrorEventHandler); 
    connection.on('message', onMessageEventHandler); 
})


function onMessageEventHandler(message){
    log("New message received from connection"); 

    let msg = JSON.parse(message.utf8Data);
    switch(msg.type){
        //TODO handle all the messages types  

        // ----- TASK  ------- 
        case "id": 
            //user is initialized in the server 
            log("Received new ID message from connection"); 
            clientID = msg.identifier; 
            //after that send immediately which room you want to join/create 
            sendToServer({
                type: current_action + "_room_code", 
                id: clientID, 
                room_code: current_room_code
            });
             
            break; 
        default: 
            log("Unhanlded message type"); 
    }
}

function onCloseEventHandler(event) {
    log("Connection has been closed with code: " + event.code + " reason: " + event.reason + " was clean: " + event.wasClean); 

}

function onErrorEventHandler(error) {
    log("A web socket error occured: " + JSON.stringify(error, ["message", "arguments", "type", "name"])); 
}