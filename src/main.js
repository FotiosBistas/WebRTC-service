
import { media_functions } from "./front-end/media-handler.js";
import {initiateConnection} from "./back-end/initiate-connection.js"; 
 
let set_local_stream = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    let stream = document.getElementById('local-video').srcObject = localStream; 
    await initiateConnection(stream);
};  

set_local_stream().catch((err) => {
    alert(err); 
}); 



