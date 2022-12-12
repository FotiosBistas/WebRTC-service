import {media_functions} from "./media-handler.js"
import { webSocketConnect } from "./websocket-connection-handler.js"


/* let join_room_button = document.getElementById("join-room-button");

join_room_button.onclick = function() {
    let value = room_input.value; 
    webSocketConnect(value); 
    window.location.href = "video-call.html";
} 

let create_room_button = document.getElementById("create-room-button");
let room_input = document.getElementById("roomcode"); 
create_room_button.onclick = function() {
    let value = room_input.value; 
    window.location.href = "video-call.html";
}   */


webSocketConnect(345,"join "); 

/* let camera_button = document.getElementById("camera-button");

camera_button.onclick = function(event) {
    let local_stream = media_functions.getMedia({video:true}); 
} */

