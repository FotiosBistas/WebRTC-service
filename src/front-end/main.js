
import { media_functions } from "./media-handler.js";

let set_local_stream = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    document.getElementById('local-video').srcObject = localStream; 
};  

set_local_stream(); 