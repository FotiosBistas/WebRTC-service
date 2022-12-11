"use strict"

import {peer_connection} from "./peer-connection-handler.js"

let hostname = window.location.hostname;
if (!hostname) {
  hostname = "localhost";
}

log("Hostname: " + hostname); 
let server_port = 62000; 
let web_socket_connection = null; 
let current_room_code = null; 
export let clientID = null; 
let current_action = null; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

/**
 * Turns the message into JSON and sends it over the server. 
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
export async function webSocketConnect(room_code, action){
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
            log("Received new ID message from connection"); 
            clientID = msg.identifier; 

            sendToServer({
                type: current_action + "_room_code", 
                id: clientID, 
                room_code: current_room_code 
            });
             
            break; 
        case "new-ice-candindate": 
            handleNewICECandidate(msg); 
            break; 
        case "offer-answer":
            handleOfferAnswer(msg); 
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

    //send room code to server 
    //client id is not yet defined 
    //REMINDER: this is checked by the server: 
    /* 
        case "create_room_code": 
            break; 
        case "join_room_code":
            break; 
    */
    
    
   
    

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

async function handleNewOffer(msg){
    
}

async function handleOfferAnswer(msg){

}