SneekMe.startGame = function (level, cw) {
    function rand(num) {
        return Math.floor(Math.random() * num);
    }
    function log() {
        //console.log.apply(console, arguments);
        var output = document.getElementById('output'),
            txt = '';
        for (var i = 0, l = arguments.length; i < l; i++) {
            txt += arguments[i].toString() + ' ';
        }
        output.innerHTML = txt + '<BR>' + output.innerHTML;
    }

    var tiles = {
            none: 0,
            solid: 1,
            breakable: 2,
            food: 50,
            weapon: 51,
            bullit: 66,
            deadSnake: 88,
            snake: 99
        },
        acceptable = [tiles.none, tiles.food, tiles.weapon],
        pathFinder = new SneekMe.astar();
    //pathFinder = new EasyStar.js();
    pathFinder.setAcceptableTiles(acceptable);
    pathFinder.setGrid(level);

    var canvas = document.getElementById('SneekMe'),
        ctx = canvas.getContext("2d"),
        gameState = new SneekMe.gameState(10, canvas, { game: update }),        
        height = level.length * cw,
        width = level[0].length * cw,
        mid = cw / 2,
        MAX_FOODS = 10,
        MAX_WEAPONS = 5,
        MAX_TAILS = 5,
        pickip_loop,
        foods,        
        weapons,
        bullits,
        pause = true,
        players = [new SneekMe.player({
            id: 0,
            head: '#1E1959',
            body: '#373276',
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            shoot: 16,
            //isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 1,
            head: '#3B1255',
            body: '#562A72',
            left: 65,
            up: 87,
            right: 68,
            down: 83,
            shoot: 9,
            isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 2,
            head: '#801515',
            body: '#AA3939',
            left: 74,
            up: 73,
            right: 76,
            down: 75,
            shoot: 76,
            isComputer: true
        }),
        new SneekMe.player({
            id: 3,
            head: '#806815',
            body: '#AA9139',
            left: 100,
            up: 104,
            right: 102,
            down: 101,
            shoot: 96,
            isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 4,
            head: '#196811',
            body: '#378B2E',
            isComputer: true
        }),
        new SneekMe.player({
            id: 5,
            head: '#0D4C4C',
            body: '#226666',
            isComputer: true
        }),
        new SneekMe.player({
            id: 6,
            head: '#671140',
            body: '#892D5F',
            isComputer: true
        }),
        new SneekMe.player({
            id: 7,
            head: '#333333',
            body: '#707070',
            isComputer: true
        }),
        /* */
        ],
        bounds = {
            top: 0,
            right: width / cw - 1,
            bottom: height / cw - 1,
            left: 0
        };

    init();
    function init(images) {
        canvas.width = width;
        canvas.height = height;
        foods = [];
        weapons = [];
        bullits = [];

        for (var i = players.length; i--;) {
            create_snake(players[i]);
            create_food();
        }

        paint();
        drawPause();

        SneekMe.keyHandler = function () {
            if (SneekMe.keys[32]) {
                if (pause) {
                    pause = false;
                    gameState.start('game');                    
                } else {
                    pause = true;
                    gameState.stop();
                    drawPause();
                }
            }
        }

        /* */
        if (typeof pickip_loop != "undefined") clearInterval(pickip_loop);
        pickip_loop = setInterval(function () {
            if (foods.length < MAX_FOODS) {
                create_food();
            }

            if (weapons.length < MAX_WEAPONS) {
                create_weapon();
            }
        }, 5000);
        /* */
    }

    function gameOver() {
        var maxSnake = { value: 0, index: -1 },
            maxLife = { value: 0, index: -1 },
            foodCount = { value: 0, index: -1 },
            shotsFired = { value: 0, index: -1 },
            shotsHit = { value: 0, index: -1, fired: 0 };

        for (var i = players.length; i--;) {
            var player = players[i];

            if (player.maxSnake > maxSnake.value) {
                maxSnake.index = i;
                maxSnake.value = player.maxSnake;
            }

            if (player.maxLife > maxLife.value) {
                maxLife.index = i;
                maxLife.value = player.maxLife;
            }

            if (player.foodCount > foodCount.value) {
                foodCount.index = i;
                foodCount.value = player.foodCount;
            }

            if (player.shotsFired > shotsFired.value) {
                shotsFired.index = i;
                shotsFired.value = player.shotsFired;
            }

            if (player.shotsHit > shotsHit.value) {
                shotsHit.index = i;
                shotsHit.value = player.shotsHit;
                shotsHit.fired = player.shotsFired;
            }
        }
        log('Longest snake:', maxSnake.value, 'Player ' + (maxSnake.index + 1));
        log('Longest life:', ~~(maxLife.value / 1000)+'s', 'Player ' + (maxLife.index + 1));
        log('Most foods:', foodCount.value, 'Player ' + (foodCount.index + 1));
        log('Bulltis fired:', shotsFired.value, 'Player ' + (shotsFired.index + 1));
        log('Bullits hit:', shotsHit.value, 'Player ' + (shotsHit.index + 1));
        log('Accuracy:', (shotsHit.value / shotsHit.fired * 100).toFixed(2) + '%', 'Player ' + (shotsHit.index + 1));

        clearInterval(pickip_loop);
        gameState.stop();
    }

    function findEmptyPos() {
        var f, pos;

        function getPos() {
            return {
                x: rand((width / cw) - 3),
                y: rand((height / cw) - 1)
            }
        }

        while (!f) {
            pos = getPos();
            if (level[pos.y][pos.x] === tiles.none) {
                f = true;
            }
        }
        return pos;
    }

    function create_snake(player) {
        var pos = findEmptyPos();
        player.snake.length = 0;//clear array from reference        
        player.snake.push({
            x: pos.x,
            y: pos.y
        });
        level[pos.y][pos.x] = tiles.snake;
    }

    function create_food() {
        var pos = findEmptyPos();
        foods.push(pos);
        level[pos.y][pos.x] = tiles.food;
    }

    function create_weapon() {
        var pos = findEmptyPos();
        weapons.push(pos);
        level[pos.y][pos.x] = tiles.weapon;
    }

    function findDirection(ox, oy, nx, ny) {
        return ox === nx ? (oy < ny ? 2 : 0) : (ox < nx ? 1 : 3);
    }

    function moveComputer(player) {
        var d = player.direction,
            ox = player.snake[0].x,
            oy = player.snake[0].y;
        player.count++;

        function findPath() {
            //log('findPath', ox, oy, ' target', player.tx, player.ty);
            //pathFinder.findPath(ox, oy, player.tx, player.ty, function (path) {
            var path = pathFinder.findPath([ox, oy], [player.tx, player.ty]);
            if (path === null || path.length < 2) {//alert("Path was not found.");
                //log('OH NOES WHATTODO');
                //TODO: FIND empty spot and reduce call to findpath
                if (player.direction === -1) player.direction = rand(2) + 1;
            } else {
                player.path = path;
                player.count = 1;
                var newDirection = player.path[player.count];
                player.direction = findDirection(ox, oy, newDirection[0], newDirection[1]);
            }
            //pathFinder.calculate();
        }

        if (!(player.tx > -1) || level[player.ty][player.tx] !== tiles.food) {
            var f = foods[rand(foods.length - 1)];
            player.tx = f.x;
            player.ty = f.y;
            findPath();
        } else if (player.count >= player.path.length) {
            findPath();
        } else {
            var path = player.path[player.count],
                nx = path[0],
                ny = path[1];
                //nx = player.path[player.count].x,
                //ny = player.path[player.count].y;

            if (acceptable.indexOf(level[ny][nx]) === -1) {
                findPath();
            } else {
                player.direction = findDirection(ox, oy, nx, ny);
            }
        }

        if (player.shots && rand(100) > 95) {
            shoot(player);
        }
    }

    function moveHuman(player) {
        var d = player.direction;
        //TODO: for speedkeys
        //1. go pressed direction 
        //2. set pressed key to false
        //3. moveHuman again
        //4. ???????
        //5. PROFIT
        if (SneekMe.keys[player.left] && d !== 1) { //right
            d = 3;//left
        } else if (SneekMe.keys[player.up] && d !== 2) {//down
            d = 0;//up
        } else if (SneekMe.keys[player.right] && d !== 3) {//left
            d = 1;//right
        } else if (SneekMe.keys[player.down] && d !== 0) {//up
            d = 2;//down
        } else if (SneekMe.keys[player.shoot] && player.shots) {
            shoot(player);
        }
        player.direction = d;
    }

    function respawn(player) {
        SneekMe.playSound('dead');
        createDeadSnake(player.snake.slice(0));
        player.score--;
        player.respawn();

        if (player.score) {
            create_snake(player);
        }
    }

    function shoot(player) {
        var x = player.snake[0].x,
            y = player.snake[0].y,
            one = { x: x, y: y, direction: 1, owner: player.id },
            two = { x: x, y: y, direction: 3, owner: player.id };
        player.shots -= 1;

        if (player.direction === 1 || player.direction === 3) {
            one.direction = 0;
            two.direction = 2;
        }
        bullits.push(one, two);
        player.shotsFired += 2;
        SneekMe.playSound('shoot');
    }

    function createDeadSnake(snake) {
        for (var i = snake.length; i--;) {
            level[snake[i].y][snake[i].x] = tiles.deadSnake;
        }
        setTimeout(function () {
            for (var j = snake.length; j--;) {
                if (level[snake[j].y][snake[j].x] === tiles.deadSnake)
                    level[snake[j].y][snake[j].x] = tiles.none;
            }
        }, 10000);
    }

    function plotBullits() {
        //TODO: fix boundary issue when level has no border
        for (var i = bullits.length; i--;) {
            var bullit = bullits[i];
            level[bullit.y][bullit.x] = tiles.none;

            if (bullit.direction == 0) bullit.y--;
            else if (bullit.direction == 1) bullit.x++;
            else if (bullit.direction == 2) bullit.y++;
            else if (bullit.direction == 3) bullit.x--;

            if (bullit.x < bounds.left ||
                bullit.x > bounds.right ||
                bullit.y < bounds.top ||
                bullit.y > bounds.bottom) {
                continue;
            }

            var tile = level[bullit.y][bullit.x];
            if (acceptable.indexOf(tile) === -1) {

                if (tile === tiles.snake) {
                    for (var j = players.length; j--;) {
                        var player = players[j],
                            index = check_collision(bullit.x, bullit.y, player.snake);

                        if (~index) {
                            players[bullit.owner].shotsHit++;
                            //index hit the head or 2nd index
                            if (index < 2) {
                                respawn(player);
                            } else {
                                SneekMe.playSound('hit');
                                var snake = player.snake;
                                player.snake = snake.slice(0, index);
                                createDeadSnake(snake.slice(index, snake.length));
                            }
                            break;
                        }
                    }
                } else if (tile === tiles.breakable || tile === tiles.deadSnake) {
                    players[bullit.owner].shotsHit++;
                    level[bullit.y][bullit.x] = tiles.none;
                }
                bullits.splice(i, 1);
                continue;
            }
            level[bullit.y][bullit.x] = tiles.bullit;
        }
    }

    function update() {
        var playerCount = 0;
        for (var i = players.length; i--;) {
            var player = players[i];
            if (!player.snake.length) continue;
            playerCount++;

            //Move computer & human to set correct direction
            if (player.isComputer) {
                moveComputer(player);
            } else {
                moveHuman(player);
            }

            var d = player.direction,
                nx = player.snake[0].x,
                ny = player.snake[0].y;

            if (d === -1) continue;

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
                respawn(player);
                continue;
            }

            //Create a new head instead of moving the tail
            if (level[ny][nx] === tiles.food) {
                SneekMe.playSound('food');
                check_collision(nx, ny, foods, true);
                player.tails += MAX_TAILS;
                player.foodCount++;
                //Create new food
                if (foods.length < players.length) {
                    create_food();
                }
            } else if (level[ny][nx] === tiles.weapon) {
                SneekMe.playSound('weapon');
                check_collision(nx, ny, weapons, true);
                player.shots += 1;
            }

            if (player.tails) {
                var tail = {
                    x: nx,
                    y: ny
                };
                player.tails--;                
            } else {
                var tail = player.snake.pop(); //pops out the last cell
                level[tail.y][tail.x] = tiles.none;
                tail.x = nx;
                tail.y = ny;
            }

            level[tail.y][tail.x] = tiles.snake;
            player.snake.unshift(tail); //puts back the tail as the first cell          
            player.registerStats();
        }

        if (players.length > 1 && playerCount <= 1) {
            gameOver();
            paint();
            return;
        }

        plotBullits();
        paint();
    }

    function drawLevel() {
        var h = level.length,
            w = level[0].length;

        for (var i = h; i--;) {
            for (var j = w; j--;) {
                switch (level[i][j]) {
                    case tiles.solid:
                        ctx.fillStyle = '#CCCCCC';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.breakable:
                        ctx.fillStyle = '#999999';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.food:
                        ctx.fillStyle = '#00FF00';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.weapon:
                        ctx.fillStyle = '#0000FF';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.bullit:
                        ctx.fillStyle = '#FF0000';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.deadSnake:
                        ctx.fillStyle = '#666666';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    default:
                }
            }
        }
    }

    function drawSnake() {
        
        ctx.lineWidth = 2;

        for (var i = players.length; i--;) {
            var player = players[i];

            if (player.snake.length) {
                var x = player.snake[0].x * cw,
                    y = player.snake[0].y * cw;
                //paint head of snake
                ctx.fillStyle = player.head;

                if (player.direction === -1) {
                    ctx.strokeStyle = player.head;
                    ctx.beginPath();
                    ctx.arc(x + mid, y + mid, cw + cw, 0, 2 * Math.PI, false);
                    ctx.stroke();
                }

                ctx.fillRect(x, y, cw, cw);
                //paint body of snake
                ctx.fillStyle = player.body;
                for (var j = 1; j < player.snake.length; j++) {
                    ctx.fillRect(player.snake[j].x * cw, player.snake[j].y * cw, cw, cw);
                }
            }
        }
    }

    function drawHud() {
        ctx.font = '8pt Calibri';
        ctx.fillStyle = '#FF007F';
        for (var i = players.length; i--;) {
            ctx.fillText('Player' + (i + 1) + ': ' + players[i].score, 5, 15 + (10 * i));
        }

        if (SneekMe.keys[13]) {
            var h = level.length,
                w = level[0].length;
            ctx.font = '6pt Calibri';
            ctx.fillStyle = '#00FF00';
            for (var i = h; i--;) {
                for (var j = w; j--;) {
                    ctx.fillText(level[i][j], j * cw + 5, i * cw + 10);
                }
            }

            ctx.strokeStyle = "#FF0000";
            for (var i = players.length; i--;) {
                var p = players[i].path;
                if (p && p.length) {
                    ctx.beginPath();
                    ctx.moveTo(p[0][0] * cw + mid, p[0][1] * cw + mid);
                    for (var j = players[i].count, l = p.length; j < l; j++) {
                        ctx.lineTo(p[j][0] * cw + mid, p[j][1] * cw + mid);
                    }
                    ctx.stroke();
                }
            }
        }
    }

    function drawPause(){
        if (pause) {
            ctx.font = '40pt Calibri';
            ctx.fillStyle = '#00FF00';
            var text = 'Paused - press space',
                textWidth = ctx.measureText(text).width,
                x = width / 2 - textWidth / 2,
                y = height / 2;
            ctx.fillText(text, x, y);
        }
    }

    function paint() {
        drawLevel();
        drawSnake();
        drawHud();
    }

    function check_collision(x, y, array, splice) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y) {
                if (splice) array.splice(i, 1);
                return i;
            }
        }
        return -1;
    }
};