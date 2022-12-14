import { webSocketConnect } from "./websocket-connection-handler.js"
import { createPeerConnection } from "./peer-connection-handler.js";

let create_room_input = document.getElementById("create_roomcode"); 
let join_room_input = document.getElementById("join_roomcode"); 

let join_room_button = document.getElementById("join-room-button");

let loader = document.getElementsByClassName("loader")[0];

join_room_button.onclick = function() {
    let value = join_room_input.value; 
    webSocketConnect(value, "join"); 
    createPeerConnection(); 
    loader.style.display = "block";
} 

let create_room_button = document.getElementById("create-room-button");

create_room_button.onclick = function() {
    let value = create_room_input.value; 
    webSocketConnect(value, "create")
    createPeerConnection();  
}   




/* webSocketConnect(345,"join "); 

let camera_button = document.getElementById("camera-button");

camera_button.onclick = function(event) {
    let local_stream = media_functions.getMedia({video:true}); 
}  */

