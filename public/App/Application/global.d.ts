import { Log} from "./Log";
import {NetworkManager} from "./Network";
import {Settings} from "./Settings";
import {Game} from "./Game";

declare global {
    interface Window  {
        Print: Log;
        Net: NetworkManager;
        Settings: Settings;
        GameData: string;
        Game: Game;
    }
}

export {};