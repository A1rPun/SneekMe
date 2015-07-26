SneekMe.startGame = function (players, level, tiles, cw, callback) {
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

    var acceptable = [tiles.none, tiles.food, tiles.goldfood, tiles.weapon],
        pathFinder = new SneekMe.astar();
    pathFinder.setAcceptableTiles(acceptable);
    pathFinder.setGrid(level);

    var canvas = document.getElementById('SneekMe'),
        ctx = canvas.getContext("2d"),
        hud = document.getElementById('hud'),
        hudctx = hud.getContext("2d"),
        gameState = new SneekMe.gameState({
            fps: 10,//orignal = 12
            canvas: canvas,
            context: ctx,
            states: { game: update }
        }),
        height = level.length * cw,
        width = level[0].length * cw,
        mid = cw / 2,
        AUTOPILOTCOUNT = 20,
        //Number of point to win
        MAX_SCORE = 10,
        //Number of meal
        MAX_FOODS = 10,
        //Number of weapons
        MAX_WEAPONS = 10,
        MAX_SHOTS = 10,
        //Increase snake length
        ADD_TAILS = 5,
        ADD_GOLD_TAILS = 25,
        //Add shots
        ADD_SHOTS = 1,
        //Point got when snake eats food
        ADD_FOOD_SCORE = 1,
        //Point got when snake eats goldfood
        ADD_GOLD_FOOD_SCORE = 3,
        //Point got when shot a snake
        ADD_HIT_SCORE = 2,
        //Point got when a snake crashes on you
        ADD_BUMP_SCORE = 3,        
        //Point lost when crashed
        RESPAWN_PENALTY = 1,//3,
        //Point lost when hit
        HIT_PENALTY = 1,
        //PICKUP_INTERVAL
        PICKUP_INTERVAL = 2000,
        DEADSNAKE_INTERVAL = 8000,
        GOLD_CHANCE = 2,//of 100
        pickip_loop,
        foods,
        weapons,
        bullits,
        pause = false,
        bounds = {
            top: 0,
            right: width / cw - 1,
            bottom: height / cw - 1,
            left: 0
        };

    init();
    function init() {
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = '';
        hud.width = 800; //width
        hud.height = 32;
        hud.style.display = '';
        foods = [];
        weapons = [];
        bullits = [];

        for (var i = players.length; i--;) {
            create_snake(players[i]);
            create_food();
        }

        paint();
        drawHud();

        SneekMe.keyHandler = function (key) {
            if (key === 32) {
                if (pause) {
                    pause = false;
                    gameState.start('game');                    
                } else {
                    pause = true;
                    gameState.stop();
                    drawPause();
                }
            } else if (key === 27) {
                destroy(true);
            }
            
            for (var i = players.length; i--;) {
                var player = players[i];
                if (player.isComputer || !player.move) continue;

                if (key === player.controls.left) {
                    player.directions.push(3);//left
                } else if (key === player.controls.up) {
                    player.directions.push(0);//up
                } else if (key === player.controls.right) {
                    player.directions.push(1);//right
                } else if (key === player.controls.down) {
                    player.directions.push(2);//down
                } else if (key === player.controls.shoot && player.shots) {
                    player.shoot = true;
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
        }, PICKUP_INTERVAL);
        /* */

        if (pause) {
            drawPause();
        } else {
            gameState.start('game');
        }
    }

    function destroy(skip) {
        function toMenu() {
            canvas.style.display = 'none';
            hud.style.display = 'none';
            callback && callback();
        }
        clearInterval(pickip_loop);
        gameState.stop();

        if (skip) {
            toMenu();
        } else {
            SneekMe.keyHandler = null;

            setTimeout(function () {
                SneekMe.keyHandler = toMenu;
            }, 1000);
        }        
    }

    function gameOver(winner) {
        destroy();

        var maxSnake = { value: 0, index: -1 },
            maxLife = { value: 0, index: -1 },
            foodCount = { value: 0, index: -1 },
            shotsHit = { value: 0, index: -1, fired: 0 },
            respawns = { value: Infinity, index: -1 };

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

            if (player.shotsHit > shotsHit.value) {
                shotsHit.index = i;
                shotsHit.value = player.shotsHit;
                shotsHit.fired = player.shotsFired;
            }

            if (player.respawns < respawns.value && player.respawns > -1) {
                respawns.index = i;
                respawns.value = player.respawns;
            }
        }

        ctx.font = '24pt Calibri';
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';

        var x = 40,
            y = 40,
            drawStat = function (stat) {
                ctx.fillText(stat, x, y);
                y += 60;
            };

        drawStat(players[winner].name + ' is the winner!');
        ~maxSnake.index && drawStat('Longest snake: ' + maxSnake.value + ' ' + players[maxSnake.index].name);
        ~maxLife.index && drawStat('Longest life: ' + ~~(maxLife.value / 1000) + 's ' + players[maxLife.index].name);
        ~foodCount.index && drawStat('Most foods: ' + foodCount.value + ' ' + players[foodCount.index].name);
        ~shotsHit.index && drawStat('Bullits hit: ' + shotsHit.value + ' of ' + shotsHit.fired +
                        ' (' + (shotsHit.value / shotsHit.fired * 100).toFixed(2) + '%) ' + players[shotsHit.index].name);
        ~respawns.index && drawStat('Least respawns: ' + respawns.value + ' ' + players[respawns.index].name);
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
        player.snake = [];       
        player.snake.push({
            x: pos.x,
            y: pos.y
        });
        level[pos.y][pos.x] = tiles.snake;
    }

    function create_food() {
        var pos = findEmptyPos();
        foods.push(pos);

        if (rand(100) < GOLD_CHANCE) {
            level[pos.y][pos.x] = tiles.goldfood;
        } else {
            level[pos.y][pos.x] = tiles.food;
        }
    }

    function create_weapon() {
        var pos = findEmptyPos();
        weapons.push(pos);
        level[pos.y][pos.x] = tiles.weapon;
    }

    function findDirection(ox, oy, nx, ny) {
        return ox === nx ? (oy < ny ? 2 : 0) : (ox < nx ? 1 : 3);
    }

    function calculateDirection(ox, oy, d) {
        if (d == 0) oy--;
        else if (d == 1) ox++;
        else if (d == 2) oy++;
        else if (d == 3) ox--;
        return [ox, oy];
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
            if (path === null || path.length < 2) {
                //log('OH NOES WHATTODO');
                player.autoPilot = true;
                player.path = [];
                player.count = 0;
                autoPilot();
            } else {
                player.autoPilot = false;
                player.path = path;                
                player.count = 1;
                var newDirection = player.path[1];//player.count
                player.direction = findDirection(ox, oy, newDirection[0], newDirection[1]);
            }
        }

        function autoPilot() {
            var dir = calculateDirection(ox, oy, d);

            if (!pathFinder.canWalkHere(dir[0], dir[1])) {
                //log('DAMN IM STUCK');
                var rescue = pathFinder.Neighbours(ox, oy);

                if (rescue.length) {
                    rescue = rescue[0];//maybe random?
                    
                    var newDirection = findDirection(ox, oy, rescue.x, rescue.y);
                    player.direction = newDirection;
                    //log('gonna go this way ' + d + ' ' + newDirection);
                } else {
                    //log('CRASH');
                }
            }
        }

        if (player.autoPilot && player.count < AUTOPILOTCOUNT) { 
            autoPilot();
        } else {

            if (!(player.tx > -1) || !(level[player.ty][player.tx] === tiles.food || level[player.ty][player.tx] === tiles.goldfood)) {
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

                if (acceptable.indexOf(level[ny][nx]) === -1) {
                    findPath();
                } else {
                    player.direction = findDirection(ox, oy, nx, ny);
                }
            }
        }

        if (player.shots && rand(100) > 95) {
            player.shoot = true;
        }
    }

    function respawn(player) {
        SneekMe.playSound('dead');
        createDeadSnake(player.snake.slice(0));
        player.score -= RESPAWN_PENALTY;
        player.respawn();
        create_snake(player);
        drawHud();
    }

    function shoot(player) {
        var x = player.snake[0].x,
            y = player.snake[0].y,
            one = { x: x, y: y, direction: 1, owner: player.id, distance: 0 },
            two = { x: x, y: y, direction: 3, owner: player.id, distance: 0 };
        player.shots -= 1;

        if (player.direction === 1 || player.direction === 3) {
            one.direction = 0;
            two.direction = 2;
        }
        /*
        var od = calculateDirection(x, y, one.direction),
            td = calculateDirection(x, y, two.direction);

        one.x = od[0];
        one.y = od[1];
        two.x = td[0];
        two.y = td[1];
        */        
        player.shotsFired += 2;
        player.shoot = false;
        SneekMe.playSound('shoot');        
        drawHud();
        bullits.unshift(one, two);
        plotBullit(two, 1);
        plotBullit(one, 0);
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
        }, DEADSNAKE_INTERVAL);
    }

    function plotBullits() {
        for (var i = bullits.length; i--;) {
            plotBullit(bullits[i], i);
        }
    }

    function plotBullit(bullit, i) {        
        if (bullit.distance)
            level[bullit.y][bullit.x] = tiles.none;

        var dir = calculateDirection(bullit.x, bullit.y, bullit.direction);
        bullit.x = dir[0];
        bullit.y = dir[1];

        if (bullit.x < bounds.left ||
            bullit.x > bounds.right ||
            bullit.y < bounds.top ||
            bullit.y > bounds.bottom) {
            bullits.splice(i, 1);
            return;
        }

        var tile = level[bullit.y][bullit.x];
        if (acceptable.indexOf(tile) === -1) {

            if (tile === tiles.snake) {
                bullitCollision(bullit);
            } else if (tile === tiles.breakable || tile === tiles.deadSnake) {
                players[bullit.owner].shotsHit++;
                level[bullit.y][bullit.x] = tiles.none;
            }
            bullits.splice(i, 1);
            return;
        }
        level[bullit.y][bullit.x] = tiles.bullit;
        bullit.distance++;
    }

    function bullitCollision(bullit){
        for (var j = players.length; j--;) {
            var player = players[j],
                index = check_collision(bullit.x, bullit.y, player.snake);

            if (~index && ~player.direction) {

                if (players[bullit.owner].id !== player.id) {
                    players[bullit.owner].shotsHit++;
                    players[bullit.owner].score += ADD_HIT_SCORE;
                }

                //index hit the head or 2nd index
                if (index < 2) {
                    respawn(player);
                } else {
                    SneekMe.playSound('hit');
                    var snake = player.snake;
                    player.snake = snake.slice(0, index);
                    createDeadSnake(snake.slice(index, snake.length));//leaves a 
                    player.score -= HIT_PENALTY;//hit on head also hit penalty? if yes move this above IF statement
                    drawHud();
                }
                break;
            }
        }
    }

    function update() {
        plotBullits();
        for (var i = players.length; i--;) {
            var player = players[i];

            if (!player.snake.length) continue;
            //Move computer & human to set correct direction
            if (player.isComputer) {
                moveComputer(player);
            } else {
                player.move && player.move();
            }

            var d = player.direction,
                nx = player.snake[0].x,
                ny = player.snake[0].y;
//                                                                 (\_
            if (d === -1) continue;//If not moving you can't win v(^_^)v
//                                                               |_|  ||
            var dir = calculateDirection(nx, ny, d);
            nx = dir[0];
            ny = dir[1];

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

                if (level[ny][nx] === tiles.snake) {
                    for (var j = players.length; j--;) {
                        var player2 = players[j],
                            index = check_collision(nx, ny, player2.snake);

                        if (~index) {
                            player2.score += ADD_BUMP_SCORE;
                            break;
                        }
                    }
                }
                respawn(player);
                continue;
            }

            var tile = level[ny][nx];
            //Create a new head instead of moving the tail
            if (tile === tiles.food || tile === tiles.goldfood) {
                var gold = tile === tiles.goldfood;
                SneekMe.playSound('food');
                check_collision(nx, ny, foods, true);                
                player.foodCount++;
                player.tails += gold ? ADD_GOLD_TAILS : ADD_TAILS;
                player.score += gold ? ADD_GOLD_FOOD_SCORE : ADD_FOOD_SCORE;

                //Create new food
                if (foods.length < players.length) {
                    create_food();
                }

                drawHud();
            } else if (tile === tiles.weapon) {
                SneekMe.playSound('weapon');
                check_collision(nx, ny, weapons, true);
                player.shots += ADD_SHOTS;
                if (player.shots > MAX_SHOTS) player.shots = MAX_SHOTS;
                drawHud();
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
            
            if(player.shoot) shoot(player);

            player.registerStats();

            if (player.score >= MAX_SCORE) {
                gameOver(player.id);
                return;
            }
        }
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
                        //ctx.fillStyle = '#00FF00';
                        ctx.drawImage(SneekMe.images.food, j * cw, i * cw, cw, cw);
                        break;
                    case tiles.goldfood:
                        ctx.drawImage(SneekMe.images.goldfood, j * cw, i * cw, cw, cw);
                        break;
                    case tiles.weapon:
                        //ctx.fillStyle = '#0000FF';
                        ctx.drawImage(SneekMe.images.weapon, j * cw, i * cw, cw, cw);
                        break;
                    //case tiles.bullit:
                    //    ctx.fillStyle = '#FF0000';
                    //    ctx.fillRect(j * cw, i * cw, cw, cw);
                    //    break;
                    case tiles.deadSnake:
                        ctx.fillStyle = '#666666';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    default:
                }
            }
        }
    }

    function drawTriangle(x, y, direction, stroke) {
        ctx.beginPath();

        if (direction === 0) {
            //up
            ctx.moveTo(x + mid, y);
            ctx.lineTo(x + cw, y + cw);
            ctx.lineTo(x, y + cw);
            ctx.lineTo(x + mid, y);
        } else if (direction === 1) {
            //right
            ctx.moveTo(x, y);
            ctx.lineTo(x + cw, y + mid);
            ctx.lineTo(x, y + cw);
            ctx.lineTo(x, y);
        } else if (direction === 2) {
            //down
            ctx.moveTo(x, y);
            ctx.lineTo(x + cw, y);
            ctx.lineTo(x + mid, y + cw);
            ctx.lineTo(x, y);
        } else {
            //left
            ctx.moveTo(x + cw, y);
            ctx.lineTo(x + cw, y + cw);
            ctx.lineTo(x, y + mid);
            ctx.lineTo(x + cw, y);
        }
        ctx.fill();

        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.stroke();
        }
    }

    function drawSnake() {        
        ctx.lineWidth = 2;
        var crown = { value: 0, index: -1 };

        //for (var i = 0, len = players.length; i< len; i++) {
        for (var i = players.length; i--;){
            var player = players[i];
            if (!player.snake.length) continue;

            var x = player.snake[0].x * cw,
                y = player.snake[0].y * cw,
                lastIndex = player.snake.length - 1;

            if (player.score > crown.value) {
                crown.index = i;
                crown.value = player.score;
            }

            //paint head of snake
            ctx.fillStyle = player.head;
            ctx.fillRect(x, y, cw, cw);

            if (player.direction === -1) {
                ctx.strokeStyle = player.head;
                ctx.beginPath();
                ctx.arc(x + mid, y + mid, cw, 0, 2 * Math.PI, false);
                ctx.stroke();
            }

            if (lastIndex > 0) {                    
                //paint body of snake
                ctx.fillStyle = player.body;
                for (var j = 1; j < lastIndex; j++) {
                    ctx.fillRect(player.snake[j].x * cw, player.snake[j].y * cw, cw, cw);
                }

                //Draw last body in a triangle shape
                var l = player.snake[lastIndex],
                    ld = findDirection(player.snake[lastIndex - 1].x, player.snake[lastIndex - 1].y, l.x, l.y),
                    lx = l.x * cw,
                    ly = l.y * cw;

                drawTriangle(lx, ly, ld);
            }
        }

        if (~crown.index) {
            var p = players[crown.index],
                crownDirection = p.direction === 1 || p.direction === 3 ? 0 : 1,
                crownPos = calculateDirection(p.snake[0].x, p.snake[0].y, crownDirection);

            if (crownDirection) {
                ctx.save();
                ctx.translate(crownPos[0] * cw + mid, crownPos[1] * cw + mid);
                ctx.rotate(90 * Math.PI / 180);
                ctx.drawImage(SneekMe.images.crown, -mid, -mid);
                ctx.restore();
            } else {                
                ctx.drawImage(SneekMe.images.crown, crownPos[0] * cw, crownPos[1] * cw);
            }
        }
    }

    function drawBullits() {
        for (var i = bullits.length; i--;) {
            var bullit = bullits[i];
            ctx.fillStyle = players[bullit.owner].body;
            drawTriangle(bullit.x * cw, bullit.y * cw, bullit.direction, players[bullit.owner].head);
        }
    }

    function drawHud() {
        hudctx.font = '10pt Calibri';
        hudctx.fillStyle = '#000000';
        hudctx.fillRect(0, 0, hud.width, hud.height);        
        
        var maxWidth = 160;//canvas.width / 4;
        for (var i = players.length; i--;) {
            var player = players[i],
                x = 5 + maxWidth * (i % 4),
                y = i < 4 ? 6 : 18,
                offset = 8;
            //Draw snake
            hudctx.fillStyle = player.head;
            hudctx.fillRect(x, y, cw, cw);

            hudctx.fillStyle = player.body;
            hudctx.fillRect(x + cw, y, cw, cw);
            hudctx.fillRect(x + cw * 2, y, cw, cw);

            var tailx = x + cw * 3;
            hudctx.beginPath();
            hudctx.moveTo(tailx, y);
            hudctx.lineTo(tailx + cw, y + mid);
            hudctx.lineTo(tailx, y + cw);
            hudctx.fill();

            //Display name
            hudctx.fillStyle = '#FFFFFF';
            hudctx.fillText(player.name + ': ' + player.score, x + 40, y + 8);

            //Draw bullits
            hudctx.fillStyle = '#0000FF';
            for (var j = 0; j < player.shots; j++) {
                hudctx.fillRect(x + j * (cw+1), y + cw + 2, cw, 2);
            }            
        }
    }

    function drawDebug() {
        var h = level.length,
            w = level[0].length;
        ctx.font = '6pt Calibri';
        ctx.fillStyle = '#00FF00';
        for (var i = h; i--;) {
            for (var j = w; j--;) {
                ctx.fillText(level[i][j], j * cw + 5, i * cw + 10);
            }
        }

        for (var i = players.length; i--;) {
            var p = players[i].path;
            if (p && p.length) {
                var count = players[i].count;
                if (!p[count]) continue;
                ctx.strokeStyle = players[i].body;
                ctx.beginPath();
                ctx.moveTo(p[count][0] * cw + mid, p[count][1] * cw + mid);
                for (var j = count, l = p.length; j < l; j++) {
                    ctx.lineTo(p[j][0] * cw + mid, p[j][1] * cw + mid);
                }
                ctx.stroke();
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
        drawBullits();

        if (SneekMe.keys[8]) drawDebug();
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