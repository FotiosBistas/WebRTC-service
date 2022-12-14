"use strict"

import { media_functions } from "./media-handler.js";
import {createPeerConnection, peer_connection, closePeerConnection, local_stream, remote_streams} from "./peer-connection-handler.js"

let hostname = window.location.hostname;
if (!hostname) {
  hostname = "localhost";
}

log("Hostname: " + hostname); 
let server_port = 62000; 
let web_socket_connection = null; 
export let current_room_code = null; 
export let clientID = null; 
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
export function webSocketConnect(room_code, action){
    let serverURL; 
    let scheme = "ws"; 
    current_room_code = room_code; 
    current_action = action; 
    /* If the protocol is https you must use web socket secured */
    //--------TASK------- 
    //add extras on the scheme in order to do a web sockets secured 
    if(document.location.protocol === "https:"){
        scheme += "s";
    }

    serverURL = scheme + "://" + hostname + ":" + server_port; 
    log("Server URL is: " + serverURL);

    web_socket_connection = new WebSocket(serverURL, "json"); 
    
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

    let roomElements = document.getElementsByClassName("room");
    let room = roomElements[0];

    let chatandcallElements = document.getElementsByClassName("chatandcall");
    let chatandcall = chatandcallElements[0];

    chatandcall.hidden = true; 
    room.hidden = false; 
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
            clientID = msg.identifier; 
            //after that send immediately which room you want to join/create 
            sendToServer({
                type: current_action + "_room_code", 
                id: clientID, 
                room_code: current_room_code 
            });
             
            break; 
        case "user-left": 
            //some other user left the call 
            log("Received user left message. User was: " + msg.id); 
            let left_user = msg.identifier; 
            handleUserLeaving(left_user); 
            break; 
        case "successful-room":
            //user created or joined a room successfully 
            log("Received successful room message");
            handleSuccessfulRoom(); 
            break; 
        case "new-ice-candidate": 
            handleNewICECandidate(msg); 
            break; 
        case "offer-answer":
            handleOfferAnswer(msg); 
            break; 
        case "error": 
            handleErrorReceivedByServer(msg);
            break; 
        case "offer":
            handleNewOffer(msg); 
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


async function handleNewICECandidate(message){
    
    if (!("candidate" in message) || !message.candidate){
        log("Received new ice candidate event without candidate value")
        return 
    }

    let new_candidate = new RTCIceCandidate(message.candidate);
    try{
        await peer_connection.addIceCandidate(new_candidate);
    }catch(err){
        log("Error while adding new ICE candidate: " + err); 
    }
}

/**
 * Receives a new offer from the remote peer through the signalling server. 
 * Creates the peer connection if it's not already created. 
 * 
 * @param {*} msg this message should have the following structure: 
 * 
 * {id:clientID, type: "offer",  room_code: current_room_code, sdp: peer_connection.localDescription,} 
 */
async function handleNewOffer(msg){

    //if there isn't a peer connection underway it must be created 
    if(!peer_connection){
        createPeerConnection(); 
    }


    //create a new description from the sdp received 
    let new_remote_description = new RTCSessionDescription(msg.sdp);
 

    
    log("Setting remote description because new offer was received");
    try{
        await peer_connection.setRemoteDescription(new_remote_description);
    }catch(err){
        log("Error:(" + err + ") while trying to set remote description");
    }

    if(!local_stream){
        try{
            local_stream = media_functions.getMedia({
                audio: true, 
                video: true, 
            }); 
        }catch(err){
            media_functions.handleGetUserMediaError(err); 
        }
    }

    //create answer and set local description 
    try{
        let answer = await peer_connection.createAnswer(); 
        await peer_connection.setLocalDescription(answer);
    }catch(err){
        log("Error:(" + err + ") while trying to create answer");
    }

    sendToServer({
        room_code: current_room_code, 
        type: "offer-answer", 
        id: clientID, 
        sdp: peer_connection.localDescription 
    })
}

/**
 * Receives an offer answer message from the remote peer through the signalling server. 
 * @param {*} msg 
 */
async function handleOfferAnswer(msg){

    //create a new description from the sdp received 
    let new_remote_description = new RTCSessionDescription(msg.sdp);
    try{
        await peer_connection.setRemoteDescription(desc);
    }catch(err){
        log("Error:(" + err + ") while trying to set remote description");
    }
}

function handleUserLeaving(clientID){
    //TODO HANDLE HTML CSS 

    //-------TASK---------
}

function handleErrorReceivedByServer(error){
    alert(error.error_data);
    
    //TODO HANDLE HTML CSS 

    //-------TASK---------
    let loader = document.getElementsByClassName("loader")[0];

    //message received stop loading 
    if(loader.style.display !== "none"){
        loader.style.display = "none";
    }
    
}

function handleSuccessfulRoom(){

    let loader = document.getElementsByClassName("loader")[0];

    //message received stop loading 
    if(loader.style.display !== "none"){
        loader.style.display = "none";
    }

    let roomElements = document.getElementsByClassName("room");
    let room = roomElements[0];

    let chatandcallElements = document.getElementsByClassName("chatandcall");
    let chatandcall = chatandcallElements[0];

    chatandcall.style.display = "grid"; 
    room.style.display = "none"; 
}

function closeWebSocketConnection(){
    log("Closing the web socket connection");
    if(!web_socket_connection){
        web_socket_connection.onclose = null; 
        web_socket_connection.onerror = null; 
        web_socket_connection.onmessage = null; 
        web_socket_connection.onopen = null; 
        web_socket_connection.close(); 
    }
}