import {createPeerConnection} from "./peer-connection-handler.js"; 


let web_socket_connection = null; 


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}



let offer = null; 
let remoteStream = new MediaStream(); 

let clientID = 0; 
let myUsername = null; 


let connection = await createPeerConnection(); 


function createIdentifier(){
    //TODO create a unique identifier so we can handle connections in the server 

    // ----- TASK  ------- 
}

function connect(){
    let serverURL; 

    connection = new WebSocket(); 

}

