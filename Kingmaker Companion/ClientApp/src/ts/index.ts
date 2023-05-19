import {HubConnectionBuilder, LogLevel} from "@aspnet/signalr";

let scene = require("./Scene")

export const hubConnection = new HubConnectionBuilder().withUrl(window.location.origin + "/gameConnection").configureLogging(LogLevel.Information).build();

hubConnection.on("SendMessage", message => {
    console.log(message)
})

hubConnection.on("MapUpdate", updateMessage => {
    scene.recieveMapUpdate(updateMessage)
})
hubConnection.start()
    .then(() => {
        console.log("Connection with game server established");
        scene.CreateView();
    });
