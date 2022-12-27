 //TODO listen to requests 

// this will run on node js 

"use strict"

//web socket secured 
var WebSocketServer = require('websocket').server;
//https for initial request and the upgrading in into websockets 
const https = require('https'); 
const http = require('http'); 
const fs = require('fs'); 
const active_connection_handlers = require('./connection-array-handler.js'); 
const room_handlers = require('./room-handler.js'); 
const send_data = require('./send-data.js'); 
var qs = require('querystring');




const private_key = './privateKey.key'
const certificate = './certificate.crt' 

const https_options = {
    key: fs.readFileSync(private_key), 
    cert: fs.readFileSync(certificate)
}

const localFilePath = './files';

let https_server = null; 
let web_socket_server = null;
let nextID = 0;
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
    log(`Received request for ${request.url}`);
    let processed_url = request.url.split("?")[0];
    let params =  request.url.split("?")[1]; 
    if (request.method === 'POST' && request.url === '/sendFile') {
        handleSendFile(request, response); 
    } else if(request.method === 'GET' && processed_url === '/Files'){
        handleGetFile(request, response, params); 
    }else {
        send405(request,response);
    }
}

function handleGetFile(request, response, params){
    let parameters = new URLSearchParams(params);
    let clientID = parameters.get('clientID');
    let room_code = parameters.get('room_code');
    let username = parameters.get('username'); 
    let filename = parameters.get('filename');
    log(clientID); 
    log(room_code); 
    log(username); 
    log(filename);
    log("Handling get file request");
    let chunks = "";
    //TODO send file over to the client 

}

function handleSendFile(request, response){
    log("Handling send file request");
    let chunks = "";
    request.on('data', chunk => {
        chunks += chunk; 
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        if (chunks.length > 1e6) { 
            response.writeHead(413, {'Content-Type': 'text/plain'}); 
            response.end;
            request.connection.destroy();     
        }
    });
    request.on('end', () => {
        log("end of request");
        console.log(chunks);
        //SAVE FILE BASED ON FILENAME; 
    }); 
}

function send405(request,response){
    log("Sending 405 method not allowed");
    response.writeHead(405, {'Content-Type': 'text/plain'}); 
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

web_socket_server.on('request',async function(request) {
    log("request received");
    let connection = request.accept("json", request.origin); 
    assignConnectionHandlers(connection); 
    /* unique identifer for user */
    let user_id = await active_connection_handlers.createIdentifierForUser("initial"); 

    //IMPORTANT IOUOUOUOUOU add user id to connection 
    connection.user_id = user_id; 

    active_connection_handlers.addConnection(connection); 

    //TODO temporary way to send data 
    connection.send(JSON.stringify({
        type: "id",
        identifier: user_id,
    }))


});


/**
 * Gets called whenever a new connection occurs in the http(s) server and is accepted.
 * @param {*} ws is the underlying socket for the server connection 
 */
function assignConnectionHandlers(ws) {

    log("Assigning handlers to the connection");
    ws.on('close', onCloseEventHandler); 
    ws.on('error', onErrorEventHandler); 
    ws.on('message', onMessageEventHandler); 
    ws.on('open', onOpenEventHandler); 
}

function onCloseEventHandler(event) {
    log("Connection has been closed with code: " 
    + event.code + " reason: " + event.reason + " was clean: " + event.wasClean); 
    try{
        active_connection_handlers.removeConnection(); 
    }catch(err){
        log("Error:(" + err + ") while trying to remove connection");
    }
}

function onErrorEventHandler(error) {
    log("An error occured: " + error); 
}

/**
 * Gets called whenever there's a new message on the connection. 
 * @param {*} message a utf8 type message received from the connection 
 */
async function onMessageEventHandler(message) {
    log("New message received from connection"); 
    let data = JSON.parse(message.utf8Data); 
    switch (data.type){
        case "create_room_code": 
            //create room and add room code to connection 
            try{
                room_handlers.createRoom(data.room_code, data.username,this);
                //confirm to user that it has created the room 
                send_data.sendToOneUser(this, {
                    type:"successful-room", 
                })
            }catch(err){
                log("Error(" + err + ")while trying to create new room"); 
                send_data.sendToOneUser(this, {
                    type: "error", 
                    error_data:err.message, 
                }); 
            }
            
            break; 
        case "join_room_code":
            try{
                room_handlers.addUserToRoom(data.room_code, data.username,this); 
                //confirm to user that it was added to the room 
                send_data.sendToOneUser(this, {
                    type:"successful-room", 
                });

                send_data.sendToOneUser(this,{
                    type:"message-history", 
                    messages: room_handlers.getMessageHistory(data.room_code), 
                })

                send_data.sendToOneUser(this,{
                    type:"active-members", 
                    active_members: room_handlers.getUsernamesFromRoom(data.room_code), 
                }); 

                send_data.sendToRoomParticipants(data.room_code, ({
                    type:"user-joined",
                    id: data.id, 
                    username: data.username,  
                }));


            }catch(err){
                log("Error(" + err + ")while trying to add user to room"); 
                send_data.sendToOneUser(this, {
                    type: "error", 
                    error_data:err.message, 
                }); 
            }
            break; 
        //create new client id on connection based on username 
        case "received-id":
            try{

                let unique = active_connection_handlers.isUsenameUnique(data.username); 
                if(unique){
                    this.user_id = this.user_id + await active_connection_handlers.createIdentifierForUser(data.username); 
                    send_data.sendToOneUser(this, {
                        type: "successful-username", 
                        id: this.user_id, 
                    });
                }
            }catch(err){
                log("Error(" + err + ")while trying to create identifier for user"); 
                send_data.sendToOneUser(this, {
                    type: "error", 
                    error_data:err.message, 
                }); 
            }
            break; 
        case "offer":  case "new-ice-candidate":  case "offer-answer": 
        case "text-message": case "new-file-metadata": 
            try{
                send_data.sendToRoomParticipants(data.room_code, data);
            }catch(err){
                log("Error(" + err + ")while trying to send offer/new-ice-candidate/offer-answer/text-message/new-file-metadata message to room participants");
                send_data.sendToOneUser(this, {
                    type: "error", 
                    error_data:err.message, 
                });
            }
            break; 
        default: 
            log("Unhandled message type: " + data.type);
    }

}

function onOpenEventHandler(event) {
    log("New connection has been opened"); 

}


