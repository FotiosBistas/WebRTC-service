import { media_functions } from "./media-handler.js";
import {setLocalStream, getLocalStream, getLocalPeerConnection} from "./peer-connection-handler.js"; 
import { getClientID } from "./websocket-connection-handler.js";

function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
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
            }
        });
    },

    /**
     * Gets called when there's a new message-history type message received from the websocket connection. 
     * @param {*} message the message received from the websocket connection. It contains a list of messages. 
     */
    handleMessageHistory: function(message){
        message.messages.forEach((msg) => {
            let new_message = document.createElement("div");
            //specifies it's the peer who sent the message 
            new_message.setAttribute('class', "message_container"); 
            new_message.innerHTML = `<h3>` + msg.username + `</h3>`; 
            new_message.insertAdjacentHTML("beforeend",`<p>` + msg.message_data + `</p>`);


            let chat = document.getElementsByClassName("chat")[0];
            

            let chat_input_box = document.getElementsByClassName("chat-input-box")[0];

            chat.insertBefore(new_message, chat_input_box);
            // Scroll to the bottom of the div
            chat.scrollTop = chat.scrollHeight;
        });
    },

    /**
     * Gets called the the websocket connection receives a new text message from the server. It adds it into the chat elements. 
     * @param {*} message the text message received from the server
     */
    handleNewTextMessage: function(message){
        let new_message = document.createElement("div");
        //specifies it's the peer who sent the message 
        new_message.setAttribute('class', "message_container"); 
        new_message.innerHTML = `<h3>` + message.username + `</h3>`; 
        new_message.insertAdjacentHTML("beforeend",`<p>` + message.message_data + `</p>`);


        let chat = document.getElementsByClassName("chat")[0];
        

        let chat_input_box = document.getElementsByClassName("chat-input-box")[0];

        chat.insertBefore(new_message, chat_input_box);
        // Scroll to the bottom of the div
        chat.scrollTop = chat.scrollHeight;
    },

    /**
     * Receives an error message from the server and displays it to the user. 
     * @param {*} error message received by the websocket connection
     */
    handleErrorReceivedByServer: function(error){
        alert(error.error_data);
        
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
        member_left.remove(); 

        /* let remote_video = document.getElementById(message.id);
        //TODO remove stream from remote streams 
        remote_video.remove();  */
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
        media_functions.getMedia({
            audio: true, 
            video: true, 
        }).then((stream) => {
            setLocalStream(stream);

            getLocalStream().getTracks().forEach((track) => {
                getLocalPeerConnection().addTrack(track);
            });

            let video = document.createElement('video'); 
            video.setAttribute('autoplay', true); 
            video.setAttribute("id",getClientID.get() + " video");
            video.srcObject = getLocalStream(); 
    
            let video_grid = document.getElementsByClassName("streams")[0];
    
            video_grid.append(video); 
        }); 
    },

    /**
     * Adds a new text message to the chat elements in the html document. This message is sent by the local peer. 
     * @param {*} username the username of the user that sent the message 
     * @param {*} data the content of the text message
     */
    addNewTextMessage: function(username, data){
        let new_message = document.createElement("div");
        //specifies it's you who sent the message 
        new_message.setAttribute('class', "message_container_darker"); 
        new_message.innerHTML = `<h3>` + username + `</h3>`; 
        new_message.insertAdjacentHTML("beforeend",`<p>` + data + `</p>`);


        let chat = document.getElementsByClassName("chat")[0];
        

        let chat_input_box = document.getElementsByClassName("chat-input-box")[0];

        chat.insertBefore(new_message, chat_input_box);
        // Scroll to the bottom of the div
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
        
    }
}