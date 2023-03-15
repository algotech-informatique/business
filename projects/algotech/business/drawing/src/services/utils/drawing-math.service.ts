import { Injectable } from '@angular/core';
import * as math from 'mathjs';

interface NodeCoordinates {
    x: number;
    y: number;
}

class Segment3D {
    n1: NodeCoordinates;
    n2: NodeCoordinates;
}

class Rect {
    height: number;
    width: number;
    x: number;
    y: number;
}


@Injectable()
export class DrawingMathService {

    public isPointInsideSegment(
        point: NodeCoordinates,
        segment: Segment3D,
    ): boolean {
        const epsilon = 1;
        const { n1, n2 } = segment;

        // vAP,vBP,vAB vectors AP,PB and AB
        const vAP: NodeCoordinates = this.getVector(point, n2);
        const vBP: NodeCoordinates = this.getVector(point, n1);
        const vAB: NodeCoordinates = this.getVector(n2, n1);
        const crossAPBP = this.crossProduct(vAP, vBP);

        const ncrossAPBP: number = this.vectorNorm(
            crossAPBP.x,
            crossAPBP.y,
        );
        // nAP,nBP,NAB norm of AP,PB and AB
        const nAP: number = this.vectorNorm(
            vAP.x,
            vAP.y,
        );
        const nBP: number = this.vectorNorm(
            vBP.x,
            vBP.y,
        );
        const nAB: number = this.vectorNorm(
            vAB.x,
            vAB.y,
        );

        const isInsideSegement: boolean = math.abs(ncrossAPBP) <= epsilon && math.abs(nAB - (nAP + nBP)) <= epsilon;
        return isInsideSegement;
    }

    public getIntersection(s1: Segment3D, s2: Segment3D): NodeCoordinates | null {
        let intersection: NodeCoordinates = null;
        const us1: NodeCoordinates = this.getVector(
            s1.n1,
            s1.n2,
        );
        const us2: NodeCoordinates = this.getVector(
            s2.n1,
            s2.n2,
        );

        const a = us1.x;
        const b = us1.y;
        const c = 0;

        const a1 = us2.x;
        const b1 = us2.y;
        const c1 = 0;

        const det = math.det([[a - c, c1 - a1], [b - c, c1 - b1]]);

        if (det !== 0) {
            const d1 = s2.n1.x - s1.n1.x;
            const d2 = s2.n1.y - s1.n1.y;

            const det1 = math.det([[d1, c1 - a1], [d2, c1 - b1]]);
            const t = math.divide(det1, det);

            intersection = { x: 0, y: 0 };
            intersection.x = math.round(math.multiply(a, t) + s1.n1.x);
            intersection.y = math.round(math.multiply(b, t) + s1.n1.y);

        }
        return intersection;
    }

    public vectorNorm(x: number, y: number): number {
        const x2 = Math.pow(x, 2);
        const y2 = Math.pow(y, 2);
        return +math.sqrt(x2 + y2);
    }

    // returns vector P2P1
    public getVector(p1: NodeCoordinates, p2: NodeCoordinates): NodeCoordinates {
        const vector: NodeCoordinates = { x: 0, y: 0 };
        vector.x = p1.x - p2.x;
        vector.y = p1.y - p2.y;
        return vector;
    }

    public crossProduct(
        v1: NodeCoordinates,
        v2: NodeCoordinates,
    ): NodeCoordinates {
        const x = [v1.x, v1.y, 0];
        const y = [v2.x, v2.y, 0];
        const z = math.cross(x, y);

        const crossProd: NodeCoordinates = { x: z[0], y: z[1] };
        return crossProd;
    }

    overlap(box1: Rect, box2: Rect) {
        const r1 = { x1: box1.x, x2: box1.x + box1.width, y1: box1.y, y2: box1.y + box1.height };
        const r2 = { x1: box2.x, x2: box2.x + box2.width, y1: box2.y, y2: box2.y + box2.height };

        return !(r1.x1 > r2.x2 ||
            r2.x1 > r1.x2 ||
            r1.y1 > r2.y2 ||
            r2.y1 > r1.y2);
    }
}
