import {media_functions} from "./media-handler.js"
import { webSocketConnect } from "./websocket-connection-handler.js"

/* let join_room_button = document.getElementById("join-room-button");

join_room_button.onclick = function() {
    window.location.href = "video-call.html"
} */

/* let create_room_button = document.getElementById("create-room-button");

create_room_button.onclick = function() {

} */


/* let camera_button = document.getElementById("camera-button");

camera_button.onclick = function(event) {
    let local_stream = media_functions.getMedia({video:true}); 
} */



webSocketConnect(); 