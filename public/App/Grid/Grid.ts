import {GridCell} from "./GridCell";
import {Coordinate} from "./Coordinate";

export class Grid{
    type: gridType;
    cells: GridCell[][] = [];
    cellSize: number;
    offset: Coordinate;

    constructor(
        type: gridType,
        dimX: number,
        dimY: number,
        cellSize: number,
        offset = new Coordinate('cartesian', 0, 0)) {

        this.type = type;
        this.cellSize = cellSize;
        this.offset = offset;

        let cells: GridCell[][] = [];

        for (let i = 0; i < dimY; i++) {
            cells[i] = [];
            for (let j = 0; j < dimX; j++) {
                let q = j - (i - (i&1)) / 2

                cells[i][j] = new GridCell(new Coordinate("axial", q, i))
            }
        }

        this.cells = cells;
    }
}

export type gridType = 'square' | 'hex'