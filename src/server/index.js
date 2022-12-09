 //TODO listen to requests 

// this will run on node js 

"use strict"

//web socket secured 
var WebSocketServer = require('websocket').server;
//https for initial request and the upgrading in into websockets 
const https = require('https'); 
const http = require('http'); 
const fs = require('fs'); 
const connection_array_functions = require('./connection-array-handler.js'); 
const { join } = require('path');

const private_key = './privateKey.key'
const certificate = './certificate.crt' 

const https_options = {
    key: fs.readFileSync(private_key), 
    cert: fs.readFileSync(certificate)
}


let https_server = null; 
let web_socket_server = null;
const port = 62000; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}


/* 

Best idea would be to create an https server but it doesn't work for some reason 
*/
/* try{
    if(https_options.key && https_options.cert){
        https_server = https.createServer(
            https_options,
            handleHttpsRequest,
            ); 
        log("Created a https server");
    }
}catch(err){
    log(err + "while starting https server"); 
}  */

// Try to create https server without the options, meaning an http server
if(https_server === null){
    try{
        https_server = http.createServer({}, handleHttpsRequest);
        log("Created a http server");
    }catch(err){
        log("Error while trying to create http server: " + err); 
    }
}

https_server.listen(port, function(){
    log("Server is listening on port: " + port); 
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
web_socket_server = new WebSocketServer({
    httpServer: https_server,
    autoAcceptConnections: false, 
}); 

if(web_socket_server){
    log("Created a websocket server"); 
}
else{
    log("ERROR while trying to create websocket server")
}

web_socket_server.on('request', function(request) {
    log("request received");
    let connection = request.accept("json", request.origin); 
    assignConnectionHandlers(connection); 
});


/**
 * Gets called whenever a new connection occurs in the http(s) server and is accepted.
 * @param {*} ws is the underlying socket for the server connection 
 */
function assignConnectionHandlers(ws) {

    log("Assigning handlers to the connection");
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
    log("New message received from connection" + message); 
    
}

function onOpenEventHandler(event) {
    log("New connection has been opened"); 

}
