import {createPeerConnection} from "./peer-connection-handler.js"; 


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let web_socket_connection = null; 
let hostname = "localhost"; 
let server_port = 6578; 

let remoteStream = new MediaStream(); 

let clientID = 0; 
let myUsername = null; 

/**
 * 
 * @param {*} message 
 */
function sendToServer(message){
    if (!("type" in message)) {
        log("Error: message doesn't have type property")
        return 
    }
    let json_message = JSON.stringify(message); 
    log("Sending message: " + json_message + "to server"); 
    web_socket_connection.send(json_message); 
}

let offer = await createPeerConnection(); 


function createIdentifier(){
    //TODO create a unique identifier so we can handle connections in the server 

    // ----- TASK  ------- 
}

function connect(){
    let serverURL; 


    connection = new WebSocket("ws://" + hostname + ":" + server_port); 
    
}

