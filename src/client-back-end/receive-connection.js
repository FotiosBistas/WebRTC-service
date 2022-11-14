
import {media_functions} from ""

let remoteStream = new MediaStream(); 
let connection = new RTCPeerConnection(); 

export async function handleOffer(offer){
    connection.setRemoteDescription(offer)

    //capturing local media should not be done in this way 
    .then(() => navigator.mediaDevices.getUserMedia())
    .then(stream => {
        document.getElementById('local-video').srcObject = stream; 
        console.log("Adding stream: ",stream, " to connection"); 

        stream.getTracks().forEach(track => {
            console.log("Adding track: ",track, " to connection"); 
            connection.addTrack(track, stream);
        }); 
        return connection
    });    
    
    
    /* connection.ontrack = (stream) => {
        console.log("Stream[0]", stream[0]); 
        stream.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track); 
        });
    }; */
}

export async function handleAnswer(){/* 
    connection.setRemoteDescription(answer) */
}

//should not be done this way but yes 
export async function sendAnswer(){
    connection.createAnswer()
    .then( answer => {
        connection.setLocalDescription(answer); 
    })
    .then({
        //send the answer to the signalling server 
    }); 
}