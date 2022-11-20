 //TODO listen to requests 

// this will run on node js 

var WebSocketServer = require('ws').Server;




function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

let httpserver = null; 

try{

}catch(err){
    log(err); 
}

function handleHTTPRequest(request, response){
    log("Received requests for: " + request.url); 
    //TODO handle http requests 
    response.writeHead(); 
    response.end(); 
}

httpserver.listen(6503, function(){
    log("Server is listening on port 6503"); 
}); 

let webserver = new WebSocketServer({
    
});