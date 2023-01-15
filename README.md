# WebRTC-service
 Web-conferencing using WebRTC.

Authors; [Fotios Bistas](https://github.com/FotiosBistas "Fotios Bistas"), [Georgios E. Syros](https://github.com/gsiros "Georgios E. Syros"), [Anastasios Toumazatos](https://github.com/toumazatos "Anastasios Toumazatos")

## Introduction;

*Vzoom* is a fast, lightweight video calling web app developed for AUEB’s undergraduate course Multimedia Technology leveraging the WebRTC framework. The goal was to implement an application which enables the exchange of sound, video, text and other multimedia using peer-to-peer and client-server architectures for direct and indirect communication. The application supports one-to-one communication using the peer- to-peer approach for exchanging audio and video and the client-server approach for text and multimedia.

This README includes set-up instructions, the application user’s guide, high-level software documentation, the used software, sources and difficulties faced during development.

<p align="center">
  <img src="https://user-images.githubusercontent.com/47118034/212555958-a049125a-6381-4ecc-93c5-3ea3c2427f9f.jpeg" />
</p>

<p align="center">
  <i>Figure 1. One to one video call using Vzoom.</i> 
</p>

## Architecture

The app supports peer-to-peer video and audio communication via the WebRTC protocol. Firstly, an exchange of important messages is required, before the participating peers can successfully establish a connection. Because there isn’t any type of connection underway, these messages must be exchanged by a middle-man; the signalling server. To begin the process, the peers must give permission to the browser to access their media devices, such as a camera or a microphone, in order for some important event handlers of the protocol to fire up. A high level description of the process is given by the following steps:

1. Access the media devices of the users.
2. Send the messages to the signalling server.
3. Establish the connection.


### Peer-to-peer audio and video exchange

For a user to chat with another one, they must first join a room. When a peer connects to a room, the important signalling messages are sent to the server using Websocket secured (WSS). This connection, as described in section 2.2, is upgraded over HTTPS using the http upgrade method. Leveraging this connection the signalling messages sent by one peer are broadcasted to all other room participants[^1]. After receiving these messages the other peer(s) connect in a siminal manner.

Along with the exchange of audio-video, the room’s chat supports the exchange of simple text messages and files. The text messages are sent over the websocket connection and are broadcasted to all the peers connected to the room. The files are uploaded using https POST requests and can be downloaded by other peers by https GET requests.

Theoretically, the connection could be run over pure http but the exchange of video and audio would be very problematic due to security concerns and policies implemented by most browsers.

[^1]: In our one-to-one implementation, there is only one participant.

### The signalling server

The signalling server is a custom NodeJS server. It is capable of concurrent support of http(s) messages along with websocket requests. In phase one the server starts of as a https server and in phase two is configured to also listen to websocket requests at port 62000.

<p align="center">
  <img src="https://user-images.githubusercontent.com/47118034/212556649-3c23ccd2-c192-4bfa-b8df-0d4f638bf647.jpg" width=650/>
</p>

<p align="center">
  <i>System Architecture.</i> 
</p>

The user connects to the server using a WSS connection. This connection is persistent and ends whenever the room ceases to exist. The user sends signalling messages, simple text messages and other important data through the connection.

The server also accepts http(s) GET and POST requests to send the HTML, CSS and JS files from the browsers and for the users to be able to share files over the chat. In the event of a file exchange via the chat, the server receives a POST request. Firstly, mime type is extracted to check if it is supported. Secondly, the file is stored locally to the server. Finally, if one of the participating peers wants to download the file, a GET request is sent. Then, the essential metadata of the file are sent over to the server and the user will receive the file if it exists.

Additionally the server manages the active WSS connections, rooms and the causal ordering when sending the data to the peers. For example, when the all the room’s users leave the room:

- the room is deleted from the active rooms array.
- the connections of the peers are removed from the active connections array.
- the server cleans up any files send and stored over the chat using post requests.

### Compatibility

To check the compatibility of the app, we conducted various tests on multiple web browsers and devices We concluded that the main issues are the following:

1. The app doesn’t work on the Safari browser on iPhones.
2. The app won’t work on mobile data.

To be fully functional, the safest combination of software and hardware is Chromium based browsers (Chrome, Brave, etc.) or browsers that run on the Quantum browser engine (Firefox, Tor, etc.) using a PC.

## User's Guide

Concluding from the [Architecture](#architecture), the server could be deployed on a remote machine that could be accessed over the Internet. Assuming that the application is already deployed and the user has access to the Internet, the user puts the address of the web app to the address bar of their preferred browser. Once the application’s website loads, the user could perform the following actions.

### Creating a room

In order for the meeting to take place, one party has to create a meeting room. The user chooses a numerical code in order to uniquely identify the room. Then, they proceed to choose a username, with which they will appear to the other party during the meeting. Whenever the user is ready, the room can be created by clicking the ”Create Room” button as shown in figure 3.

Once the room is created, the user is automatically added to the meeting and will await for the other party to join. At this point, the room code can be exchanged with the other party for them to be able to join the room.

<div align="center" style="display: flex; flex-orientation: row; align-tems: center; justify-items: center;">
  <img src="https://user-images.githubusercontent.com/47118034/212556139-494b2272-f3d4-47c6-8d39-1b0e55473aa4.png" width=500/>
  <img src="https://user-images.githubusercontent.com/47118034/212556149-2abf691b-aad9-48c6-a53a-b524a7ab8555.png" width=500/>
</div>

<p align="center">
  <i>Figure 2 & 3. Index Splash Screen and creating a room.</i> 
</p>

### Joining a room

For the user to join an already existing room as per subsection 3.1, the unique room code is needed. The user must first fill the individual fields in the ”Join Room” section, providing the designated room code, along with a username, by which the user will appear to the other party during the meeting. Upon completing the detail registration, the user can finally join the meeting by clicking the ”Join Room” button as shown in figure 2. At that point, they will be directed to the meeting room, and the session can start.


### The call

Upon joining a room, the user is able to see his own stream, located at the bottom left of the stream container section. When another party connects to the call, their own stream will also be displayed in the stream container, at the center of the user’s view.

The chat container is situated to the right of the stream container, when the app is accessed through a computer screen, and below the stream container when accessed by smaller screens (e.g. mobile devices). It enables communication between the two parties via messages. Once a message is typed in the chat box, it can be posted by either hitting Enter, or by using the send icon on the right. Each message posted includes a timestamp, with messages sent by the user by the user being aligned to the right, and messages by the other party aligned to the left. Along with messages, the user can also share files the other party, with support currently extending to the following formats: `JPEG`, `PNG`, `ICO`, `MP4`, `PDF`, `MKV`, `CSV`, `DOC`, `DOCX`, `GIF`, and `ZIP`. Uploading a file message can be done by pressing the paperclip icon next to the chat box, and selecting a file through the file explorer.

<p align="center">
  <img src="https://user-images.githubusercontent.com/47118034/212556067-bd90177b-3442-4bf4-ae99-00c900bb95d5.jpeg" />
</p>

<p align="center">
  <i>Figure 4. The room UI interface.</i> 
</p>

During an active call, there are a few ways the user can interact with the application and alter his call experience. This is mostly accomplished through the session control bar, located at the bottom right of the stream container, if app is accessed from a large screen, or below the stream container, if it is accessed by a smaller screen. There are four options that can be accessed from the control bar. The first one is exiting the call, which is done by pressing the button with the red phone icon. The second option is disabling the usersvideostream,accomplishedbypressingbuttonwiththevideoicon.2 Furthermore,theuserisableto mute outgoing voice stream. This can be done by pressing the button with the microphone icon2. Finally, the user can toggle the chat section on and off, in order to give more room to the video streams. This is done by pressing the button with the chat icon[^2].

[^2]: When the video is disabled, the icon is displayed with a diagonal line over it. This also applies for the microphone and chat toggle buttons.

### Exiting a Call

Upon exiting a call, the user will be returned to the home screen, from which they can create or join a new call as they please. Note that upon disconnecting from a call, the call will be stopped after a few moments of inactivity, and the room code will become unreserved, and available for a new room to be created.

## Documentation

This section covers the three main directories of the project: `client-back-end/`, `front-end/`, and `server/` and will provide an overview of the code and design of each of these directories as well as instructions for setting up and running the web-conferencing app. For a more intuitive explanation, the project’s directory tree can be observed in figure 5.

### Client Back-end

The client-back-end directory contains the code for the client-side of the web application, which manages the required peer-to-peer WebRTC communication and the message exchange with the signaling server. `front-end-handlers.js` contains code that handles actions in the front-end of the app, such as user input and UI updates. `index.js` is the entry point for the client-side of the app and sets up the necessary connections and event handlers. `media-handler.js` accommodates handlers for media streams, responsible for setting up the local stream and displaying the remote stream. `peer-connection-handler.js` contains code for establishing and managing peer connections using WebRTC. `websocket-connection-handler.js` contains code for establishing and maintaining a WebSocket connection with the signaling server.

### Client Front-end

The front-end directory contains the code for the user interface of the web application, which is built using HTML, CSS, and JavaScript. `index.html` contains the HTML structure and layout for the user interface of the app. `index.css` accommodates the styles for the user interface of the app.

### Signaling & Web Server

The server directory contains the code for the server-side of the web application, which is responsible for handling signaling and other backend tasks.

The `files/` subdirectory is used to temporary store the multimedia files when received by one peer. `protect-the-dir.txt` is a placeholder file used to ensure the files subdirectory is never empty. The `tls/` subdirectory keeps the required SSL/TLS files in order for the HTTPS webserver to function. `cert.pem` contains the SSL/TLS certificate for the webserver. `key.pem` contains the private key for the SSL/TLS certificate. Moving on, the `connection-array-handler.js` file holds code for managing connections to the signaling server, including adding and removing connections from an array. `index.js` is the core of the server where the rest of the server modules are used. `room-handler.js` contains code for managing rooms and connections within rooms on the signaling server. Finally, `send-data.js` contains code for sending data between clients through the signaling server.

### Setup

The source code for both the client and the server of the app can be found online[^3]. Before deployment, make sure that NodeJS[^4] and npm are both installed on the device that will be used to host the app.

To deploy the app locally:
1. Starting from the root directory of the project, navigate to `src/server` with your terminal. 
2. Run the command `npm install` to install all of the dependencies for the project.
3. Finally, run the command `node .` to start the server.

To access a client instance, simply enter the localhost address to your browser’s address bar including port 62000: https://127.0.0.1:62000

For the app to be accessible over the Internet, ensure that the device that is hosted on has a static IP address and port 62000 is open and accessible through any potential firewalls. In our case, the app can be found for a limited period of time[^5] here. The server is hosted on a remote machine and can be controlled by the team.

[^3]: https://github.com/FotiosBistas/WebRTC-service
[^4]: https://nodejs.org/en/download/, preferably v19.0.0+
[^5]: until mid February 2023

## Difficulties

One of the most difficult problems we had to overcome is the lack of example projects that use purely NodeJS, WebRTC and WSS. Usually, the aforementioned are handled by third party frameworks/libraries e.g. ExpressJS. Extensive research on open-source code exchange websites like GitHub, StackOverflow questions, documentation, debugging and testing was conducted to find insight and help us move forward. Secondly, the lack of experience from the team members in the technologies used lead to a wrong initial structure of the project, which consequently complicated things. Finally, deploying a web server to check whether the app worked over the internet and not just locally was a challenging task. Numerous services were tried such as Amazon Web Services, Microsoft’s Azure and Google Cloud Services. Out of all Mi- crosoft’s Azure platform was deemed more appropriate for the nature of the project. Additionally, a decent number of alpha-testers was recruited for validation of the app’s offered services.


