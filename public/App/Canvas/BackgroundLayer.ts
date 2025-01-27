import {Layer} from "./Layer";
import {Assets, AssetsBundle, Sprite} from "pixi.js";

export class BackgroundLayer extends Layer{
    layerName = "background"

    private constructor() {
        super();
    }

    public static async BackgroundLayer(): Promise<BackgroundLayer>{
        let b = new BackgroundLayer();

        await b.LoadAssets()
        b.BuildView()

        return b;
    }

    private async LoadAssets(){
        this.layerAssets = await Assets.loadBundle("background");
    }

    private BuildView(){
        this.layerChildren['background-image'] = Sprite.from(this.layerAssets['background-image'])
        this.layerChildren['background-image'].anchor.set(0)
        this.layerChildren['background-image'].x = 0
        this.layerChildren['background-image'].y = 0
        this.addChild(this.layerChildren['background-image'])

        //console.log(this.layerChildren['background-image'])
    }
}

export const backgroundBundle = {
    assets: [
        {
            alias: "foreground-image",
            src: `./images/Stolen-Lands-Paper.jpg`
        },
        {
            alias: "background-image",
            src: `./images/Kingmaker-Stolen-Lands-Accurate-grid-no-labels.webp`
        }
    ],
    name: "background"
} as AssetsBundle