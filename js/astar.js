// world is a 2d array of integers (eg grid[10][15] = 0)
// pathStart and pathEnd are arrays like [5,10]

SneekMe.astar = (function () {
    // shortcuts for speed
    var abs = Math.abs;
    var max = Math.max;
    var pow = Math.pow;
    var sqrt = Math.sqrt;

    function p47hF1nd3r() {
        //defaults
        this.acceptableTiles = [0];
        this.grid = [[]];
    }

    p47hF1nd3r.prototype = {
        setAcceptableTiles: function (acceptableTiles) {
            this.acceptableTiles = acceptableTiles;
        },
        setGrid: function (level) {
            this.grid = level;
            // keep track of the world dimensions
            // Note that this A-star implementation expects the world array to be square: 
            // it must have equal height and width. If your game world is rectangular, 
            // just fill the array with dummy values to pad the empty space.
            this.worldHeight = level.length;
            this.worldWidth = level[0].length;
            
            this.worldSize = this.worldHeight * this.worldWidth;
        },

        // distanceFunction functions
        // these return how far away a point is to another
        ManhattanDistance: function (Point, Goal) {	// linear movement - no diagonals - just cardinal directions (NSEW)
            return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
        },
        DiagonalDistance: function (Point, Goal) {	// diagonal movement - assumes diag dist is 1, same as cardinals
            return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
        },
        EuclideanDistance: function (Point, Goal) {	// diagonals are considered a little farther than cardinal directions
            // diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
            // where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
            return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
        },

        // Neighbours functions, used by findNeighbours function
        // to locate adjacent available cells that aren't blocked

        // Returns every available North, South, East or West
        // cell that is empty. No diagonals,
        // unless distanceFunction function is not Manhattan
        Neighbours: function (x, y) {
            var N = y - 1,
                S = y + 1,
                E = x + 1,
                W = x - 1,
                myN = N > -1 && this.canWalkHere(x, N),
                myS = S < this.worldHeight && this.canWalkHere(x, S),
                myE = E < this.worldWidth && this.canWalkHere(E, y),
                myW = W > -1 && this.canWalkHere(W, y),
                result = [];

            if (myN)
                result.push({ x: x, y: N });
            if (myE)
                result.push({ x: E, y: y });
            if (myS)
                result.push({ x: x, y: S });
            if (myW)
                result.push({ x: W, y: y });
            //findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
            return result;
        },

        // returns every available North East, South East,
        // South West or North West cell - no squeezing through
        // "cracks" between two diagonals
        DiagonalNeighbours: function (myN, myS, myE, myW, N, S, E, W, result) {
            if (myN) {
                if (myE && this.canWalkHere(E, N))
                    result.push({ x: E, y: N });
                if (myW && this.canWalkHere(W, N))
                    result.push({ x: W, y: N });
            }
            if (myS) {
                if (myE && this.canWalkHere(E, S))
                    result.push({ x: E, y: S });
                if (myW && this.canWalkHere(W, S))
                    result.push({ x: W, y: S });
            }
        },

        // returns every available North East, South East,
        // South West or North West cell including the times that
        // you would be squeezing through a "crack"
        DiagonalNeighboursFree: function (myN, myS, myE, myW, N, S, E, W, result) {
            myN = N > -1;
            myS = S < this.worldHeight;
            myE = E < this.worldWidth;
            myW = W > -1;
            if (myE) {
                if (myN && this.canWalkHere(E, N))
                    result.push({ x: E, y: N });
                if (myS && this.canWalkHere(E, S))
                    result.push({ x: E, y: S });
            }
            if (myW) {
                if (myN && this.canWalkHere(W, N))
                    result.push({ x: W, y: N });
                if (myS && this.canWalkHere(W, S))
                    result.push({ x: W, y: S });
            }
        },

        // returns boolean value (world cell is available and open)
        canWalkHere: function (x, y) {
            return this.grid && this.grid[y] &&
				   this.acceptableTiles.indexOf(this.grid[y][x]) !== -1;
        },

        //TODO: fix findpath when pathend is on 0,0 -- actual bug?
        // this returns an array of coordinates
        // that is empty if no path is possible
        findPath: function (pathStart, pathEnd) {        
            // which heuristic should we use?
            // default: no diagonals (Manhattan)
            var distanceFunction = this.ManhattanDistance;
            var findNeighbours = function () { }; // empty

            // Node function, returns a new object with Node properties
            // Used in the calculatePath function to store route costs, etc.
            var a = this;
            function Node(Parent, Point) {
                return {
                    // pointer to another Node object
                    Parent: Parent,
                    // array index of this Node in the world linear array
                    value: Point.x + (Point.y * a.worldWidth),
                    // the location coordinates of this Node
                    x: Point.x,
                    y: Point.y,
                    // the heuristic estimated cost
                    // of an entire path using this node
                    f: 0,
                    // the distanceFunction cost to get
                    // from the starting point to this node
                    g: 0
                };
            }
            // create Nodes from the Start and End x,y coordinates
            var mypathStart = Node(null, { x: pathStart[0], y: pathStart[1] });
            var mypathEnd = Node(null, { x: pathEnd[0], y: pathEnd[1] });
            // create an array that will contain all world cells
            var AStar = [];
            // list of currently open Nodes
            var Open = [mypathStart];
            // list of closed Nodes
            var Closed = [];
            // list of the final output array
            var result = [];
            // reference to a Node (that is nearby)
            var myNeighbours;
            // reference to a Node (that we are considering now)
            var myNode;
            // reference to a Node (that starts a path in question)
            var myPath;
            // temp integer variables used in the calculations
            var length, max, min, i, j;
            // iterate through the open list until none are left
            while (length = Open.length) {
                max = this.worldSize;
                min = -1;
                for (i = 0; i < length; i++) {
                    if (Open[i].f < max) {
                        max = Open[i].f;
                        min = i;
                    }
                }
                // grab the next node and remove it from Open array
                myNode = Open.splice(min, 1)[0];
                // is it the destination node?
                if (myNode.value === mypathEnd.value) {
                    myPath = Closed[Closed.push(myNode) - 1];
                    do {
                        result.push([myPath.x, myPath.y]);
                    }
                    while (myPath = myPath.Parent);
                    // clear the working arrays
                    AStar = Closed = Open = [];
                    // we want to return start to finish
                    result.reverse();
                } else {// not the destination                
                    // find which nearby nodes are walkable
                    myNeighbours = this.Neighbours(myNode.x, myNode.y);
                    // test each one that hasn't been tried already
                    for (i = 0, j = myNeighbours.length; i < j; i++) {
                        myPath = Node(myNode, myNeighbours[i]);
                        if (!AStar[myPath.value]) {
                            // estimated cost of this particular route so far
                            myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
                            // estimated cost of entire guessed route to the destination
                            myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
                            // remember this new path for testing above
                            Open.push(myPath);
                            // mark this node in the world graph as visited
                            AStar[myPath.value] = true;
                        }
                    }
                    // remember this route as having no more untested options
                    Closed.push(myNode);
                }
            } // keep iterating until the Open list is empty
            return result;
        }
    };
    return p47hF1nd3r;
}()); // end of findPath() function

/*
// alternate heuristics, depending on your game:

// diagonals allowed but no sqeezing through cracks:
var distanceFunction = DiagonalDistance;
var findNeighbours = DiagonalNeighbours;

// diagonals and squeezing through cracks allowed:
var distanceFunction = DiagonalDistance;
var findNeighbours = DiagonalNeighboursFree;

// euclidean but no squeezing through cracks:
var distanceFunction = EuclideanDistance;
var findNeighbours = DiagonalNeighbours;

// euclidean and squeezing through cracks allowed:
var distanceFunction = EuclideanDistance;
var findNeighbours = DiagonalNeighboursFree;

*/
