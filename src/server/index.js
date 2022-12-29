 //TODO listen to requests 

// this will run on node js 

"use strict"

//web socket secured 
var WebSocketServer = require('websocket').server;
//https for initial request and the upgrading in into websockets 
const https = require('https'); 
const http = require('http');
const fs = require('fs'); 
var formidable = require('formidable');
const active_connection_handlers = require('./connection-array-handler.js'); 
const room_handlers = require('./room-handler.js'); 
const send_data = require('./send-data.js'); 
var qs = require('querystring');

const private_key = 'tls/key.pem';
const certificate = 'tls/cert.pem';

const https_options = {
    key: fs.readFileSync(private_key), 
    cert: fs.readFileSync(certificate)
}

const localFilePath = './files/';

let http_s_server = null; 
let web_socket_server = null;
const port = 62000; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + " " + text);
}

/* // Try to create https server:
if(!http_s_server){
    try{
        http_s_server = https.createServer(
            https_options, 
            handleHttpsRequest
        );
        log("Created a https server");
    }catch(err){
        log("Error while trying to create https server: " + err); 
    }
    http_s_server.listen(port, function(){
        log("Https server is listening on port: " + port); 
    }); 
}   */

if(!http_s_server){
    try{
        http_s_server = http.createServer({}, handleHttpsRequest); 
        log("Created http server"); 
    }catch(err){
        log("Error while trying to create http server: " + err);
    }
    http_s_server.listen(port, function(){
        log("Http server is listening on port: " + port); 
    }); 
}



/**
 * We don't want to send any http data to the users. All is handled locally. 
 * @param {*} request 
 * @param {*} response 
 */
function handleHttpsRequest(request, response){
    log(`Received request for ${request.url}`);
    let processed_url = request.url.split("?")[0];
    let params =  request.url.split("?")[1];
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods','PUT' ,'OPTIONS, GET');
    response.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    log(request.method)
    log(request.url)
    if (request.method === 'POST' && processed_url === '/Files') {
        handleSendFile(request, response); 
    } else if(request.method === 'GET' && processed_url === '/Files'){
        handleGetFile(request, response, params); 
    }else {
        send405(request,response);
    }
}

function extractMIME(filename) {
    let filext = filename.split(".")[1].toUpperCase();
    if (filext == "JPG" || filext == "JPEG"){
        return "image/jpeg";
    } else if (filext == "PNG"){
        return "image/png"
    } else {
        // Unsupported multimedia file format.
        return null;
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
    // Reconstruct the requested file's name:
    let requested_filename = username + "_" + clientID + "_" + room_code + "_" + filename;
    // check if directory exists
    if (!fs.existsSync(localFilePath)) {
        console.log('Requested file not found due to empty file directory. Aborting.');
        // Reply with directory not found.
        response.writeHead(404, {'Content-Type': 'text/plain'}); 
        response.end("Directory not found.");
        request.connection.destroy();
    } else {
        // Read file:
        try {
            let requested_file = fs.readFileSync(localFilePath+"/"+requested_filename);
            // Get the correct mime type:
            let mimetype = extractMIME(filename);
            if (!mimetype){
                //Unsupported multimedia file format.
                // Reply with file not found.
                response.writeHead(400, {'Content-Type': 'text/plain'}); 
                response.end("Unsupported multimedia file format.");
                request.connection.destroy();
            }
            response.writeHead(200, {'Content-Type': mimetype});
            response.end(requested_file);
        } catch(err) {
            log(err)
            // Reply with file not found.
            response.writeHead(404, {'Content-Type': 'text/plain'}); 
            response.end("Requested file not found.");
            request.connection.destroy();
        }
    }

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
        log("end of request");
        const filenameRegex = /filename="([^"]+)"/;
        const matches = filenameRegex.exec(chunks);
        const filename = matches[1];
        const arr = chunks.split('image/png'); 

        log(filename);
        fs.WriteStream(localFilePath + filename, arr[1],(err) => {
            if (err) {
                // Handle error
                log(err);
                return;
            }
            log('File saved!');
        });

        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end();
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
    httpServer: http_s_server,
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


