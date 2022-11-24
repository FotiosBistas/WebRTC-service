
import { media_functions } from "./media-handler.js";
import {initiateConnection} from "./initiate-connection.js"; 
import {handleOffer} from "./receive-connection.js"

let offer = null; 

let startTheConnection = async() => {
    let localStream = await media_functions.getMedia({
        video: true, 
        audio: true,
    });
    let stream = document.getElementById('local-video').srcObject = localStream; 
    offer = await initiateConnection(stream);
    return offer; 
};  

startTheConnection()
.then((offer) => {
    //TODO obviously it should not be here and it should be called once the
    //server sends the offer 
    console.log("Description of the offer: ",offer);
    handleOffer(offer); 
})
.catch((err) => {
    alert(err); 
}); 

console.log("Handling offer")
