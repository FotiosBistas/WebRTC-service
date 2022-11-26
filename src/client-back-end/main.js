import {createPeerConnection} from "./peer-connection-handler.js"; 
import {connect} from "./websocket-connection-handler.js"





let remoteStream = new MediaStream(); 

let clientID = 0; 
let myUsername = null; 


let offer = await createPeerConnection(); 

web_socket_connection = connect(); 