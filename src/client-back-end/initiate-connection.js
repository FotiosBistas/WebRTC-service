
import { media_functions } from "./media-handler.js";


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}



export async function initiateConnection(connection){
    try{
        let localStream = await media_functions.getMedia({
            video: true, 
            audio: true,
        });
        document.getElementById('local-video').srcObject = localStream; 

        //add tracks into stream 
        localStream.getTracks().forEach((track => {
            connection.addTrack(track, localStream); 
        }));

        let offer = await connection.createOffer(); 
        await connection.setLocalDescription(offer);
        //TODO send the offer to the signalling server 
        return Promise.resolve(offer); 
    }catch(error){
        console.log("error in iniatiate connection", error);
    }
}



