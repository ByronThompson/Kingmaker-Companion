import {
    Application,
    Sprite,
    FederatedWheelEvent,
    FederatedPointerEvent,
    Container,
    Assets, Graphics, Text, TextStyle
} from 'pixi.js'

import { Kingdom } from './Kingdom'
import {Hex} from "./Hex";
import {hubConnection} from "./index";

let app: Application;
let dragTarget: Sprite | null = null;
let background: Sprite;
let backAnc: Container;
let viewMode: string = "claim";
let kingdomData: string;
let kingdom: Kingdom;

export async function CreateView(){
    app = new Application({
        view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: 0x000000,
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    let splits : string[] = window.location.pathname.split("/");
    let gameId : string = splits[3];
    
    let mapURL : string = window.location.origin + "/Assets/Kingmaker-Stolen-Lands-Accurate-grid-no-labels.webp"

    Promise.all([hubConnection.invoke("gameconnect", gameId), Assets.load(mapURL)])
        .then(r => {
            kingdomData = r[0];
            console.log(kingdomData)

            background = Sprite.from(r[1]);

            init();
        })
        .catch(console.log);
}

function init(): void{

    //Create Background image
    background.anchor.set(0)
    background.x = 0;
    background.y = 0;
    app.stage.addChild(background);

    //Create anchor point for all background children
    backAnc = new Container();
    background.addChild(backAnc)

    //Define stage interacts
    app.stage.hitArea = app.screen
    app.stage.on("wheel", zoom);
    app.stage.on('rightup', onDragEnd);
    app.stage.on('rightupoutside', onDragEnd);
    app.stage.interactive = true;

    //define background interacts
    background.on("rightdown", onDragStart, background)
    background.interactive = true;

    //Suppress Right Click menu
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
    });

    let btn: Graphics = app.stage.addChild(new Graphics()
        .lineStyle(2, 0xff00ff, 1)
        .beginFill(0x650a5a, 0.25)
        .drawRoundedRect(50,220,100,100,16)
        .endFill());
    btn.on('pointertap', swapViewMode);
    btn.interactive = true;

    let btn2: Graphics = app.stage.addChild(new Graphics()
        .lineStyle(2, 0xff00ff, 1)
        .beginFill(0x650a5a, 0.25)
        .drawRoundedRect(50,440,100,100,16)
        .endFill());
    btn2.on('pointertap', (() => {console.log(kingdom.json())}));
    btn2.interactive = true;

    let btn3: Graphics = app.stage.addChild(new Graphics()
        .lineStyle(2, 0xff00ff, 1)
        .beginFill(0x650a5a, 0.25)
        .drawRoundedRect(50,660,100,100,16)
        .endFill());
    btn3.on('pointertap', (() => {console.log(kingdom)}));
    btn3.interactive = true;
    
    kingdom = new Kingdom();
    kingdom.loadSave(kingdomData)
    
    addKingdomName();
    
    
    //Set properties for initial view
    background.anchor.set(0.5);
    background.x = window.innerWidth/2;
    background.y = window.innerHeight/2;
    updateBackgroundAnchor()
    background.scale.set(0.3);

}

function swapViewMode(){
    if(viewMode == "claim"){
        viewMode = "explore"
    }else{
        viewMode = "claim"
    }

    kingdom.updateHexDisplay();
}

function addKingdomName(){
    const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 100,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#1e8839'], // gradient
        stroke: '#000000',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: getBackgroundWidth()/3,
        lineJoin: 'round',
    });

    const richText = backAnc.addChild(new Text(kingdom.kingdomName, style));
    richText.anchor.set(0.5)
    richText.x = getBackgroundWidth()/2.03;
    richText.y = getBackgroundHeight() * 0.03;

}

function zoom(e: FederatedWheelEvent): void {
    let scaleSpeed: number = 1.1;

    moveSpriteAnchorToPoint(e.x, e.y, background);
    updateBackgroundAnchor()

    if(background.scale.x/scaleSpeed <= 0.3 && e.deltaY > 0){
        background.scale.y = 0.3;
        background.scale.x = 0.3;

        return;
    }else if((background.scale.x*scaleSpeed >= 2 && e.deltaY < 0)){
        background.scale.y = 2;
        background.scale.x = 2;

        return;
    }

    if (e.deltaY > 0) {
        background.scale.y /= scaleSpeed;
        background.scale.x /= scaleSpeed;
    } else {
        background.scale.y *= scaleSpeed;
        background.scale.x *= scaleSpeed;
    }
}

function onDragStart(this: Sprite, e: FederatedPointerEvent): void {
    dragTarget = this;

    moveSpriteAnchorToPoint(e.x, e.y, dragTarget)
    updateBackgroundAnchor()

    app.stage.on("pointermove", onDragMove);
}

function onDragMove(event: FederatedPointerEvent): void{
    if (dragTarget != null) {
        dragTarget.parent.toLocal(event.global, undefined, dragTarget.position);
    }
}

function onDragEnd() {
    if (dragTarget) {
        app.stage.off('pointermove', onDragMove);
        dragTarget = null;
    }
}

function moveSpriteAnchorToPoint(x: number, y: number, s: Sprite): void{
    //Calculate the position of the top left corner of the image
    let rX: number = s.position.x - (s.anchor.x * s.width);
    let rY: number = s.position.y - (s.anchor.y * s.height);

    //Calculate the local position of the cursor on the image
    let lX: number = x - rX;
    let lY: number = y - rY;

    //Move the anchor of the image to the location of the pointer, then move the image to the location of the pointer
    s.anchor.set(lX/s.width, lY/s.height);
    s.position.x = x;
    s.position.y = y;
}

function updateBackgroundAnchor(): void{
    backAnc.x = -background.anchor.x * (background.texture.orig.width);
    backAnc.y = -background.anchor.y * (background.texture.orig.height);
}

export function getBackgroundWidth(): number{
    return background.texture.baseTexture.width;
}

export function getBackgroundHeight(): number{
    return background.texture.baseTexture.height;
}

export function addHex(hex: Hex): Hex{
    return backAnc.addChild(hex);
}

export function getCurrentViewMode(): string{
    return viewMode;
}

export function loadKingdom(json: string){
    kingdom.loadSave(json);
}

export function recieveMapUpdate(message: string){
    let result = JSON.parse(message);
    kingdom.updateHex(result.index, result.property, result.newState);
}