
import { front_end_handlers } from "./front_end_handlers.js";
import { media_functions } from "./media-handler.js";
import {sendToServer,getClientID, closeWebSocketConnection} from "./websocket-connection-handler.js"

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

//temporary solutions works fine for one to one connections
let remote_peer_id = null; 
let remote_stream = new MediaStream(); 
let remote_video = null;

export function setRemotePeerId(id){
    remote_peer_id = id; 
}

export function getRemotePeerId(id){
    return remote_peer_id;
}
/**
 * Sets the local stream to the parameter stream 
 * @param {*} stream the stream to be set 
 */
export function setLocalStream(stream){
    local_stream = stream; 
}
/**
 * 
 * @returns the local stream (video,audio) of the peer connection. 
 */
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
                'stun:stun4.l.google.com:19302',
            ]
        },
        
        {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        },
        {
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        }
            
        
    ]
};


export let peer_connection = null; 

/**
 * 
 * @returns the local peer connection. 
 */
export function getLocalPeerConnection(){
    return peer_connection; 
}

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
    //temporary solution for one to one connection
    /* peer_connection.onclose = function(){
        closePeerConnection(); 
        closeWebSocketConnection(); 
        front_end_handlers.restoreJoinRoomScreen(); 
    }  */
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
            type: "offer", 
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
            //temporary solution works fine for one to one connections
            closePeerConnection(); 
            closeWebSocketConnection(); 
            front_end_handlers.restoreJoinRoomScreen();  
            break;  
    } 
}

export function closePeerConnection(){
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
        peer_connection.close();
        peer_connection = null; 
        local_stream = null; 
        remote_stream = new MediaStream(); 
        front_end_handlers.terminateStreamTracks(); 
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
    
    remote_video = document.getElementById(remote_peer_id + " video"); 
    if(!remote_video){
        remote_video = document.createElement("video");
        remote_video.setAttribute('id', remote_peer_id + " video");
    }
    
    //TODO ADD REMOTE PEER ID
    remote_video.setAttribute('autoplay', true); 

    let video_grid = document.getElementsByClassName("streams")[0];

    video_grid.append(remote_video);

    remote_stream.addTrack(event.track); 
 
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
            //temporary solution works fine for one to one connections
            closePeerConnection();
            closeWebSocketConnection(); 
            front_end_handlers.restoreJoinRoomScreen();
            break;
    }
}

// ALL THE BELOW HANDLERS ARE CALLED THROUGH THE WEBSOCKET CONNECTION ON MESSAGE EVENT. 

/**
 * Get's called by the websocket-connection-handler module whenever there's a new "offer"/"offer-answer"/"new-ice-candidate" message type. 
 * @param {*} message the message received by the signalling server. 
 */
export function callAppropriateHandler(message){
    switch (message.type){
        case "offer": 
            handleNewOffer(message);
            break; 
        case "offer-answer":
            handleOfferAnswer(message); 
            break; 
        case "new-ice-candidate": 
            handleNewICECandidate(message); 
            break; 
    }
}

/**
 * Get's called whenever there's a new message of type "new-ice-candidate" from the signalling server. 
 * @param {*} message the message received by the signalling server. 
 */
async function handleNewICECandidate(message){
    
    log("Received new ice candidate from the remote peer.")

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

    log("Received new offer from the remote peer");
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
        log("Error:(" + err + ") while trying to set remote description inside new offer");
    }

    if(!getLocalStream()){
        try{
            //after that get the media devices of the user and add them into the remote connection 
            front_end_handlers.getLocalMediaAndHandleHtml(); 
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
        type: "offer-answer", 
        sdp: peer_connection.localDescription 
    })
}


/**
 * Receives an offer answer message from the remote peer through the signalling server. 
 * @param {*} msg the message received from the signalling server. It must contains a message description. s
 */
async function handleOfferAnswer(msg){

    log("Received offer answer message");
    //create a new description from the sdp received 
    let new_remote_description = new RTCSessionDescription(msg.sdp);
    try{
        await peer_connection.setRemoteDescription(new_remote_description);
    }catch(err){
        log("Error:(" + err + ") while trying to set remote description inside offer answer");
    }
}

