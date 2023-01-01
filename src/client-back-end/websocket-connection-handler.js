"use strict"

import { media_functions } from "./media-handler.js";
import {callAppropriateHandler, closePeerConnection, createPeerConnection} from "./peer-connection-handler.js"
import { websocket_front_end_handlers,front_end_handlers } from "./front_end_handlers.js";

let hostname = window.location.hostname; 
if (!hostname) {
  hostname = "localhost";
}

log("Hostname: " + hostname); 
let server_port = window.location.port; 
let web_socket_connection = null; 


/**
 * When first called it creates a closure that acts as a getter for the parameter. 
 * Then if called after assigning it to some variable it acts as a getter. 
 * Easy to track over the multiple modules. 
 * @returns returns the closure that returns the parameter and the closure that resets the parameter.
 */
function createGetterForParam(param){
    let param_value = null;
    let hasBeenCalled = false;  
    return {
        get: function() {
            if (!hasBeenCalled) {
                param_value = param;
                hasBeenCalled = true;
            }
            return param_value;
        },
        set:function(new_param){
            param_value = new_param;
        },
        reset: function() {
            param_value = null;
            hasBeenCalled = false;
        }
    }
}; 



export let getUsername = null;
export let getClientID = null; 
export let getRoomCode = null; 
export let getServerURL = null; 

let current_action = null; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

/**
 * Turns the message into JSON and sends it over the server. 
 * The format of the message should be: 
 * 
 * {
 *  type: given_type, 
 *  id: clientID, 
 *  room_code: current_room_code, 
 *  username: client_username, 
 *  ...
 * }
 * @param {*} message message that must follow certain types that are enforced by this function
 */
export function sendToServer(message){
    /* all messages sent to the server must have a type property */
    if (!("type" in message) || !message.type) {
        log("Error: message doesn't have type property")
        return 
    }

    message.id = getClientID.get(); 
    message.room_code = getRoomCode.get(); 
    message.username = getUsername.get(); 

    //sanity checks 
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

    /* all messages sent to the server must have a username property */
    if(!(("username") in message) || !message.username){
        log("Error: message doesn't have username property");
        return; 
    }

    try{
        let json_message = JSON.stringify(message); 
        log("Sending message: " + json_message + "to server"); 
        web_socket_connection.send(json_message); 
    }catch(err){
        log("Error occured while sending data to server: ", err);
    }

}

/**
 * Connects the user to the room that was specified. This is done by creating a web 
 * socket. Also assigns the appropriate handlers 
 * @param {*} room_code the room code that was specified 
 * @param {*} action create or join a room 
 */
export function webSocketConnect(room_code, action, username){
    let scheme = "ws"; 
    
    getUsername = createGetterForParam(username); 
    getRoomCode = createGetterForParam(room_code); 

    current_action = action; 
    
    /* If the protocol is https you must use web socket secured */
    //--------TASK------- 
    //add extras on the scheme in order to do a web sockets secured 
    if(document.location.protocol === "https:"){
        scheme += "s";
    }
    getServerURL = createGetterForParam(hostname + ":" + server_port); 
    let websocketScheme = scheme + "://" + getServerURL.get(); 
    log("Server URL is: " + websocketScheme);

    try{
        web_socket_connection = new WebSocket(websocketScheme, "json"); 
    }catch(err){
        throw new Error("couldn't connect you to the server"); 
    }
    //assing event handlers 
    web_socket_connection.onclose = onCloseEventHandler; 
    web_socket_connection.onerror = onErrorEventHandler; 
    web_socket_connection.onmessage = onMessageEventHandler; 
    web_socket_connection.onopen = onOpenEventHandler; 
}

function onCloseEventHandler(event) {
    log("Connection has been closed with code: " + event.code + " reason: " + event.reason + " was clean: " + event.wasClean);
    closeWebSocketConnection(); 
    closePeerConnection();  
    front_end_handlers.restoreJoinRoomScreen(); 
}

function onErrorEventHandler(error) {
    log("A web socket error occured: " + JSON.stringify(error, ["message", "arguments", "type", "name"])); 
}

