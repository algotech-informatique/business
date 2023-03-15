export class Polygon {
    points;
    center;

    constructor(c: { "x": number, "y": number }) {
        this.points = new Array();
        this.center = c;
    }

    /*
     *  Point x and y values should be relative to the center.
     */
    setPoints(points) {
        this.points = points;
    }

    /*
     *  Point x and y values should be relative to the center.
     */
    addPoint(p) {
        this.points.push(p);
    }

    /*
     *  Point x and y values should be absolute coordinates.
     */
    addAbsolutePoint(p) {
        this.points.push({ "x": p.x - this.center.x, "y": p.y - this.center.y });
    }

    /*
     * Returns the number of sides. Equal to the number of vertices.
     */
    getNumberOfSides() {
        return this.points.length;
    }

    /*
     *  This function returns true if the given point is inside the polygon,
     *  and false otherwise.
     */
    containsAllPoint(points): boolean {
        for (const point of points) {
            if (!this.containsPoint(point)) {
                return false;
            }
        }

        return true;
    }

    /*
     *  This function returns true if the given point is inside the polygon,
     *  and false otherwise.
     */
    containsPoint(pnt): boolean {

        var nvert = this.points.length;
        var testx = pnt.x;
        var testy = pnt.y;

        var vertx = new Array();
        for (var q = 0; q < this.points.length; q++) {
            vertx.push(this.points[q].x + this.center.x);
        }

        var verty = new Array();
        for (var w = 0; w < this.points.length; w++) {
            verty.push(this.points[w].y + this.center.y);
        }

        var i, j = 0;
        var c = false;
        for (i = 0, j = nvert - 1; i < nvert; j = i++) {
            if (((verty[i] > testy) != (verty[j] > testy)) &&
                (testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i]))
                c = !c;
        }
        return c;

    }

    /*
     *  To detect intersection with another Polygon object, this
     *  function uses the Separating Axis Theorem. It returns false
     *  if there is no intersection, or an object if there is. The object
     *  contains 2 fields, overlap and axis. Moving the polygon by overlap
     *  on axis will get the polygons out of intersection.
     */
    intersectsWith(other) {

        var axis = { x: null, y: null };
        var tmp, minA, maxA, minB, maxB;
        var side, i;
        var smallest = null;
        var overlap = 99999999;

        /* test polygon A's sides */
        for (side = 0; side < this.getNumberOfSides(); side++) {
            /* get the axis that we will project onto */
            if (side == 0) {
                axis.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
                axis.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x;
            }
            else {
                axis.x = this.points[side - 1].y - this.points[side].y;
                axis.y = this.points[side].x - this.points[side - 1].x;
            }

            /* normalize the axis */
            tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
            axis.x /= tmp;
            axis.y /= tmp;

            /* project polygon A onto axis to determine the min/max */
            minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
            for (i = 1; i < this.getNumberOfSides(); i++) {
                tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
                if (tmp > maxA)
                    maxA = tmp;
                else if (tmp < minA)
                    minA = tmp;
            }
            /* correct for offset */
            tmp = this.center.x * axis.x + this.center.y * axis.y;
            minA += tmp;
            maxA += tmp;

            /* project polygon B onto axis to determine the min/max */
            minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
            for (i = 1; i < other.getNumberOfSides(); i++) {
                tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
                if (tmp > maxB)
                    maxB = tmp;
                else if (tmp < minB)
                    minB = tmp;
            }
            /* correct for offset */
            tmp = other.center.x * axis.x + other.center.y * axis.y;
            minB += tmp;
            maxB += tmp;

            /* test if lines intersect, if not, return false */
            if (maxA < minB || minA > maxB) {
                return false;
            } else {
                var o = (maxA > maxB ? maxB - minA : maxA - minB);
                if (o < overlap) {
                    overlap = o;
                    smallest = { x: axis.x, y: axis.y };
                }
            }
        }

        /* test polygon B's sides */
        for (side = 0; side < other.getNumberOfSides(); side++) {
            /* get the axis that we will project onto */
            if (side == 0) {
                axis.x = other.points[other.getNumberOfSides() - 1].y - other.points[0].y;
                axis.y = other.points[0].x - other.points[other.getNumberOfSides() - 1].x;
            }
            else {
                axis.x = other.points[side - 1].y - other.points[side].y;
                axis.y = other.points[side].x - other.points[side - 1].x;
            }

            /* normalize the axis */
            tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
            axis.x /= tmp;
            axis.y /= tmp;

            /* project polygon A onto axis to determine the min/max */
            minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
            for (i = 1; i < this.getNumberOfSides(); i++) {
                tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
                if (tmp > maxA)
                    maxA = tmp;
                else if (tmp < minA)
                    minA = tmp;
            }
            /* correct for offset */
            tmp = this.center.x * axis.x + this.center.y * axis.y;
            minA += tmp;
            maxA += tmp;

            /* project polygon B onto axis to determine the min/max */
            minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
            for (i = 1; i < other.getNumberOfSides(); i++) {
                tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
                if (tmp > maxB)
                    maxB = tmp;
                else if (tmp < minB)
                    minB = tmp;
            }
            /* correct for offset */
            tmp = other.center.x * axis.x + other.center.y * axis.y;
            minB += tmp;
            maxB += tmp;

            /* test if lines intersect, if not, return false */
            if (maxA < minB || minA > maxB) {
                return false;
            } else {
                var o = (maxA > maxB ? maxB - minA : maxA - minB);
                if (o < overlap) {
                    overlap = o;
                    smallest = { x: axis.x, y: axis.y };
                }
            }
        }

        return { "overlap": overlap + 0.001, "axis": smallest };

    }
}