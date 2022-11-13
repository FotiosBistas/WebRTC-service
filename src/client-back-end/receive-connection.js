
remoteStream = new MediaStream(); 

export async function receiveInitialConnection(connection, offer){
/*     connection.setRemoteDescription(offer); */    
    connection.ontrack = (stream) => {
        console.log("Stream[0]", stream[0]); 
        stream.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track); 
        });
    };
}