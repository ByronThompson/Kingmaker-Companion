import { Hex } from "./Hex";
import {addHex, getBackgroundHeight, getBackgroundWidth} from "./Scene";
const tools = require("./tools")

export class Kingdom{
    hexes: Array<Hex>;
    saveHexes: Array<SavableHex>;
    kingdomName: string = "Kingdom of Fair Weather"
    kingdomId: string;

    constructor() {
        this.kingdomId = tools.guid();

        const offsetXs: number = 0.04001;
        const offsetXl: number = 0.023;

        const offsetYi: number = 0.0605;
        const offsetY: number = 0.08371;

        let count: number = 0;
        let row: number = 0;
        let longRow: boolean = false;

        let hexagonRadius = 161.5;
        let hexagonHeight = hexagonRadius * Math.sqrt(3);

        this.hexes = new Array<Hex>(342);
        this.saveHexes = new Array<SavableHex>(this.hexes.length);
        for (let i = 0; i < this.hexes.length; i++) {
            let hexagon = addHex(new Hex()
                .beginFill(0xFFFFFF)
                .drawPolygon([
                    -hexagonRadius, 0,
                    -hexagonRadius/2, hexagonHeight/2,
                    hexagonRadius/2, hexagonHeight/2,
                    hexagonRadius, 0,
                    hexagonRadius/2, -hexagonHeight/2,
                    -hexagonRadius/2, -hexagonHeight/2
                ])
                .endFill());

            let x: number = 0;
            let y: number = 0;

            if(count == 0){
                x = (longRow ? offsetXl : offsetXs);
                y = offsetYi + (offsetY * row);
            }else{
                x = this.hexes[i-1].rx + 0.03413;
                y = this.hexes[i-1].ry;
            }

            hexagon.rx = x;
            hexagon.ry = y;

            hexagon.rotation = 1.571;
            hexagon.position.set(x * (getBackgroundWidth()), y * (getBackgroundHeight()));
            hexagon.alpha = 0.0001;
            hexagon.on('mouseup', hexagon.onClick, hexagon)
            hexagon.interactive = true;
            
            hexagon.index = i;

            hexagon.updateDisplay();

            this.hexes[i] = hexagon;
            count++;

            if(count == 28 + (longRow ? 1 : 0)){
                count = 0;
                row++;
                longRow = !longRow;
            }
        }
    }

    updateHexDisplay(){
        this.hexes.forEach(hex => {
            hex.updateDisplay()
        })
        console.log(this.hexes)
    }

    json(): string{
        for (let i = 0; i < this.hexes.length; i++) {
            this.saveHexes[i] = new SavableHex(this.hexes[i]);
        }

        return JSON.stringify(this, (key, value) => {
            if(key === "hexes"){
                return undefined;
            }

            return value;
        })

    }

    loadSave(save: string){
        let k: Kingdom = JSON.parse(save);
        
        for (let i = 0; i < this.hexes.length; i++) {
            console.log(typeof k.saveHexes[i].claimed)
            this.hexes[i].explored = tools.stringToBool(k.saveHexes[i].explored);
            this.hexes[i].claimed = tools.stringToBool(k.saveHexes[i].claimed);
            this.hexes[i].index = i;
            this.hexes[i].updateDisplay();
        }

        this.kingdomName = k.kingdomName;
        this.kingdomId = k.kingdomId;
    }
    
    updateHex(index: number, property: string, state: string){
        let hex = this.hexes[index];
        console.log(index, property, state)
        switch (property){
            case "claimed": hex.claimed = tools.stringToBool(state); break;
            case "explored": hex.explored = tools.stringToBool(state); break;
            default: break;
        }
        
        hex.updateDisplay();
    }
}

class SavableHex{
    claimed: string = "false";
    explored: string = "false";

    constructor(hex: Hex) {
        this.claimed = hex.claimed ? "true" : "false";
        this.explored = hex.explored ? "true" : "false";
    }
}


