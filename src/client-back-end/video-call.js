import {media_functions} from "./media-handler.js";
import { createPeerConnection} from "./peer-connection-handler.js"; 
import { webSocketConnect } from "./websocket-connection-handler.js";



async function initiateCall(){
    webSocketConnect(345, "join"); 
    createPeerConnection();  
    let webcamStream = null; 
    try{
        webcamStream = await media_functions.getMedia({
            video: true, 
            audio: true, 
        });
    }catch(err){
        media_functions.handleGetUserMediaError(err); 
    }

    document.getElementById("local_video").srcObject = webcamStream;
}

await initiateCall(); 
/* let local_player = `<div class="stream_container">
<div class="video_player"></div>
</div>`

document.getElementById('streams').insertAdjacentHTML('beforeend', player) */



