
import { media_functions } from "./media-handler.js";
import {sendToServer,clientID, current_room_code} from "./websocket-connection-handler.js"

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

//types of media we want permission from user 
let media_config = {
    video: true, 
    audio: true, 
}

//remote streams that will come to conneciton 
export let remote_streams = []; 
//local stream 
export let local_stream = null; 

export function setLocalStream(stream){
    local_stream = stream; 
}

export function getLocalStream(){
    return local_stream; 
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


export let peer_connection = null; 

/**
 * Creates a RTCPeerConnection assigning the result. 
 * @returns the peer connection created with the appropriate handlers 
 */
export function createPeerConnection(){
    log("Creating new peer connection"); 
    try{
        peer_connection = new RTCPeerConnection(default_configuration); 
    }catch(err){
        throw new Error("couldn't establish peer connection"); 
    }
    
    peer_connection.onconnectionstatechange = handleConnectionStateChangeEvent;
    peer_connection.onicecandidate = handleICECandidateEvent;
    peer_connection.ontrack = handleTrackEvent;
    peer_connection.onnegotiationneeded = handleNegotiationNeededEvent; 
    peer_connection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
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

        const offer = await peer_connection.createOffer(); 

        log("Setting local description with offer: " + offer); 
        await peer_connection.setLocalDescription(offer);

        log("Sending the offer to the remote peer")
        
        sendToServer({
            id: clientID, 
            type: "offer", 
            room_code: current_room_code, 
            sdp: peer_connection.localDescription, 
        });
        
    }catch(error){
        log("Error:(" + error + ")while handling negotiation needed", error);
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
            closePeerConnection(); 
            break;  
    } 
}

export function closePeerConnection(){
    let local_video = document.getElementById(clientID);    
    if(peer_connection){
        log("Closing the peer connection");
        //avoid having additional events coming to the connection 
        peer_connection.onconnectionstatechange = null;
        peer_connection.onicecandidate = null;
        peer_connection.onicegatheringstatechange = null; 
        peer_connection.ontrack = null;
        peer_connection.onnegotiationneeded = null; 
        peer_connection.oniceconnectionstatechange = null;

        //stopping the transceivers which are pairings of RTCRtp senders and receivers
        //these essentially send the media stream tracks over the connection. 
        peer_connection.getTransceivers().forEach((transceiver) => transceiver.stop())
        
        if(local_video.srcObject){
            local_video.srcObject.getTracks().forEach((track) => track.stop()); 
        } 

        
        peer_connection.close();
        peer_connection = null; 
        local_stream = null; 

        local_video.remove(); 
    } 
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
    let remote_stream = new MediaStream(); 

    let remote_video = document.createElement("video");
    //TODO ADD REMOTE PEER ID
    remote_video.setAttribute('autoplay', true); 


    let video_grid = document.getElementsByClassName("streams")[0];

    video_grid.append(remote_video);

    remote_stream.addTrack(event.track); 
    remote_streams.push(remote_stream);
 
    remote_video.srcObject = remote_stream; 

}

/**
 * Gets called when there's a new ice candidate. 
 * 
 * @param {*} event 
 */
function handleICECandidateEvent(event){
    if(event.candidate){
        log("Handling new ICE candidate event"); 
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
            closePeerConnection();
            break;
    }
}

