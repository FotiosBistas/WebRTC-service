 //TODO listen to requests 

// this will run on node js 

//web socket secured 

var ws = require('wss');
//https for initial request and the upgrading in into websockets 
const https = require('https'); 
const http = require('http'); 
const fs = require('fs'); 

const private_key = './privateKey.key'
const certificate = './certificate.crt' 

const https_options = {
    key: fs.readFileSync(private_key), 
    cert: fs.readFileSync(certificate)
}

const connection_array = require('connection-array-handler'); 

let https_server = null; 
let web_socket_server = null;


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

try{
    if(https_options.key && https_options.cert){
        https_server = https.createServer(https_options,handleHttpsRequest); 
    }
}catch(err){
    log(err + "while starting https server"); 
}

// Try to create https server without the options, meaning an http server
if(https_server === null){
    try{
        https_server = http.createServer({}, handleHttpsRequest);
    }catch(err){
        log("Error while trying to create http server: " + err); 
    }
}

https_server.listen(6503, function(){
    log("Server is listening on port 6503"); 
}); 

/**
 * We don't want to send any http data to the users. All is handled locally. 
 * @param {*} request 
 * @param {*} response 
 */
function handleHttpsRequest(request, response){
    log("Received request for the web server" + request.url); 
    response.writeHead(404); 
    response.end;
}

function allowOrigin(origin){
    return true; 
}

/**
 * Upgrade https connection onto web sockets: 
 * GET /chat
 * Host: javascript.info
 * Upgrade: websocket
 * Connection: Upgrade
 */
web_socket_server = new ws.Server({
    httpServer: https_server, 
});

web_socket_server.onconnection = onConnectionHandler; 

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
