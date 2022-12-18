import { webSocketConnect,sendNewTextMessage, closeWebSocketConnection } from "./websocket-connection-handler.js"
import { createPeerConnection,getLocalStream ,closePeerConnection} from "./peer-connection-handler.js";
import { media_functions } from "./media-handler.js";

let create_room_input = document.getElementById("create_roomcode"); 
let join_room_input = document.getElementById("join_roomcode"); 
let join_username_input = document.getElementById("join_username");


let join_room_button = document.getElementById("join-room-button");

let loader = document.getElementsByClassName("loader")[0];

let local_video = document.getElementById("local_video"); 


let peer_connection = null; 

join_room_button.onclick = function() {
    let value = join_room_input.value;
    let username = join_username_input.value; 
    try{
        webSocketConnect(value, "join", username); 
        peer_connection = createPeerConnection(); 
    }catch(err){
        alert("Error: " + err + " while trying to join the server")
    }

    loader.style.display = "block";

    
} 

let create_room_button = document.getElementById("create-room-button");
let create_username_input = document.getElementById("create_username");

create_room_button.onclick = function() {
    let value = create_room_input.value; 
    let username = create_username_input.value; 
    try{
        webSocketConnect(value, "create", username); 
        peer_connection = createPeerConnection(); 
    }catch(err){
        alert("Error: " + err + " while trying to create the server")
    }   
    loader.style.display = "block";
}


let chat_input = document.getElementById("chat-input"); 

chat_input.addEventListener(("keypress"), function(event){
    let data = event.target.value; 
    if(data.length > 100){
        alert("Can't enter more that a hundred");
    }else if(event.key == "Enter"){
        sendNewTextMessage(data);
        event.target.value = ""; 
        //TODO HANDLE THE IMAGE BUTTON 
    }
})

let disconnect = document.getElementById("disconnect-image");
let camera = document.getElementById("camera-image");
let microphone = document.getElementById("microphone-image");
let chat = document.getElementsByClassName("chat")[0];
let toggle_chat_panel = document.getElementById("chat-image");


disconnect.onclick = function(event){
    closePeerConnection(); 
    closeWebSocketConnection(); 
    //TODO HANDLE HTML CSS
}

camera.onclick = function(event){
    
    getLocalStream().getTracks().forEach((track) => {
        if (track.kind === 'video') {
            //inverts it each time 
            track.enabled = !track.enabled;
        }
    }); 
}

microphone.onclick = function(event){
    getLocalStream().getTracks().forEach((track) => {
        if (track.kind === 'audio') {
            //inverts it each time 
            track.enabled = !track.enabled;
        }
    }); 
}

toggle_chat_panel.onclick = function(event){
    if(chat.style.display === "none"){
        chat.style.display = "flex";
    }else{
        chat.style.display = "none";
    }
    
}

