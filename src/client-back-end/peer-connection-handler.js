
import { media_functions } from "./media-handler.js";
import {sendToServer,clientID, current_room_code} from "./websocket-connection-handler.js"

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let media_config = {
    video: true, 
    audio: true, 
}

let remote_streams = []; 

const default_configuration = {
    iceServers: [
        {
            urls:[
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        }
    ]
};


export let peer_connection = null; 

/**
 * Creates a RTCPeerConnection 
 * @returns the peer connection created with the appropriate handlers 
 */
export async function createPeerConnection(){
    log("Creating new peer connection"); 
    peer_connection = new RTCPeerConnection(default_configuration); 
    peer_connection.onconnectionstatechange = handleConnectionStateChangeEvent;
    peer_connection.onicecandidate = handleICECandidateEvent;
    peer_connection.ontrack = handleTrackEvent;
    peer_connection.onnegotiationneeded = handleNegotiationNeededEvent; 
    peer_connection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;

    return peer_connection; 
}


/**
 * Handle negotiation event get's called as soon as a peer wants to connect
 * Can either restart, resume or initiate a rtc connection 
 */
async function handleNegotiationNeededEvent(){
    log("Handling negotiation");
    try{

        //Verify there is no ongoing exchange of offer and answer underway.
        if (peer_connection.signalingState != "stable") {
            log("There is an ongoing exchange of offer and answer"); 
            return; 
        }

        const offer = await connection.createOffer(); 

        log("Setting local description with offer: " + offer); 
        await connection.setLocalDescription(offer);

        log("Sending the offer to the remote peer")
        
        sendToServer({
            id: clientID, 
            type: "offer", 
            room_code: current_room_code, 
            sdp: peer_connection.localDescription, 
        });
        
    }catch(error){
        log("error while handling negotiation needed", error);
    }
}


/**
 * Whenever the enum of the connection state changes this is called.
 * Only thing it does now is it: closes the connection and handles the attributes
 */
function handleConnectionStateChangeEvent(event){
    //new,connecting,connected,disconnected 
    switch(peer_connection.connectionState){
        case "connected":
            log("Peers successfully connected");
            break; 
        case "closed":
            closeConnection(); 
            break;  
    } 
}

function closeConnection(){

    //avoid having additional events coming to the connection 
    peer_connection.onconnectionstatechange = null;
    peer_connection.onicecandidate = null;
    peer_connection.onicegatheringstatechange = null; 
    peer_connection.ontrack = null;
    peer_connection.onnegotiationneeded = null; 
    peer_connection.oniceconnectionstatechange = null;

    //TODO handle the html,css to end the connection 

    // ----- TASK  ------- 

    peer_connection.close(); 
}


/**
 * Gets called whenever a track is received from the connection. 
 * track events include the following fields:
 * 
 * RTCRtpReceiver       receiver
 * 
 * MediaStreamTrack     track
 * 
 * MediaStream[]        streams
 * 
 * RTCRtpTransceiver    transceiver
 * @param {*} event contains the above data. 
 */
function handleTrackEvent(event){
    log("Handling track event");
    event.streams[0].getTrack().forEach((track) =>{
        //TODO add tracks to the remote stream(s) and handle the html/css 

        // ----- TASK  -------
        peer_connection.addTrack(track,); 
    });
}

/**
 * Gets called when there's a new ice candidate. 
 * 
 * @param {*} event 
 */
function handleICECandidateEvent(event){
    if(event.candidate){
        log("Handling ICE candidate event"); 
        //send ice candidate to server 
        //this also includes the candidates which string is " "
        //this means that the ICE negotiation has finished. s

        sendToServer({
            id: clientID, 
            room_code: current_room_code, 
            type: "new-ice-candidate",
            candidate: event.candidate
        });
    }
}

function handleICEConnectionStateChangeEvent(event) {
    log("Handling ice connection state change");

    switch(peer_connection.iceConnectionState){
        case "closed":
        case "failed":
        case "disconnected":
            closeConnection();
            break;
    }
}