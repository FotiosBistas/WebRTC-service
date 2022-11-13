
import { media_functions } from "./front-end/media-handler.js";
import {initiateConnection} from "./client-back-end/initiate-connection.js"; 
 
let startTheConnection = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    let stream = document.getElementById('local-video').srcObject = localStream; 
    await initiateConnection(stream);
};  

startTheConnection().catch((err) => {
    alert(err); 
}); 



