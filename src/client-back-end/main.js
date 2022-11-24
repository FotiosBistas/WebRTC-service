
import { media_functions } from "./media-handler.js";
import {initiateConnection} from "./initiate-connection.js"; 
import {handleOffer, handleTrack} from "./receive-connection.js"


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


let startTheConnection = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    document.getElementById('local-video').srcObject = localStream; 
    offer = await initiateConnection(connection, localStream);
    return Promise.resolve(offer); 
};  

connection.ontrack((track) => {}); 


startTheConnection()
.then((offer) => {
    //TODO obviously it should not be here and it should be called once the
    //server sends the offer 
    console.log("Description of the offer: ",offer);
    handleOffer(connection, offer); 
})
.catch((err) => {
    alert(err); 
}); 

console.log("Handling offer")
