import {Container, Sprite} from "pixi.js";

export class Layer extends Container{
    protected layerAssets!: {[name: string]: any};
    protected layerChildren: {[childName: string]: Sprite} = {}
    public readonly layerName: string = "";

}