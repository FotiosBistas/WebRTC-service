# WebRTC-service
A WebRTC based service that will support teleconferencing 

## Easy HTTPS web server setup
A very easy way to fire up the web app is by using the *Live Server* plugin for *Visual Studio Code*.

Steps;
1. Install the plugin via *Extensions* tab.
2. From the *Extensions* tab, click on the gear icon and select *Extension Settings*.
3. Scroll down and enable the Host IP when starting the server.
4. Navigate to the project's root directory and create a `.vscode` directory.
5. Inside the `.vscode` directory, create a `settings.json` file.
6. Make sure `settings.json` contains the following:

```
{
    "liveServer.settings.https": {
        "enable": true, //set it true to enable the HTTPS
        "cert": "/FULL/PATH/TO/CERTIFICATE/cert.pem", // FULL PATH ONLY. RELATIVE PATH DOES NOT WORK 
        "key": "/FULL/PATH/TO/KEY/key.pem", // AGAIN
        "passphrase": "open-sesame" // enter the passphrase
    }
}
```

7. Click the *Go Live* button.
8. [**OPTIONAL**] The provided certificates are self-signed for development purposes *ONLY*. Some browsers block access to websites to with such certificates for security reasons. In order to bypass the block, type `thisisunsafe` (for Chrome-based browsers) when greeted with the warning page. (No text-input box required, just press the keyboard keys to type `thisisunsafe`. Sounds magical? We know.) 

The certificate and key are located inside the `server`'s `tls` directory.