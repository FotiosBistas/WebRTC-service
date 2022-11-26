
let hostname = "localhost"; 
let server_port = 6578; 
let web_socket_connection = null; 


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

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

function createIdentifier(){
    //TODO create a unique identifier so we can handle connections in the server 

    // ----- TASK  ------- 
}

export function connect(){
    let serverURL; 

    serverURL = "ws://" + hostname + ":" + server_port; 

    web_socket_connection = new WebSocket(serverURL); 

    web_socket_connection.onclose = onCloseEventHandler; 
    web_socket_connection.onerror = onErrorEventHandler; 
    web_socket_connection.onmessage = onMessageEventHandler; 
    web_socket_connection.onopen = onOpenEventHandler; 

    return web_socket_connection; 
}

function onCloseEventHandler(event) {
    log("Connection has been closed with code: " + event.code + " reason: " + event.reason + " was clean: " + event.wasClean); 

}

function onErrorEventHandler(error) {
    log("An error occured: " + JSON.stringify(error)); 
}

function onMessageEventHandler(message) {
    log("New message received from connection"); 
    
}

function onOpenEventHandler(event) {
    log("New connection has been opened"); 
    //TODO handle the corresponding html and css 

    // ----- TASK  ------- 
}