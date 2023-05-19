import {FederatedPointerEvent, Graphics} from "pixi.js";
import {getCurrentViewMode} from "./Scene";
import {sendMapUpdate} from "./network";

export class Hex extends Graphics{
    hexName: String = "Name"
    claimed: boolean = false;
    explored: boolean = false;
    rx: number = 0;
    ry: number = 0;
    index: number = 0;

    onClick(e: FederatedPointerEvent): void{
        let property : string = "";
        let state : string = "";
        
        if(getCurrentViewMode() == "claim"){
            if(this.claimed == !e.ctrlKey) return;
            
            property = "claimed"
            this.claimed = !e.ctrlKey;
            state = this.claimed? "true":"false";
        }else if(getCurrentViewMode() == "explore"){
            if(this.explored == !e.ctrlKey) return;
            
            property = "explored"
            this.explored = !e.ctrlKey;
            state = this.explored? "true":"false";
        }
        
        console.log("hexUpdate")
        sendMapUpdate(this.index, property, state);

        this.updateDisplay();
    }

    updateDisplay(){
        let color: number = 0x000000;
        let show: boolean = false;

        if(getCurrentViewMode() == "claim"){
            color = 0x00ff00;
            show = this.claimed;
        }else if(getCurrentViewMode() == "explore"){
            color = 0xff0000;
            show = this.explored;
        }

        if(!show){
            this.tint = 0xffffff;
            this.alpha = 0.0001;
            return;
        }

        this.tint = color;
        this.alpha = 0.2;


    }
}