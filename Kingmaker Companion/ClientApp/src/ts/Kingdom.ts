import { Hex } from "./Hex";
import {addHex, getBackgroundHeight, getBackgroundWidth} from "./Scene";
const tools = require("./tools")

export class Kingdom{
    hexes: Array<Hex>;
    saveHexes: Array<SavableHex>;
    kingdomName: string = "Kingdom of Fair Weather"
    kingdomId: string;
    
    abilityScores: AbilityScores;
    
    charter: string = "Grant";
    heartland: string = "ForestSwamp";

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
        
        this.abilityScores = new AbilityScores();
        
        this.calculateAbilities()
    }
    
    calculateAbilities(){
        let boosts = this.abilityScores.abilityBoosts;
        
        //Charter stage
        let c = this.getCharter(this.charter)
        boosts.stages[0].frees = c.abilityBoosts.filter((item: string) => item === 'free').length;
        c.abilityBoosts.filter((item: string) => item != "free").forEach((item: string) => {
            boosts.stages[0].boost.push(item);
        });
        boosts.stages[0].boost.push("-" + c.abilityFlaw);

        //Heartland stage
        let h = this.getHeartland(this.heartland)
        boosts.stages[1].frees = h.abilityBoosts.filter((item: string) => item === 'free').length;
        h.abilityBoosts.filter((item: string) => item != "free").forEach((item: string) => {
            boosts.stages[1].boost.push(item);
        })
        
        this.abilityScores.calculateScores();
        
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
        switch (property){
            case "claimed": hex.claimed = tools.stringToBool(state); break;
            case "explored": hex.explored = tools.stringToBool(state); break;
            default: break;
        }
        
        hex.updateDisplay();
    }
    
    private getCharter(charter: string){
        switch (charter){
            case "Conquest" : return JSON.parse(Charter.Conquest);
            case "Expansion" : return JSON.parse(Charter.Expansion);
            case "Exploration" : return JSON.parse(Charter.Exploration);
            case "Grant" : return JSON.parse(Charter.Grant);
            case "Open" : return JSON.parse(Charter.Open);
        }
    }

    private getHeartland(heartland: string){
        switch (heartland){
            case "ForestSwamp" : return JSON.parse(Heartland.ForestSwamp);
            case "HillPlain" : return JSON.parse(Heartland.HillPlain);
            case "LakeRiver" : return JSON.parse(Heartland.LakeRiver);
            case "MountainRuin" : return JSON.parse(Heartland.MountainRuin);
        }
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

class AbilityScores{
    culture: number = 10;
    economy: number = 10;
    loyalty: number = 10;
    stability: number = 10;

    abilityBoosts = {
        "stages" : [
            {"stage" : "Charter" ,"frees" : 0, "boost" : []},
            {"stage" : "Heartland" ,"frees" : 0, "boost" : []},
            {"stage" : "Level 1" ,"frees" : 2, "boost" : []},
            {"stage" : "Level 5" ,"frees" : 2, "boost" : []},
            {"stage" : "Level 10" ,"frees" : 2, "boost" : []},
            {"stage" : "Level 15" ,"frees" : 2, "boost" : []},
            {"stage" : "Level 20" ,"frees" : 2, "boost" : []},
        ]};
    
    calculateScores(){
        for(let i of this.abilityBoosts.stages){
            console.log(i)
            for(let j of i.boost){
                console.log(j)
                if(j.charAt(0) === "-") {
                    this.modify(j.substring(1), false);
                    continue;
                }
                
                this.modify(j)
                
            }
        }
    }
    
    modify(score: string, boost: boolean = true){
        switch (score){
            case "culture" : this.culture = this.boost(this.culture, boost); break;
            case "economy" : this.economy = this.boost(this.economy, boost); break;
            case "loyalty" : this.loyalty = this.boost(this.loyalty, boost); break;
            case "stability" : this.stability = this.boost(this.stability, boost); break;
        }
    }
    
    boost(score: number, boost: boolean): number{
        if(score > 18){
            return score + (1 * (boost ? 1 : -1));
        }
        
        return score + (2 * (boost ? 1 : -1));
    }
}

enum Charter {
    Conquest= "{\"name\" : \"Conquest\" , \"abilityBoosts\" : [\"loyalty\" , \"free\"],  \"abilityFlaw\" : \"culture\"}",
    Expansion = "{\"name\" : \"Expansion\" , \"abilityBoosts\" : [\"culture\" , \"free\"], \"abilityFlaw\" : \"stability\"}",
    Exploration = "{\"name\" : \"Exploration\" , \"abilityBoosts\" : [\"stability\" , \"free\"], \"abilityFlaw\" : \"economy\"}",
    Grant = "{\"name\" : \"Grant\" , \"abilityBoosts\" : [\"economy\" , \"free\"], \"abilityFlaw\" : \"loyalty\"}",
    Open = "{\"name\" : \"Open\" , \"abilityBoosts\" : [\"free\"], \"abilityFlaw\" : \"none\"}"
    
}

enum Heartland {
    ForestSwamp = "{\"name\" : \"Forest or Swamp\" , \"abilityBoosts\" : [\"culture\"]}",
    HillPlain = "{\"name\" : \"Hill or Plain\" , \"abilityBoosts\" : [\"loyalty\"]}",
    LakeRiver = "{\"name\" : \"Lake or River\" , \"abilityBoosts\" : [\"economy\"]}",
    MountainRuin = "{\"name\" : \"Mountain or Ruin\" , \"abilityBoosts\" : [\"stability\"]}"

}


