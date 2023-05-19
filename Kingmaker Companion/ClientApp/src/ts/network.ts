import {hubConnection} from "./index";

export async function sendMapUpdate(index: number, property: string, state: string){
    let message = {
        "index": index,
        "property": property,
        "newState": state
    }
    
    await hubConnection.invoke("mapUpdate", JSON.stringify(message))
}
export async function sendAPIRequest(controller: string, id: string = "none"){
    let uri = window.location.origin + "/api/" + controller
    if(id !== "none"){
        uri = uri + "/" + id;
    }
    
    return new Promise((resolve) => {
        resolve(fetch(uri)
            .then(response => response.json()))
    })
}