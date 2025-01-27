import {
    Application,
    Assets,
    AssetsManifest,
    Container,
    FederatedPointerEvent,
    FederatedWheelEvent,
    Graphics,
    Point, Rectangle
} from "pixi.js";
import {Layer} from "./Layer";
import {backgroundBundle, BackgroundLayer} from "./BackgroundLayer";

export class Canvas{
    private readonly messageName: string = "KC - Canvas"

    private htmlCanvas!: HTMLCanvasElement;
    private PixiApp!: Application;
    private Camera!: Container<any>
    private Layers: {[layerName: string]: Layer} = {};

    private constructor() {
    }

    public static async buildCanvas(): Promise<Canvas | null>{
        window.Print.debug("KC - Canvas", "Initializing Game Canvas...")
        let canvas = new Canvas();

        //Loads a particular asset into memory to prepare the browser to load other assets
        //I do not know what this is doing behind the scenes, but removing it causes the program to fail
        //await window.Net.primeAssets()

        //Load Assets
        let assetsGO = await canvas.loadAssets();

        //Create HTML Canvas element
        let canvasGO = canvas.createHTMLCanvas();

        //Create Pixi Application
        let pixiGO = await canvas.buildApp();

        //Create the canvas view and layers
        let viewGO = await canvas.buildView();

        //Debug circle
        const g = new Graphics({label: "debug"})
        canvas.Camera.addChild(g)

        canvas.addEventListeners()

        let go = canvas.DetermineCanvasLoadStatus(assetsGO, canvasGO, pixiGO, viewGO)
        if(go){
            window.Print.log(canvas.messageName, "Game Canvas Ready")

            return canvas;
        }

        return null;
    }

    private async loadAssets(): Promise<boolean>{
        window.Print.debug(this.messageName, "Loading Assets...")

        Assets.reset()
        await Assets.init({manifest: assetsManifest})

        try{

            let background = await Assets.loadBundle("background")

            if( ! (background)){new Error("One or more assets failed to load")}

            window.Print.debug(this.messageName, "Assets Loaded")
            return true;
        }catch(err){
            window.Print.error(this.messageName, "Error while loading assets");
            console.error(err);
            return false;
        }
    }

    private createHTMLCanvas(): boolean{
        let map: HTMLElement | null = document.getElementById("map")
        let canvas: HTMLCanvasElement = document.createElement("canvas")

        if(!map){
            window.Print.debug(this.messageName, "Error while creating HTML Canvas")
            return false;
        }

        canvas.id = "map";
        canvas.style.display = "none"
        this.htmlCanvas = canvas;
        map.replaceWith(canvas)
        window.Print.debug(this.messageName, "HTML Canvas created")
        return true;
    }

    private async buildApp(): Promise<boolean>{
        try{
            //Create and initialize the PIXI.js application
            this.PixiApp = new Application();
            await this.PixiApp.init({
                canvas: this.htmlCanvas,
                autoStart: false,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                backgroundColor: 0x000000,
                width: window.innerWidth,
                height: window.innerHeight
            })

            //Create the 'camera' object
            this.Camera = new Container({label: "Camera"});
            this.PixiApp.stage.addChild(this.Camera)



            window.Print.debug(this.messageName, "Pixi Application created");
            return true;
        }catch(err){
            console.error(err)
            return false;
        }
    }

    private async buildView(): Promise<boolean>{
        window.Print.debug(this.messageName, "Building Layers...")
        try{
            this.Layers['background'] = await BackgroundLayer.BackgroundLayer();

            let layers: Layer[] = Object.values(this.Layers);

            this.Camera.addChild(layers[0])

            window.Print.debug(this.messageName, "Layers Built")
            return true;
        }catch{
            return false;
        }

    }

    private addEventListeners() {
        this.Camera.hitArea = this.PixiApp.screen

        //Add listeners for moving the camera
        this.Camera.on("rightdown", this.#onDragStart, this);
        this.Camera.on("rightup", this.#onDragEnd, this);
        this.Camera.on("rightupoutside", this.#onDragEnd, this);
        this.Camera.on("wheel", this.#onZoom, this)

        this.Camera.eventMode = 'static';
        //Suppress Right-click menu
        document.addEventListener('contextmenu', e => {
            e.preventDefault();
        })
    }



    private DetermineCanvasLoadStatus(
        assets: boolean,
        canvas: boolean,
        app: boolean,
        view: boolean
    ): boolean{
        function goNoGo(g: boolean): string{return g ? "GO" : "NO GO"}
        window.Print.debug(this.messageName, `Game Load Status:
        Assets: ${goNoGo(assets)}
        HTML Canvas: ${goNoGo(canvas)}
        PIXI App: ${goNoGo(app)}
        Canvas View: ${goNoGo(view)}`);

        if(assets && canvas && app && view){
            window.Print.debug(this.messageName, "Go for Game Start");
            return true;
        }

        window.Print.debug(this.messageName, "No go for Game Start");
        return false;
    }

    startPixiApp(){
        this.PixiApp.start();
        this.htmlCanvas.style.display = 'block'
    }


    private previousMousePosition: Point | null = null;
    #onDragStart(e: FederatedPointerEvent){
        this.previousMousePosition = e.global.clone();
        this.Camera.on("pointermove", this.#onDragMove, this)
    }

    #onDragMove(event: FederatedPointerEvent){
        if(this.previousMousePosition) {
            let dX = event.global.x - this.previousMousePosition.x
            let dY = event.global.y - this.previousMousePosition.y

            this.Camera.position.x += dX;
            this.Camera.position.y += dY;
        }

        this.resetCameraHitArea()
        this.previousMousePosition = event.global.clone();
    }

    #onDragEnd(){
        this.resetCameraHitArea()

        this.previousMousePosition = null;
        this.Camera.off('pointermove')
    }

    #onZoom(e: FederatedWheelEvent){
        let scaleSpeed: number = 1.1

        let dx = e.x - this.Camera.x
        let dy = e.y - this.Camera.y

        const scaleDirection = e.deltaY > 0 ? 1 / scaleSpeed : scaleSpeed;
        const positionFactor = e.deltaY > 0 ? 1 / scaleSpeed : scaleSpeed;

        this.Camera.scale.x *= scaleDirection;
        this.Camera.scale.y *= scaleDirection;
        this.Camera.position.x += dx - (dx * positionFactor);
        this.Camera.position.y += dy - (dy * positionFactor);

        this.resetCameraHitArea()
    }

    resetCameraHitArea(){
        const cameraScaleInverse = (1 / this.Camera.scale.x)
        //Move Camera interaction window to new position
        let h = this.PixiApp.screen.clone()

        h.x -= this.Camera.position.x * cameraScaleInverse
        h.y -= this.Camera.position.y * cameraScaleInverse

        h.width *= cameraScaleInverse
        h.height *= cameraScaleInverse

        this.Camera.hitArea = (h);
    }
}

export const assetsManifest: AssetsManifest = {
    bundles: [
        backgroundBundle
    ]
} as AssetsManifest;


