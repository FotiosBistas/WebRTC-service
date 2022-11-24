
function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

export let media_functions = {
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
            return Promise.resolve(stream); 
        }catch(err){
            console.log("Error in get media", err.name);     
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
            console.log("Error in get Devices",err.name); 
        }
    },

    /**
     * 
     * 
     * @param {*} connection the connection we'll add the track on the connection
     * @param {*} stream the streams that contains the tracks we'll add to the connection 
     */
    addTrackToConnection: async function func(connection, ...streams){
        log(streams + "received as parameters")
        for(const stream of streams) {
           log("adding stream to connection: " + stream);
            stream.getTracks().forEach(track => {
                log("adding track to connection: " + track); 
                connection.addTrack(track,stream); 
            });
        }
    }
}

