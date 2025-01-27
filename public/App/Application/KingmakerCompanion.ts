import {Log} from "./Log";
import {NetworkManager} from "./Network";
import {Settings} from "./Settings";
import {Game} from "./Game";

//Print greeting logo
console.log(`
_______________________________________________________________
  _  ___                             _                 
 | |/ (_)_ __   __ _ _ __ ___   __ _| | _____ _ __     
 | ' /| | '_ \\ / _\` | '_ \` _ \\ / _\` | |/ / _ \\ '__|    
 | . \\| | | | | (_| | | | | | | (_| |   <  __/ |       
 |_|\\_\\_|_| |_|\\__, |_| |_| |_|\\__,_|_|\\_\\___|_|       
   ____        |___/                     _             
  / ___|___  _ __ ___  _ __   __ _ _ __ (_) ___  _ __  
 | |   / _ \\| '_ \` _ \\| '_ \\ / _\` | '_ \\| |/ _ \\| '_ \\ 
 | |__| (_) | | | | | | |_) | (_| | | | | | (_) | | | |
  \\____\\___/|_| |_| |_| .__/ \\__,_|_| |_|_|\\___/|_| |_|
                      |_|                              
===============================================================
`)

Initialize().then(() => {
        window.Game.startGame()
});

async function Initialize(){
        //Initialize Log Manager
        window.Print = Log.Log();

        //Send Initialization Print
        window.Print.log("Kingmaker Companion", "Initializing...");

        //Initialize User Settings
        window.Settings = Settings.Settings();

        //Initialize Network Manager
        window.Net = await NetworkManager.NetworkManager();

        //Initialize Game
        window.Game = await Game.Game();

        console.log(window.GameData)
}