function onMessageEventHandler(message) {
    log("New message received from connection"); 

    let msg = JSON.parse(message.data);

    switch(msg.type){
        //TODO handle all the messages types  

        // ----- TASK  -------
        case "id": 
            //user is initialized in the server 
            log("Received new ID message from connection"); 
            getClientID = createGetterForParam(msg.identifier);

            sendToServer({
                type:"received-id",
            })
            break; 
        case "successful-username": 
            getClientID.set(msg.id);
            //after that send immediately which room you want to join/create 
            sendToServer({
                type: current_action + "_room_code", 
            });
            break; 
        case "user-left": 
            //some other user left the call  
            websocket_front_end_handlers.handleUserLeaving(msg); 
            break; 
        case "user-joined":
            websocket_front_end_handlers.handleUserJoining(msg); 
            break;
        case "successful-room":
            createPeerConnection(); 
            //user created or joined a room successfully 
            websocket_front_end_handlers.handleSuccessfulRoom(); 
            break;
        case "message-history":
            websocket_front_end_handlers.handleMessageHistory(msg);
            break; 
        case "new-file-metadata":
            websocket_front_end_handlers.handleNewFileMetadata(msg);
            break; 
        case "active-members":
            websocket_front_end_handlers.handleActiveMembers(msg); 
            break; 
        case "text-message":
            websocket_front_end_handlers.handleNewTextMessage(msg); 
            break; 
        case "error": 
            websocket_front_end_handlers.handleErrorReceivedByServer(msg);
            break; 
        // WEB RTC RELATED MESSAGES
        case "offer": case "offer-answer": case "new-ice-candidate": 
            callAppropriateHandler(msg); 
            break; 
        default: 
            log("Unhandled message type: " + msg.type);
    }
}

function onOpenEventHandler(event) {
    log("New connection has been opened"); 

    //TODO handle the corresponding html and css 

    // ----- TASK  ------- 
}

/**
 * Adds new user to the list of remote peers
 * @param {*} message the message received by the webrtc connection 
 */
/* function addNewUserToArray(message){
    remote_peers.push(*)
}

function removeUserFromArray(message){

} */

/**
 * Sends a new text message to the server when enter is pressed or the image button is pressed(TODO). Adds the message to the self send messages. 
 * @param {*} data the message contents 
 * @throws {*} whatever error occurs in sendToServer 
 */
export function sendNewTextMessage(data){
    try{
        sendToServer({
            type:"text-message",
            message_data: data, 
        })
    }catch(err){
        throw err; 
    }
    front_end_handlers.addNewTextMessage(getUsername.get(), data); 
}

/**
 * Sends the file over the websocket connection and the server broadcasts it over the server. 
 * @param {*} file the file to be sent over the connection 
 */
export function sendFileOverChat(file){
    //send the file metadata over the server 
    sendToServer({
        type: "new-file-metadata",
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size, 
        lastModified: file.lastModified, 
    })
    front_end_handlers.addNewFileMetadata(getUsername.get(), getRoomCode.get(), getClientID.get() , file);
    //uniquely identify filename using client id,username and roomcode 

    //enable this to experience the bug 
    let new_filename = getUsername.get() + "_" + getClientID.get() + "_" + getRoomCode.get() + "_" + file.name;  
    let formdata = new FormData(); 
    formdata.append("file", file, new_filename); 
    fetch(window.location.protocol + "//" + getServerURL.get() + "/Files", {
        method: "POST",
        body: formdata
    })
    .then(response => {
        // handle the response here
        log(JSON.stringify(response)); 
    })
    .then(data => {
    // handle the data here
    })
    .catch(err => {
        log(err);
    });  
}

export function closeWebSocketConnection(){
    log("Closing the web socket connection");
    //sanity checks 
    getClientID.reset(); 
    getRoomCode.reset(); 
    getUsername.reset(); 
    if(web_socket_connection){
        web_socket_connection.onclose = null; 
        web_socket_connection.onerror = null; 
        web_socket_connection.onmessage = null; 
        web_socket_connection.onopen = null; 
        web_socket_connection.close(); 
    }
}

