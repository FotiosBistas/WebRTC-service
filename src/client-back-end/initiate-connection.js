

const default_configuration = {
    iceServers: [
        {
            urls:[
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        }
    ]
};


export async function initiateConnection(...streams){
    console.log("Streams received as parameters: ", streams);
    let connection = new RTCPeerConnection(default_configuration); 

    for(const stream of streams) {
        console.log("Adding stream: ",stream, " to connection"); 
        stream.getTracks().forEach(track => {
            console.log("Adding track: ",track, " to connection"); 
            connection.addTrack(track,stream); 
        });
    }

    try{
        let offer = await connection.createOffer(); 
        let description = await connection.setLocalDescription(offer);
    }catch(error){
        console.log("error in iniatiate connection", error);
    }
}



