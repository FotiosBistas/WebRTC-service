
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

export let media_functions = {

    local_stream: null, 
    /**
     * Returns the media stream that the user authorized. 
     * @param {*} constraints the type of media that we are going to request.
     * E.g constraints {video: true, audio: true}
     */
    getMedia: async function func(constraints) {
        let stream = null; 
        console.log(navigator.mediaDevices)
        try{
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.local_stream = stream; 
            return Promise.resolve(stream); 
        }catch(err){
            return Promise.reject(err);    
        }
        
    },

    /**
     * Returns the devices available for the data stream. 
     */
    getDevices: async function func(){
        try{
            let devices = await navigator.mediaDevices.enumerateDevices(); 
            return Promise.resolve(devices); 
        }catch(err){
            return Promise.reject(err);
        }
    },

    handleGetUserMediaError: function(error){
        log("Error:(" + error + ") while getting media stream");
        switch(error.name) {
            case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                    "were found.");
            break;
            case "SecurityError":
            case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            break;
            default:
            alert("Error opening your camera and/or microphone: " + error.message);
            break;
        }
    }
}

