import { webSocketConnect,getServerURL,sendNewTextMessage, closeWebSocketConnection,sendFileOverChat, getClientID } from "./websocket-connection-handler.js"
import {getLocalStream ,closePeerConnection} from "./peer-connection-handler.js";
import { media_functions } from "./media-handler.js";

let create_room_input = document.getElementById("create_roomcode"); 
let join_room_input = document.getElementById("join_roomcode"); 
let join_username_input = document.getElementById("join_username");
let join_room_button = document.getElementById("join-room-button");

let loader = document.getElementsByClassName("loader")[0];


join_room_button.onclick = function() {
    let value = join_room_input.value;
    let username = join_username_input.value; 
    try{
        webSocketConnect(value, "join", username); 
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
let fileInput = document.getElementById("file-input"); 
let room = document.getElementsByClassName("room")[0]; 
let chat_and_call = document.getElementsByClassName("chatandcall")[0];

disconnect.onclick = function(event){
    closePeerConnection(); 
    closeWebSocketConnection(); 
    room.style.display = "block"; 
    chat_and_call.style.display = "none"; 
}

camera.onclick = function(event){
    
    getLocalStream().getTracks().forEach((track) => {
        if (track.kind === 'video') {
            //inverts it each time 
            if (track.enabled == true) {
                track.enabled = false;
                camera.className = "fa-solid fa-video-slash";
            }else{
                track.enabled = true;
                camera.className = "fa-solid fa-video";
            }
        }
    }); 
}

microphone.onclick = function(event){
    getLocalStream().getTracks().forEach((track) => {
        if (track.kind === 'audio') {
            //inverts it each time 
            if (track.enabled == true) {
                track.enabled = false;
                microphone.className = "fa-solid fa-microphone-slash";
            }else{
                track.enabled = true;
                microphone.className = "fa-solid fa-microphone";
            }
        }
    }); 
}
// Add an event listener to the file input element to handle file selection
fileInput.onchange = function(event){
    // Get the selected file
    const file = event.target.files[0];
    
    // Send the file over the chat 
    sendFileOverChat(file);
};


let form = document.getElementById('upload-file-form');

/* form.addEventListener('submit', function(event) {
    event.preventDefault();  // prevent the form submission from navigating away from the page
     let fileInput = document.querySelector('input[type="file"]');
    let file = fileInput.files[0];  // get the file object

    // create a form data object and append the file to it
    let formData = new FormData();
    formData.append('file', file);
    let url = new URL(`${document.location.protocol}//${getServerURL.get()}/UploadFiles`); 
    // send the file to the server using the fetch API
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // handle the response here
    })
    .catch(error => {
        console.error(error);
    });
}); */

toggle_chat_panel.onclick = function(event){
    if(chat.style.display === "none"){
        chat.style.display = "flex";
    }else{
        chat.style.display = "none";
    }  
}





