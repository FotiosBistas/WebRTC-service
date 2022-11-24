


function log(text){
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}



export async function initiateConnection(connection){
    try{
        let offer = await connection.createOffer(); 
        await connection.setLocalDescription(offer);
        //TODO send the offer to the signalling server 
        return offer; 
    }catch(error){
        console.log("error in iniatiate connection", error);
    }
}



