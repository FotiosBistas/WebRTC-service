
import { media_functions } from "./front-end/media-handler.js";
import {initiateConnection} from "./client-back-end/initiate-connection.js"; 
import {receiveInitialConnection} from "./client-back-end/receive-connection.js"

let connection = null; 

let startTheConnection = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    let stream = document.getElementById('local-video').srcObject = localStream; 
    connection = await initiateConnection(stream);
};  

startTheConnection().catch((err) => {
    alert(err); 
}); 



await receiveInitialConnection(connection); 