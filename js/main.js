(function () {
    function rand(num) {
        return Math.floor(Math.random() * num);
    }
    function fillArray(value, length) {
        var arr = [];
        while (length--) {
            arr[length] = value;
        }
        return arr;
    }

    var gridWidth = fillArray(0, 64);
    var grid = fillArray(gridWidth.slice(0), 45);
    var pathFinder = new EasyStar.js();
    pathFinder.setAcceptableTiles([0]);
    pathFinder.setGrid(grid);
    
    //Canvas stuff
    var canvas = document.getElementById('SneekMe'),
        ctx = canvas.getContext("2d"),
        gameState = new SneekMe.gameState(canvas, { game: paint }),
        cw = 16,
        MAX_FOODS = 10,
        foods,// = [],
        food_loop,
        width = 1024,
        height = 720,
        keys = [],
        players = [{
            direction: 1,
            head: '#7555DA',
            body: '#BADA55',
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            snake: []
        },
        {
            direction: 1,
            head: '#DA5555',
            body: '#55DADA',
            left: 65,
            up: 87,
            right: 68,
            down: 83,
            snake: [],
            //isComputer: true
        },
        /* /
        {
            direction: 1,
            score: 3,
            head: '#55DA5E',
            body: '#DA55D1',
            left: 74,
            up: 73,
            right: 76,
            down: 75,
            snake: []
        },
        {
            direction: 1,
            score: 3,
            head: '#707070',
            body: '#FFFFFF',
            left: 100,
            up: 104,
            right: 102,
            down: 101,
            snake: []
        }
        /* */
        ],
        bounds = {
            top: 0,
            right: width / cw - 1,
            bottom: height / cw - 1,
            left: 0
        };

    canvas.width = width;
    canvas.height = height;

    function init() {
        foods = [];

        for (var i = players.length; i--;) {
            players[i].score = 3;//3 lifes
            create_snake(players[i].snake);
        }
        create_food();
        gameState.start('game');

        if (typeof food_loop != "undefined") clearInterval(food_loop);
        food_loop = setInterval(function () {
            if (foods.length < MAX_FOODS) {
                create_food();
            }
        }, 5000);
    }
    init();

    function create_snake(arr) {
        var snakeLength = 3,
            x = rand((width / cw) - 5),
            y = rand((height / cw) - 2);
        arr.length = 0;

        for (var i = snakeLength; i--;) {
            arr.push({
                x: x + i,
                y: y
            });
        }
    }

    //Lets create the food now
    function create_food() {
        foods.push({
            x: rand((width - cw) / cw),
            y: rand((height - cw) / cw),
        });
        //This will create a cell with x/y between 0-44
        //Because there are 45(450/10) positions accross the rows and columns
    }

    function update() {
        var allSnakes = [];
        for (var i = players.length; i--;) {
            allSnakes = allSnakes.concat(players[i].snake);
        }        

        for (var i = players.length; i--;) {
            var player = players[i];
            if (player.snake.length) {
                var d = player.direction,
                    nx = player.snake[0].x,
                    ny = player.snake[0].y;

                if (player.isComputer) {
                    pathFinder.findPath(nx, ny, foods[0].x, foods[0].y, function (path) {
                        if (path === null) {
                            //alert("Path was not found.");
                        } else {
                            //alert("Path was found. The first Point is " + path[0].x + " " + path[0].y);
                            nx = path[1].x;
                            ny = path[1].y;
                        }
                    });
                    pathFinder.calculate();
                } else {
                    if (keys[player.left] && d !== 1) { //right
                        d = 3;
                        nx--
                    } else if (keys[player.up] && d !== 2) {//down
                        d = 0;
                        ny--
                    } else if (keys[player.right] && d !== 3) {//left
                        d = 1;
                        nx++;
                    } else if (keys[player.down] && d !== 0) {//up
                        d = 2;
                        ny++;
                    } else {
                        if (d == 0) ny--;
                        else if (d == 1) nx++;
                        else if (d == 2) ny++;
                        else if (d == 3) nx--;
                    }
                    player.direction = d;
                }

                //Wrap around
                if (nx < bounds.left) {
                    nx = bounds.right;
                } else if (nx > bounds.right) {
                    nx = bounds.left;
                } else if (ny < bounds.top) {
                    ny = bounds.bottom;
                } else if (ny > bounds.bottom) {
                    ny = bounds.top;
                }

                //Now if the head of the snake bumps into anybody, the game will restart
                if (~check_collision(nx, ny, allSnakes)) {
                    player.direction = 1;
                    player.score--;
                    if (player.score) {
                        create_snake(player.snake);
                    } else {
                        player.snake = [];
                    }
                    continue;
                }

                //Create a new head instead of moving the tail
                if (~check_collision(nx, ny, foods, true)) {
                    var tail = { x: nx, y: ny };
                    //Create new food
                    if (foods.length < players.length) {
                        create_food();
                    }
                } else {
                    var tail = player.snake.pop(); //pops out the last cell
                    tail.x = nx;
                    tail.y = ny;
                }
                //The snake can now eat the food.

                player.snake.unshift(tail); //puts back the tail as the first cell
            }
        }
    }

    function drawBackground(){
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "white";
        ctx.strokeRect(0, 0, width, height);
    }

    function drawFood() {
        ctx.fillStyle = '#FF0000';
        for (var i = foods.length; i--;) {
            ctx.fillRect(foods[i].x * cw, foods[i].y * cw, cw, cw);
        }
    }

    function drawSnake() {
        for (var i = players.length; i--;) {
            var player = players[i];

            if (player.snake.length) {
                //paint head of snake
                ctx.fillStyle = player.head;
                ctx.fillRect(player.snake[0].x * cw, player.snake[0].y * cw, cw, cw);
                //paint body of snake
                ctx.fillStyle = player.body;
                ctx.strokeStyle = '#000000';
                for (var j = 1; j < player.snake.length; j++) {
                    ctx.fillRect(player.snake[j].x * cw, player.snake[j].y * cw, cw, cw);
                    ctx.strokeRect(player.snake[j].x * cw, player.snake[j].y * cw, cw, cw);
                }
            }
        }
    }

    function drawHud() {
        for (var i = players.length; i--;) {
            ctx.fillText('Player' + (i + 1) + ': ' + players[i].score, 5, 15 + (10 * i));
        }
    }

    //Lets paint the snake now
    function paint() {
        drawBackground();
        update();
        drawFood();
        drawSnake();
        drawHud();
    }

    function check_collision(x, y, array, splice) {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y) {
                if (splice) array.splice(i, 1);
                return i;
            }
        }
        return -1;
    }

    //Lets add the keyboard controls now
    canvas.addEventListener('keydown', function (e) {
        e = e ? e : window.event;
        keys[e.keyCode] = true;
    });
    canvas.addEventListener('keyup', function (e) {
        e = e ? e : window.event;
        keys[e.keyCode] = false;
    });

    var fps = 30;
    var now;
    var then = Date.now();
    var interval = 1000 / fps;
    var delta;

    function draw() {
        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

            // ... Code for Drawing the Frame ...
        }
        requestAnimationFrame(draw);
    }

    draw();

}());