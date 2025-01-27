export type coordinateType = "offset" | "axial" | "cubic" | "cartesian"
export class Coordinate{
    w: number; //represents the 's' value in cubic coordinates
    x: number; //represents 'x' in cart, or 'q' in hexagonal systems
    y: number; //represents 'y' in cart, or 'r' in hexagonal systems
    system: coordinateType;

    constructor(system: coordinateType, x: number, y: number, w?: number) {
        this.system = system;
        this.w = w ?? 0;
        this.x = x;
        this.y = y;

        if(system == "axial"){
            this.w = -x-y;
        }
    }

    public toOffset(): Coordinate{
        if(this.system == "offset"){
            return this;
        }

        let col = this.x + (this.y - (this.y&1)) / 2;
        let row = this.y;
        return new Coordinate("offset", col, row);
    }

    public toAxial(): Coordinate{
        if(this.system == "axial") {
            return this;
        }

        let q = this.x - (this.y - (this.y&1)) / 2;
        let r = this.y;
        return new Coordinate("axial", q, r);
    }

    public add(b: Coordinate): Coordinate{
        if(this.system != b.system){
            console.log("Unable to add Coordinates: Systems do not match");
            return this;
        }

        let x = this.x + b.x;
        let y = this.y + b.y;

        return new Coordinate(this.system, x, y)
    }

}