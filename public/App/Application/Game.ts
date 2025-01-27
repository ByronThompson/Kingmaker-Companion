import {Canvas} from "../Canvas/Canvas";

export class Game{
    private readonly messageName: string = "KC - Game"
    private static instance: Game;
    private static loadAttempts: number = 1;

    canvas!: Canvas;
    //kingdom: Kingdom;

    private constructor() {
    }

    public static async Game(): Promise<Game>{
        if(this.instance){
            return this.instance;
        }else{
            let game = new Game();

            if(await game.initialize()){
                window.Print.log("KC - Game", "Game Ready")
                this.instance = game;
                return this.instance;
            }else if(this.loadAttempts <= 5) {
                window.Print.error("KC - Game", `Error experienced while attempting to start game, trying again. Attempt: ${this.loadAttempts}`)
                this.loadAttempts++;
                return await this.Game();
            }else{
                window.Print.error("KC - Game", "Failed to start game. \nMaximum number of attempts exceeded. \nEnable debug mode and reload for more detailed information")
                throw new Error();
            }
        }
    }

    private async initialize(): Promise<boolean>{
        window.Print.debug(this.messageName, "Initializing Game...")
        if(!window.GameData){this.#abort("Game data null"); return false;}
        if(window.GameData === 'err'){this.#abort("Error encountered joining game"); return false;}
        try{
            let go = true;

            let canvas = await Canvas.buildCanvas();
            if(canvas){
                this.canvas = canvas;
            }else{ go = false; }


            return go;
        }catch(err){
            return false;
        }
    }

    startGame(){
        this.canvas.startPixiApp()
    }

    #abort(reason: string = ""){
        window.Print.error(this.messageName, "Game Creation Aborted. " + reason ? "\nReason: " + reason : "")
    }
}
