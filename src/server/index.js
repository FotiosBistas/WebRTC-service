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
const path = require('path');
require('webrtc-adapter');
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

// Try to create https server:
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
}  

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
    log("Request method is: " + request.method);
    log("Request url is: " + request.url);
    if (request.method === 'POST' && processed_url === '/Files') {
        handleSendFile(request, response); 
    } else if(request.method === 'GET' && processed_url === '/Files'){
        handleGetRoomFile(request, response, params); 
    } else if(request.method === 'GET' && processed_url === '/'){
        sendHtml(request, response, `../front-end/index.html`); 
    }else if(request.method === 'GET' && processed_url.match(/^.+\.html$/)){
        sendHtml(request, response, `../${processed_url}`);
    } else if(request.method === 'GET' && processed_url.match(/^.+\.css$/)){
        sendCssFile(request, response, `../front-end/${processed_url}`);
    }else if(request.method === 'GET' && processed_url.match(/^.+\.js$/)){
        sendJsFile(request, response, `..${processed_url}`);
    }else if(request.method === 'GET' && processed_url.includes('/images/')){
        sendContentFile(request, response, `..${processed_url}`); 
    }else {
        send405(request,response);
    }
}

function sendContentFile(request, response, path){
    log("Sending content file: " + path);
    let mime_type = extractMIME(path); 
    if (!mime_type){
        //Unsupported multimedia file format.
        // Reply with file not found.
        response.writeHead(400, {'Content-Type': 'text/plain'}); 
        response.end("Unsupported multimedia file format.");
        request.connection.destroy();
        return; 
    }

    let requested_file = fs.readFile(path, (err, data) => {
        if (err) {
            log("Error while sending js file: " + err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Error loading content file");
        } else {
            response.writeHead(200, { "Content-Type": mime_type });
            response.end(data);
        }
    }); 

}

function sendJsFile(request, response, path){
    log("Sending javascript file: " + path);
    response.writeHead(200, { "Content-Type": "text/javascript" });
    fs.readFile(path, (err, data) => {
        if (err) {
            log("Error while sending js file: " + err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Error loading index.js");
        } else {
            response.end(data.toString());
        }
    });
}

function sendCssFile(request, response, path){
    log("Sending css file: " + path);
    response.writeHead(200, { "Content-Type": "text/css" });
    fs.readFile(path, (err, data) => {
        if (err) {
            log("Error while sending html file: " + err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Error loading index.css");
        } else {
            response.end(data.toString());
        }
    });
}



function sendHtml(request, response, path){
    log("Sending index html file: " + path);
    response.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile(path, (err, data) => {
        if (err) {
            log("Error while sending html file: " + err);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Error loading index.html");
        } else {
            response.end(data.toString());
        }
    });
}

function extractMIME(filename) {
    let filext =  path.extname(filename).toUpperCase();
    log("Mime type extracted: " + filext);
    switch (filext) {
        case ".JPG":
        case ".JPEG":
          return "image/jpeg";
        case ".PNG":
          return "image/png";
        case ".ICO":
          return "image/x-icon";
        case ".MP4":
          return "video/mp4";
        case ".PDF":
          return "application/pdf";
        case ".MKV":
          return "video/x-matroska";
        case ".CSV":
          return "text/csv"; 
        case ".DOC":
          return "application/msword"; 
        case ".DOCX":
          return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case ".GIF":
          return "image/gif"; 
        case ".ZIP":
          return "application/zip"; 
        default:
          // Unsupported multimedia file format.
          return null;
      }
}

function handleGetRoomFile(request, response, params){
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
        log('Requested file not found due to empty file directory. Aborting.');
        // Reply with directory not found.
        response.writeHead(404, {'Content-Type': 'text/plain'}); 
        response.end("Directory not found.");
        request.connection.destroy();
        return; 
    } else {
        // Read file:
        try {
            let requested_file = fs.readFileSync(localFilePath+requested_filename);
            // Get the correct mime type:
            let mimetype = extractMIME(filename);
            if (!mimetype){
                //Unsupported multimedia file format.
                // Reply with file not found.
                response.writeHead(400, {'Content-Type': 'text/plain'}); 
                response.end("Unsupported multimedia file format.");
                request.connection.destroy();
                return; 
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
    var form = new formidable.IncomingForm();

    form.parse(request, function (err, fields, files) {
        if(err){
            log("Error: " + err + " while trying to save file"); 
            response.writeHead(500, {'Content-Type': 'text/plain'}); 
            response.end('Failed to upload file: ' + err); 
        }
        let oldpath = files.file.filepath;
        let mime_type = extractMIME(files.file.originalFilename);
        if(!mime_type){
            response.writeHead(401, {'Content-Type': 'text/plain'}); 
            response.end('File type not supported'); 
        } 
        let newpath = localFilePath + files.file.originalFilename;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                log("Error: " + err + " occured while trying to rename file");
            };
            response.writeHead(200, {'Content-Type': 'text/plain'}); 
            response.end('File uploaded');
        });
        
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
    //unique identifer for user 
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

                let unique = active_connection_handlers.isUsernameUnique(data.username,data.room_code); 
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


