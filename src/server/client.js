var WebSocket = require('ws'); 

let hostname = "127.0.0.1"; 
let server_port = 60503; 
let scheme = "wss"; 

serverURL = scheme + "://" + hostname + ":" + server_port; 

var ws = new WebSocket(serverURL, { rejectUnauthorized: false });

ws.onopen = function(event){
    ws.send("HI"); 
}