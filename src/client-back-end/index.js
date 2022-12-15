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
    webSocketConnect(value, "join"); 
    peer_connection = createPeerConnection(); 
    loader.style.display = "block";

    media_functions.getMedia({
        audio: true, 
        video: true, 
    }).then((stream) => {
        local_video.srcObject = stream; 
        stream.getTracks().forEach((track) => {
            peer_connection.addTrack(track);
        });
    });  
} 

let create_room_button = document.getElementById("create-room-button");

create_room_button.onclick = function() {
    let value = create_room_input.value; 
    webSocketConnect(value, "create")
    peer_connection = createPeerConnection(); 
    
    media_functions.getMedia({
        audio: true, 
        video: true, 
    }).then((stream) => {
        local_video.srcObject = stream; 
        stream.getTracks().forEach((track) => {
            peer_connection.addTrack(track);
        });
    });  
}   




/* webSocketConnect(345,"join "); 

let camera_button = document.getElementById("camera-button");

camera_button.onclick = function(event) {
    let local_stream = media_functions.getMedia({video:true}); 
}  */

