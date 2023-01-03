import { media_functions } from "./media-handler.js";
import {setLocalStream, getLocalStream, getLocalPeerConnection, setRemotePeerId, getRemotePeerId} from "./peer-connection-handler.js"; 
import { closeWebSocketConnection, getClientID, getServerURL,sendToServer } from "./websocket-connection-handler.js";

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function getCurrentDateTime(){
    const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var currentdate = new Date(); 
    var datetime = month[currentdate.getMonth()] + " "+ currentdate.getDay() +", " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    return datetime;
}

// THIS FILE HANDLES HTML AND CSS 

/*these handlers handle the html and css of the user
by receiving messages from the websocket connection.*/
export let websocket_front_end_handlers = {

    /**
     * When the user receives the message from the server that it successfully connected to the room, 
     * perform all the necessary operations to display the chat and call html/css 
     * and add the user's peerconnection to the local video stream. 
     */
    handleSuccessfulRoom: function(){
        log("Received successful room message");
        //after that get the media devices of the user and add them into the html document 
        front_end_handlers.getLocalMediaAndHandleHtml(); 

        let loader = document.getElementsByClassName("loader")[0];
    
        //message received stop loading 
        if(loader.style.display !== "none"){
            loader.style.display = "none";
        }
    
        let roomElements = document.getElementsByClassName("room");
        let room = roomElements[0];
    
        let chatandcallElements = document.getElementsByClassName("chatandcall");
        let chatandcall = chatandcallElements[0];
    
        chatandcall.style.display = "grid"; 
        room.style.display = "none"; 
    },

    /**
     * After user joins the room the server sends back an active members list so they can be added to the active members list.
     * Get's called when a new "active-members" message is received from the server. 
     * @param {*} message the message received from the web socket connection
     */
    handleActiveMembers: function(message){
        let active_members_list = document.getElementsByClassName("active-members")[0]; 
        message.active_members.forEach((member) => {
            if(getClientID.get() !== member.id){
                let new_active_user_box = document.createElement("div");
                new_active_user_box.setAttribute("class", "active-member-box"); 
                new_active_user_box.innerHTML = `<h3>` + member.username + `</h3>` 
                new_active_user_box.setAttribute("id", member.id + " active_user_box"); 
                active_members_list.append(new_active_user_box);
                setRemotePeerId(member.id);
            }
        });
    },

    /**
     * Gets called when there's a new message-history type message received from the websocket connection. 
     * @param {*} message the message received from the websocket connection. It contains a list of messages. 
     */
    handleMessageHistory: function(message){
        message.messages.forEach((msg) => {
            if(msg.type === "new-file-metadata"){
                this.handleNewFileMetadata(msg);
            }else if(msg.type === "text-message"){
                this.handleNewTextMessage(msg); 
            }
        });
    },

    /**
     * Gets called the the websocket connection receives a new text message from the server. It adds it into the chat elements. 
     * @param {*} message the text message received from the server
     */
    handleNewTextMessage: function(message){
        let container = document.createElement("div");
        container.setAttribute('class', "message-container-other");

        let new_message = document.createElement("div");
        //specifies it's the peer who sent the message 
        new_message.setAttribute('class', "message_container"); 
        new_message.setAttribute('id', message.id + " message_container");
        new_message.innerHTML = `<h3>` + message.username + `</h3>`; 
        new_message.insertAdjacentHTML("beforeend",`<p>` + message.message_data + `</p>`);
        container.appendChild(new_message);    
        
        let date = document.createElement("div");
        date.setAttribute('id', "date");
        date.innerHTML =  `<p>` + getCurrentDateTime() + `</p>`;
        container.appendChild(date);

        let messages = document.getElementsByClassName("messages")[0];
        messages.appendChild(container);
        // Scroll to the bottom of the div
    },

    /**
     * Adds new file metadata to chatroom received by the websocket connection. 
     * IMPORTANT: also adds a listener for each link so the users can press it and download the files. 
     * @param {*} message the message received by the websocket connection.
     */
    handleNewFileMetadata: function(message){
        let container = document.createElement("div");
        container.setAttribute('class', "message-container-other");

        let new_message = document.createElement("div");
        //specifies it's the peer who sent the message 
        new_message.setAttribute('class', "message_container"); 
        new_message.setAttribute('id', message.id + " message_container");
        new_message.innerHTML = `<div class="metadata_link"
        data-clientID="${message.id}"
        data-roomcode="${message.room_code}"
        data-filename="${message.fileName}"
        data-username="${message.username}">` 
        + `<h3 id="header_metadatalink">` 
        + message.username + `</h3>` + `<a id="metadata_link" href="#">` + message.fileName 
        + message.fileType + `</a>` + `<br> Filesize is: ` + message.fileSize + ` bytes <br> Last modified: ` + new Date(message.lastModified) + 
        `</div>`;  
        container.appendChild(new_message);
        
        let date = document.createElement("div");
        date.setAttribute('id', "date");
        date.innerHTML =  `<p>` + getCurrentDateTime() + `</p>`;
        container.appendChild(date);

        let chat = document.getElementsByClassName("chat")[0];
        

        let chat_input_box = document.getElementsByClassName("messages")[0];

        chat_input_box.appendChild(container);
        
    
        chat.scrollTop = chat.scrollHeight;
    },

    /**
     * Receives an error message from the server and displays it to the user. 
     * @param {*} error message received by the websocket connection
     */
    handleErrorReceivedByServer: function(error){
        alert(error.error_data);
        if(error.error_data === "currently only two peers are supported"){
            closeWebSocketConnection(); 
        }
        //TODO HANDLE HTML CSS 
    
        //-------TASK---------
        let loader = document.getElementsByClassName("loader")[0];
    
        //message received stop loading 
        if(loader.style.display !== "none"){
            loader.style.display = "none";
        }
    },
    /**
     * Get's called when a new "user-joined" message is received by the server.When user joins: 
     * 
     * -add the user into the active users list 
     * 
     * -display user join message in the chat 
     * @param {*} message message received from the websocket connection.
     */
    handleUserJoining: function(message){
        let active_members_list = document.getElementsByClassName("active-members")[0]; 
        let new_active_user_box = document.createElement("div");
        new_active_user_box.setAttribute("class", "active-member-box"); 
        new_active_user_box.innerHTML = `<h3>` + message.username + `</h3>` 
        new_active_user_box.setAttribute("id", message.id + " active_user_box"); 
        active_members_list.append(new_active_user_box);

        setRemotePeerId(message.id); 
        //TODO display user joined message in the chat. 
    },  


    /**
     * Get's called whenever a new "user-left is received by the server".When user leaves you must: 
     * remove the user from the active users 
     * remove the user's video from the videos 
     * @param {*} message 
     */
    handleUserLeaving: function(message){
        log("Received user left message. User was: " + message.id); 

        //TODO HANDLE HTML CSS 

        //-------TASK---------
        //remove user from active users
        let member_left = document.getElementById(message.id + " active_user_box"); 
        if(member_left){
            member_left.remove(); 
        }

        let remote_video = document.getElementById(message.id + " video");
        //TODO remove stream from remote streams 
        if(remote_video){
            remote_video.srcObject.getTracks().forEach((track) => {
                track.stop(); 
            });
            remote_video.remove();  
        }
    }
}

