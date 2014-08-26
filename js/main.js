(function () {
    function rand(num) {
        return Math.floor(Math.random() * num);
    }
    function makeImages(images, callback) {
        var result = {},
            loads = 0,
            keys = Object.keys(images),
            num = keys.length;

        for (var i = num; i--;) {
            var key = keys[i],
                img = new Image();
            img.onload = function () {
                if (++loads >= num) callback(result);
            };
            img.src = images[key];
            result[key] = img;
        }
    }
    function log() {
        //console.log.apply(console, arguments);
        var output = document.getElementById('output'),
            txt = '';
        for (var i = 0, l = arguments.length; i < l; i++) {
            txt += arguments[i].toString()+' ';
        }
        output.innerHTML = txt + '<BR>' + output.innerHTML;
    }

    var level = SneekMe.first,
        tiles = {
            none: 0,
            solid: 1,
            breakable: 2,
            food: 50,
            weapon: 66,
            snake: 99
        },
        acceptable = [tiles.none, tiles.food],
        pathFinder = new EasyStar.js();
    pathFinder.setAcceptableTiles(acceptable);
    pathFinder.setGrid(level);
    
    //Canvas stuff
    var bg = document.getElementById('bg'),
        canvas = document.getElementById('SneekMe'),
        bgctx = bg.getContext("2d"),
        ctx = canvas.getContext("2d"),
        gameState = new SneekMe.gameState(canvas, { game: paint }),
        cw = 16,
        MAX_FOODS = 10,
        MAX_TAILS = 5,
        MAX_LIFES = 3,
        BEGIN_LENGTH = 3,
        foods,// = [],
        food_loop,
        width = 1024,
        height = 720,
        keys = [],
        players = [{
            direction: 1,
            head: '#1E1959',
            body: '#373276',
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            snake: [],
            //isComputer: true
        },
        /* */
        {
            direction: 1,
            head: '#3B1255',
            body: '#562A72',
            left: 65,
            up: 87,
            right: 68,
            down: 83,
            snake: [],
            //isComputer: true
        },
        /* */
        {
            direction: 1,
            head: '#801515',
            body: '#AA3939',
            left: 74,
            up: 73,
            right: 76,
            down: 75,
            snake: [],
            //isComputer: true
        },
        {
            direction: 1,
            head: '#806815',
            body: '#AA9139',
            left: 100,
            up: 104,
            right: 102,
            down: 101,
            snake: [],
            //isComputer: true
        },
        /* */
        {
            direction: 1,
            head: '#196811',
            body: '#378B2E',
            snake: [],
            isComputer: true
        },
        {
            direction: 1,
            head: '#0D4C4C',
            body: '#226666',
            snake: [],
            isComputer: true
        },
        {
            direction: 1,
            head: '#671140',
            body: '#892D5F',
            snake: [],
            isComputer: true
        },
        {
            direction: 1,
            head: '#333333',
            body: '#707070',
            snake: [],
            isComputer: true
        },
        /* */
        ],
        bounds = {
            top: 0,
            right: width / cw - 1,
            bottom: height / cw - 1,
            left: 0
        };

    makeImages({steel: 'img/steel.jpg'}, init);
    function init(images) {
        canvas.width = width;
        canvas.height = height;
        bg.width = width;
        bg.height = height;
        drawBackground(images.steel);

        foods = [];

        for (var i = players.length; i--;) {
            players[i].score = MAX_LIFES;
            players[i].tails = 0;
            create_snake(players[i].snake);
            create_food();
        }        
        gameState.start('game');
        /* */
        if (typeof food_loop != "undefined") clearInterval(food_loop);
        food_loop = setInterval(function () {
            if (foods.length < MAX_FOODS) {
                create_food();
            }
        }, 5000);
        /* */
    }

    function create_snake(arr) {
        var snakeLength = BEGIN_LENGTH,
            f,
            pos;
        arr.length = 0;

        function getPos() {
            return {
                x: rand((width / cw) - 3),
                y: rand((height / cw) - 1)
            }
        }

        while (!f) {
            pos = getPos();
            log('position', pos.x, pos.y, level[pos.y][pos.x]);
            if (level[pos.y][pos.x] === tiles.none &&
                level[pos.y][pos.x+1] === tiles.none &&
                level[pos.y][pos.x+2] === tiles.none) {
                f = true;
            }
        }

        for (var i = snakeLength; i--;) {
            arr.push({
                x: pos.x + i,
                y: pos.y
            });
            level[pos.y][pos.x + 1] = tiles.snake;
        }
    }

    //Lets create the food now
    function create_food() {
        var f = false,
            pos;
        function getPos(){
            return {
                x: rand((width / cw)-1),
                y: rand((height / cw) - 1)
            }
        }

        while(!f){
            pos = getPos();
            log('food', pos.x, pos.y, level[pos.y][pos.x]);
            if (level[pos.y][pos.x] === tiles.none) {
                f = true;
            }
        }

        foods.push(pos);
        level[pos.y][pos.x] = tiles.food;
    }

    function findDirection(ox, oy, nx, ny) {

        if (ox === nx) {
            return oy < ny ? 2 : 0;//down : up;
        } else {
            return ox < nx ? 1 : 3;//right : left;
        }
    }

    function moveComputer(player) {
        var d = player.direction,
            ox = player.snake[0].x,
            oy = player.snake[0].y;
        player.count++;

        function findPath() {
            log('self', ox, oy, ' target', player.tx, player.ty);
            pathFinder.findPath(ox, oy, player.tx, player.ty, function (path) {
                if (path === null || path.length < 2) {//alert("Path was not found.");
                    log('OH NOES WHATTODO');
                } else {
                    player.path = path;
                    player.count = 1;
                    player.direction = findDirection(ox, oy, player.path[player.count].x, player.path[player.count].y);
                }
            });
            pathFinder.calculate();
        }

        if (!(player.tx > -1 /*&& player.ty > -1*/) || level[player.ty][player.tx] !== tiles.food) {
            var f = foods[rand(foods.length - 1)];
            player.tx = f.x;
            player.ty = f.y;
        }

        if (!player.path || player.count >= player.path.length) {
            findPath();
        } else {
            var nx = player.path[player.count].x,
                ny = player.path[player.count].y;

            if (acceptable.indexOf(level[ny][nx]) === -1) {
                findPath();
            } else {
                player.direction = findDirection(ox, oy, nx, ny);
            }
        }
    }

    function moveHuman(player) {
        var d = player.direction;

        if (keys[player.left] && d !== 1) { //right
            d = 3;//left
        } else if (keys[player.up] && d !== 2) {//down
            d = 0;//up
        } else if (keys[player.right] && d !== 3) {//left
            d = 1;//right
        } else if (keys[player.down] && d !== 0) {//up
            d = 2;//down
        }
        player.direction = d;
    }

    function update() {
        for (var i = players.length; i--;) {
            var player = players[i];

            if (!player.snake.length) {
                continue;
            }

            //Move computer & human to set correct direction
            if (player.isComputer) {
                moveComputer(player);
            } else {
                moveHuman(player);
            }

            var d = player.direction,
                nx = player.snake[0].x,
                ny = player.snake[0].y;

            if (d == 0) ny--;
            else if (d == 1) nx++;
            else if (d == 2) ny++;
            else if (d == 3) nx--;

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

            //Now if the head of the snake bumps into an unacceptable tile, the game will restart
            if (acceptable.indexOf(level[ny][nx]) === -1) {
                //GAMEOVER
                player.direction = 1;
                player.score--;

                //TODO: Dead parts need to stay on the field
                for (var j = player.snake.length; j--;) {
                    var part = player.snake[j];
                    level[part.y][part.x] = tiles.none;
                }

                if (player.score) {
                    create_snake(player.snake);
                } else {
                    player.snake = [];
                    player.tails = 0;
                }
                continue;
            }

            //Create a new head instead of moving the tail
            if (level[ny][nx] === tiles.food) {
                check_collision(nx, ny, foods, true);
                player.tails += MAX_TAILS;                
                //Create new food
                if (foods.length < players.length) {
                    create_food();
                }
            }

            if (player.tails) {
                var tail = { x: nx,
                    y: ny
                };
                player.tails--;
            }else{
                var tail = player.snake.pop(); //pops out the last cell
                level[tail.y][tail.x] = tiles.none;
                tail.x = nx;
                tail.y = ny;
            }

            level[tail.y][tail.x] = tiles.snake;
            player.snake.unshift(tail); //puts back the tail as the first cell
        }
    }

    function drawBackground(img){
        //bgctx.fillStyle = "black";
        //bgctx.fillRect(0, 0, width, height);
        bgctx.drawImage(img, 0, 0, width, height);
    }

    function drawLevel() {
        var h = level.length,
            w = level[0].length;

        for (var i = h; i--;) {
            for (var j = w; j--;) {
                switch (level[i][j]) {
                    case tiles.solid:
                        ctx.fillStyle = 'white';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.breakable:
                        ctx.fillStyle = '#32CD32';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.food:
                        ctx.fillStyle = '#FF0000';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    default:
                }
            }
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

        if (keys[32]) {
            var h = level.length,
                w = level[0].length;
            ctx.fillStyle = '#00FF00';
            for (var i = h; i--;) {
                for (var j = w; j--;) {
                    ctx.fillText(level[i][j], j * cw + 5, i * cw + 10);
                }
            }
        }
    }

    //Lets paint the snake now
    function paint() {
        update();
        drawLevel();        
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
    document.addEventListener('keydown', function (e) {
        e = e ? e : window.event;
        keys[e.keyCode] = true;
        e.preventDefault();
    });
    document.addEventListener('keyup', function (e) {
        e = e ? e : window.event;
        keys[e.keyCode] = false;
        e.preventDefault();
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