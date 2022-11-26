 //TODO listen to requests 

// this will run on node js 

var ws = require('ws');

let web_socket_server = null;


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

/* let httpserver = null; 

try{

}catch(err){
    log(err); 
}

function handleHTTPRequest(request, response){
    log("Received requests for: " + request.url); 
    //TODO handle http requests 
    response.writeHead(); 
    response.end(); 
}

httpserver.listen(6503, function(){
    log("Server is listening on port 6503"); 
});  */


function allowOrigin(origin){

}

function createNewWebSocketServer(){
    web_socket_server = new ws.Server({
        port: 6578,
    });
    
    web_socket_server.onconnection = onConnectionHandler; 
}

/**
 * Gets called whenever a new connection occurs in the server.
 * @param {*} ws is the underlying socket for the server connection 
 */
function onConnectionHandler(ws) {

    ws.onclose = onCloseEventHandler; 
    ws.onerror = onErrorEventHandler; 
    ws.onmessage = onMessageEventHandler; 
    ws.onopen = onOpenEventHandler;  
}

function onCloseEventHandler(event) {
    log("Connection has been closed with code: " 
    + event.code + " reason: " + event.reason + " was clean: " + event.wasClean); 

}

function onErrorEventHandler(error) {
    log("An error occured: " + error); 
}

function onMessageEventHandler(message) {
    log("New message received from connection"); 
    
}

function onOpenEventHandler(event) {
    log("New connection has been opened"); 

}