/* These handlers are general purpose html/css handlers*/ 
export let front_end_handlers = {
    /**
     * When the websocket connection closes go back to the join/create room screen. 
     */
    restoreJoinRoomScreen: function(){
        let roomElements = document.getElementsByClassName("room");
        let room = roomElements[0];

        let chatandcallElements = document.getElementsByClassName("chatandcall");
        let chatandcall = chatandcallElements[0];

        if(chatandcall.style.display !== "none"){
            chatandcall.style.display = "none"; 
        }
        if(chatandcall.style.display !== "block"){
            room.style.display = "block"; 
        }
    },

    /**
     * Gets the local media of the user and adds into the video grid to be displayed and sent to the other users. 
     */
    getLocalMediaAndHandleHtml: function(){
        let stream = media_functions.local_stream; 
        setLocalStream(stream);

        getLocalStream().getTracks().forEach((track) => {
            getLocalPeerConnection().addTrack(track);
        });

        let video = document.createElement('video');
        video.muted = true; // The peer must not hear its own audio.
        video.setAttribute('autoplay', true); 
        video.setAttribute("id",getClientID.get() + " video");
        video.srcObject = getLocalStream(); 

        let local_video_preview = document.getElementsByClassName("localstream")[0];
        local_video_preview.append(video);
        
    },

    /**
     * Adds a new text message to the chat elements in the html document. This message is sent by the local peer. 
     * @param {*} username the username of the user that sent the message 
     * @param {*} data the content of the text message
     */
    addNewTextMessage: function(username, data){
        let container = document.createElement("div");
        container.setAttribute('class', "message-container");

        let new_message = document.createElement("div");
        //specifies it's you who sent the message 
        new_message.setAttribute('class', "message_container_darker"); 
        new_message.setAttribute('id', getClientID.get() + " message_container_darker");
        new_message.innerHTML = `<h3>` + username + `</h3>`; 
        new_message.insertAdjacentHTML("beforeend",`<p>` + data + `</p>`);
        container.appendChild(new_message);

        let date = document.createElement("div");
        date.setAttribute('id', "date");
        date.innerHTML =  `<p>` + getCurrentDateTime() + `</p>`;
        container.appendChild(date);

        let chat = document.getElementsByClassName("chat")[0];
        

        let chat_input_box = document.getElementsByClassName("messages")[0];

        chat_input_box.appendChild(container);
        // Scroll to the bottom of the div
        chat.scrollTop = chat.scrollHeight;
    },

    /**
     * When users adds a new file to the chatroom locally the metadata are put into the chatroom 
     * using this function. 
     * IMPORTANT: the metadata put here username,room_code, clientID
     * @param {*} username 
     * @param {*} room_code 
     * @param {*} clientID 
     * @param {*} file 
     */
    addNewFileMetadata: function(username, room_code, clientID, file){
        let container = document.createElement("div");
        container.setAttribute('class', "message-container");

        let new_message = document.createElement("div");
        //specifies it's you who sent the message 
        new_message.setAttribute('class', "message_container_darker"); 
        new_message.setAttribute('id', getClientID.get() + " message_container_darker");
        new_message.innerHTML = `<div class="class_metadata_link"
        data-clientID="${clientID}"
        data-roomcode="${room_code}"
        data-filename="${file.name}"
        data-username="${username}">` 
        + `<h3 id="header_metadatalink">` 
        + username + `</h3>` + `<a id="metadata_link" href="#">` + file.name 
        + file.type + `</a>` + `<br> File size: ` + file.size + ` bytes <br> Last modified: ` + new Date(file.lastModified) + 
        `</div>`;  
        container.appendChild(new_message);

        let date = document.createElement("div");
        date.setAttribute('id', "date");
        date.innerHTML =  `<p>` + getCurrentDateTime() + `</p>`;
        container.appendChild(date);
        

        let chat = document.getElementsByClassName("chat")[0];
        

        let chat_input_box = document.getElementsByClassName("messages")[0];

        chat_input_box.appendChild(container);
        
        chat.scrollTop = chat.scrollHeight;
    },

    /**
     * Closes the webrtc's stream's tracks and removes the video from the html file. 
     */
    terminateStreamTracks: function(){
        let local_video = document.getElementById(getClientID.get() + " video");    
        if(local_video && local_video.srcObject){
            local_video.srcObject.getTracks().forEach((track) => track.stop()); 
            local_video.remove(); 
        } 

        let chat_input_box = document.getElementsByClassName("messages")[0];

        chat_input_box.innerHTML = "";
        //terminate and remove remote videos
        let streams = document.getElementsByClassName("streams")[0]; 
        streams.innerHTML = ""; 
        let members = document.getElementsByClassName("active-members")[0];
        members.innerHTML = "";
        let local_stream = document.getElementsByClassName("localstream")[0]; 
        local_stream.innerHTML = ""; 
    }
}