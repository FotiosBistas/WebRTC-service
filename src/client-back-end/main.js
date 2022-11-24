
import {initiateConnection} from "./initiate-connection.js"; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
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

let offer = null; 
let connection = new RTCPeerConnection(default_configuration); 
let remoteStream = new MediaStream(); 


connection.onicecandidate = async (event) => {
    if(event.candidate) {
        log("New ICE candidate: " + event.candidate);
    }
}

connection.ontrack = (event) => {
    log("tracking event: " + event); 
    event.streams[0].getTrack().forEach((track) =>{
        remoteStream.addTrack(track, localStream); 
    })
} 

await initiateConnection(connection);


