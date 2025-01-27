import {Coordinate} from "./Coordinate";

export class GridCell{
    position: Coordinate;
    data: any;

    constructor(position: Coordinate, data?: any) {
        this.position = position;
        this.data = data;
    }

    public pixelPosition(cellSize: number): Coordinate{
        let x = cellSize * (Math.sqrt(3) * this.position.x + Math.sqrt(3)/2 * this.position.y)
        let y = cellSize * (3/2 * this.position.y)

        return new Coordinate("cartesian", x, y);
    }
}