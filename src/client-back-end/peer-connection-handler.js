
import { media_functions } from "./media-handler.js";


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let media_config = {
    video: true, 
    audio: true, 
}

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


let peer_connection = null; 

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
        


        /* //add tracks into stream 
        localStream.getTracks().forEach((track => {
            connection.addTrack(track, localStream); 
        })); */

        const offer = await connection.createOffer(); 

        //Verify there is no ongoing exchange of offer and answer underway.
        if (peer_connection.signalingState != "stable") {
            log("There is an ongoing exchange of offer and answer"); 
            return; 
        }

        log("Setting local description with offer: " + offer); 
        await connection.setLocalDescription(offer);

        log("Sending the offer to the remote peer")
        return Promise.resolve(offer); 

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
    event.stream[0].getTrack().forEach((track) =>{
        //TODO add tracks to the remote stream(s) and handle the html/css 

        // ----- TASK  -------
    });
}

/**
 * Gets called using on ice candidate event. 
 * 
 * @param {*} event 
 */
function handleICECandidateEvent(event){
    if(event.candidate){
        log("Handling ICE candidate event"); 
        //send ice candidate to server 
        //this also includes the candidates which string is " "
        //this means that the ICE negotiation has finished. s

        // ----- TASK  -------
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