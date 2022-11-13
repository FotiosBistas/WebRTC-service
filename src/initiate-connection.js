

async function initiateConnection(configuration){

    let connection = new RTCPeerConnection(configuration); 
    // connection.addTrack(getMedia()); 
    let offer = await connection.createOffer(); 
}