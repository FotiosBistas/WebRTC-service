import {peer_connection} from "./peer-connection-handler.js"

let hostname = "127.0.0.1"; 
let server_port = 60503; 
let web_socket_connection = null; 


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

/**
 * Turns the message into JSON and sends it over the server. 
 * @param {*} message 
 */
export function sendToServer(message){
    if (!("type" in message) || !message.type) {
        log("Error: message doesn't have type property")
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

function createIdentifier(){
    //TODO create a unique identifier so we can handle connections in the server 

    // ----- TASK  ------- 
}

export function webSocketConnect(){
    let serverURL; 
    let scheme = "ws"; 

    //--------TASK------- 
    //add extra s on the scheme in order to do a web sockets secured 
    serverURL = scheme + "://" + hostname + ":" + server_port; 

    web_socket_connection = new WebSocket(serverURL); 

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
        case "new-ice-candindate": 
            handleNewICECandidate(msg); 
            break; 
        case "offer-answer":
            handleOfferAnswer
            break; 

        case "offer":
            handleNewOffer(msg); 
            break; 
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

async function handleNewOffer(msg){
    
}

async function handleOfferAnswer(msg){

}