import {Layer} from "./Layer";
import {Assets, Sprite} from "pixi.js";
import {Grid} from "../Grid/Grid";

export class GridLayer extends Layer{
    layerName = "grid"

    //private grid: Grid;
    private readonly gridSize: number = 161.4;
    //gridOffset: Coordinate = new Coordinate("cartesian", 48.5, 176);
    //mapZones: Map<string, DisplayObject> = new Map<string, DisplayObject>();

    private constructor() {
        super();
    }

    public static async GridLayer(): Promise<GridLayer>{
        let b = new GridLayer();

        await b.LoadAssets()
        b.BuildView()

        return b;
    }

    private async LoadAssets(){
    }

    private BuildView(){

        //console.log(this.layerChildren['background-image'])
    }
}