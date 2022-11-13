

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

    try{
        let offer = await connection.createOffer(); 
    }catch(error){
        console.log("error in iniatiate connection", error);
    }
}



