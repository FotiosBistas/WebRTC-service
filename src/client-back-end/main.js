import {createPeerConnection} from "./connection-handler"; 

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}



let offer = null; 
let remoteStream = new MediaStream(); 

let clientID = 0; 
let myUsername = null; 


function createIdentifier(){
    //TODO create a unique identifier so we can handle connections in the server 

    // ----- TASK  ------- 
}

function connect(){
    let serverURL; 


}

