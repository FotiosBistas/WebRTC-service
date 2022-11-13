/* import adapter from "webrtc-adapter";
 */

const mhandler = require('./src/front-end/media-handler'); 


mhandler.getMedia({
    video: true, 
    audio: true, 
}) 