import { webSocketConnect } from "./websocket-connection-handler.js"
import { createPeerConnection } from "./peer-connection-handler.js";
import { media_functions } from "./media-handler.js";

let create_room_input = document.getElementById("create_roomcode"); 
let join_room_input = document.getElementById("join_roomcode"); 

let join_room_button = document.getElementById("join-room-button");

let loader = document.getElementsByClassName("loader")[0];

let local_video = document.getElementById("local_video"); 


let peer_connection = null; 

join_room_button.onclick = function() {
    let value = join_room_input.value;
    
    try{
        webSocketConnect(value, "join"); 
        peer_connection = createPeerConnection(); 
    }catch(err){
        alert("Error: " + err + " while trying to join the server")
    }

    loader.style.display = "block";

    
} 

let create_room_button = document.getElementById("create-room-button");

create_room_button.onclick = function() {
    let value = create_room_input.value; 
    try{
        webSocketConnect(value, "create"); 
        peer_connection = createPeerConnection(); 
    }catch(err){
        alert("Error: " + err + " while trying to create the server")
    }   
    loader.style.display = "block";
}


let chat_input = document.getElementById("chat-input"); 

chat_input.onkeyup = function(event){
    let data = event.target.value; 
    if(data.length > 100){
        alert("Can't enter more that a hundred");
    }
}

/* chat_input.oninput = function(event){
    this.style.height = this.value.length + "ch";
} */

function resizeInput(){

}

/* webSocketConnect(345,"join "); 

let camera_button = document.getElementById("camera-button");

camera_button.onclick = function(event) {
    let local_stream = media_functions.getMedia({video:true}); 
}  */

