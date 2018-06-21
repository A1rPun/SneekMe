SneekMe.editor = function (tiles, cw, callback) {
    var level;
    var levelName = '';

    function rand(num) {
        return Math.floor(Math.random() * num);
    }

    var container = document.getElementById('Chooselevel'),
        canvas = document.getElementById('Editor'),
        ctx = canvas.getContext("2d"),
        height = 56 * cw,
        width = 80 * cw,
        mid = cw / 2,
        mouseStart = null,
        mouseIsDown = false,
        right = false,
        modes = {
            dot: 0,
            line: 1,
            box: 2,
            fill: 3
        },
        currentMode = modes.dot,
        currentTile = tiles.solid;

    init();
    function init() {
        var levels = Object.keys(SneekMe.customLevel);
        var levelselect = container.querySelector('[name="customlevel"]');
        container.style.display = '';

        if (levels.length) {
            fillSelect(levelselect, levels);
            document.getElementById('customlevel').style.display = '';
        }

        document.getElementById('newlevel').addEventListener('click', function () {
            level = SneekMe.stringToLevel();
            container.style.display = 'none';
            initCanvas();
        }, false);
        container.querySelector('[name="file"]').addEventListener('change', function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = function (e) {
                level = SneekMe.stringToLevel(e.target.result);
                levelName = file.name.split('.').slice(0, -1).join();
                container.style.display = 'none';
                initCanvas();
            };
            reader.readAsText(file, "UTF-8");
        }, false);
        document.getElementById('editlevel').addEventListener('click', function () {
            var lvl = levelselect.options[levelselect.selectedIndex].value;
            level = SneekMe.stringToLevel(SneekMe.customLevel[lvl]);
            container.style.display = 'none';
            initCanvas();
        }, false);
        document.getElementById('canceleditor').addEventListener('click', destroy, false);

        SneekMe.keyHandler = function (key) {
            if (key === 27) {
                destroy();
            }
        };
    }

    function fillSelect(select, items) {
        var options = '';
        for (var i = 0, l = items.length; i < l; i++) {
            options += '<option>' + items[i] + '</option>';
        }
        select.innerHTML = options;
    }

    function initCanvas() {
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = '';
        document.getElementById('tiles').style.display = '';
        drawLevel();


        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
        canvas.addEventListener('contextmenu', function () { event.preventDefault(); }, false);

        //CRUD
        document.getElementById('new').addEventListener('click', newLevel, false);
        document.getElementById('save').addEventListener('click', saveLevel, false);

        //CUSTOM        
        document.getElementById('share').addEventListener('click', function () {
            var lvl = SneekMe.levelToString(level);
            download((levelName || 'level') + '.sml', lvl);
        }, false);

        //EXIT
        document.getElementById('exit').addEventListener('click', destroy, false);

        //Modes
        document.getElementById('dot').addEventListener('click', function () {
            currentMode = modes.dot;
            setActive(this);
        }, false);
        document.getElementById('line').addEventListener('click', function () {
            currentMode = modes.line;
            setActive(this);
        }, false);
        document.getElementById('box').addEventListener('click', function () {
            currentMode = modes.box;
            setActive(this);
        }, false);
        document.getElementById('fill').addEventListener('click', function () {
            currentMode = modes.fill;
            setActive(this);
        }, false);

        //Tiles
        document.getElementById('none').addEventListener('click', function () {
            currentTile = tiles.none;
            setActive(this);
        }, false);
        document.getElementById('solid').addEventListener('click', function () {
            currentTile = tiles.solid;
            setActive(this);
        }, false);
        document.getElementById('break').addEventListener('click', function () {
            currentTile = tiles.breakable;
            setActive(this);
        }, false);
    }

    function destroy() {
        //remove all listeners
        var conClone = container.cloneNode(true);
        var el = document.getElementById('tiles');
        var elClone = el.cloneNode(true);

        el.parentNode.replaceChild(elClone, el);
        container.parentNode.replaceChild(conClone, container);

        conClone.style.display = 'none';
        elClone.style.display = 'none';
        container.style.display = 'none';
        canvas.style.display = 'none';

        callback && callback();
    }

    function bresenham(x1, y1, x2, y2, drawpixel) {

        var dy = y2 - y1;
        var dx = x2 - x1;
        var stepx, stepy;

        if (dy < 0) { dy = -dy; stepy = -1; } else { stepy = 1; }
        if (dx < 0) { dx = -dx; stepx = -1; } else { stepx = 1; }
        dy <<= 1;        // dy is now 2*dy
        dx <<= 1;        // dx is now 2*dx

        drawpixel(x1, y1);
        if (dx > dy) {
            var fraction = dy - (dx >> 1);  // same as 2*dy - dx
            while (x1 != x2) {
                if (fraction >= 0) {
                    y1 += stepy;
                    fraction -= dx;          // same as fraction -= 2*dx
                }
                x1 += stepx;
                fraction += dy;              // same as fraction -= 2*dy
                drawpixel(x1, y1);
            }
        } else {
            var fraction = dx - (dy >> 1);
            while (y1 != y2) {
                if (fraction >= 0) {
                    x1 += stepx;
                    fraction -= dy;
                }
                y1 += stepy;
                fraction += dx;
                drawpixel(x1, y1);
            }
        }
    }

    function floodFill(x, y, oldVal, newVal) {
        var mapWidth = level[0].length,
            mapHeight = level.length;

        if (oldVal == null) {
            oldVal = level[y][x];
        }

        if (level[y][x] !== oldVal) {
            return;
        }

        level[y][x] = newVal;

        if (x > 0) { // left
            floodFill(x - 1, y, oldVal, newVal);
        }
        if (y > 0) { // up
            floodFill(x, y - 1, oldVal, newVal);
        }
        if (x < mapWidth - 1) { // right
            floodFill(x + 1, y, oldVal, newVal);
        }
        if (y < mapHeight - 1) { // down
            floodFill(x, y + 1, oldVal, newVal);
        }
    }

    function setActive(tile) {
        var elements = tile.parentElement.children;
        for (var i = elements.length; i--;) {
            elements[i].className = '';
        }
        tile.className = 'tile-active';
    }
    function newLevel() {
        levelName = '';
        level = SneekMe.stringToLevel();
        drawLevel();
    }

    function saveLevel() {
        var lvlname = prompt('Enter level name', levelName) || 'default';
        var lvl = SneekMe.levelToString(level);
        SneekMe.customLevel[lvlname] = lvl;
        SneekMe.store.set('level', SneekMe.customLevel);
    }

    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function getCurrentTile() {
        return right ? tiles.none : currentTile;
    }

    function mouseDown(event) {
        var pos = getMousePos(event);
        mouseStart = {
            x: Math.floor(pos.x / cw),
            y: Math.floor(pos.y / cw)
        }
        mouseIsDown = true;
        if (event.which === 3) { right = true; }
        mouseMove(event);
        event.preventDefault();
    }
    function mouseUp(event) {

        if (mouseStart) {
            var pos = getMousePos(event),
                x = Math.floor(pos.x / cw),
                y = Math.floor(pos.y / cw),
                tile = getCurrentTile();

            if (currentMode === modes.line) {
                bresenham(mouseStart.x, mouseStart.y, x, y, setTile);
                drawLevel();
            } else if (currentMode === modes.box) {
                bresenham(mouseStart.x, mouseStart.y, mouseStart.x, y, setTile);
                bresenham(mouseStart.x, mouseStart.y, x, mouseStart.y, setTile);
                bresenham(x, mouseStart.y, x, y, setTile);
                bresenham(mouseStart.x, y, x, y, setTile);
                drawLevel();
            } else if (currentMode === modes.fill) {
                floodFill(x, y, null, tile);
                drawLevel();
            }
        }
        mouseIsDown = false;
        right = false;
        event.preventDefault();
    }

    function mouseMove(event) {
        var pos = getMousePos(event),
            x = Math.floor(pos.x / cw),
            y = Math.floor(pos.y / cw);

        drawLevel();

        if (mouseIsDown) {

            if (currentMode === modes.dot) {
                level[y][x] = getCurrentTile();
            } else if (currentMode === modes.line) {
                ctx.strokeStyle = '#00FF00';
                bresenham(mouseStart.x, mouseStart.y, x, y, function (x, y) {
                    ctx.strokeRect(x * cw, y * cw, cw, cw);
                });
            } else if (currentMode === modes.box) {
                ctx.strokeStyle = '#00FF00';
                var drawrect = function (x, y) {
                    ctx.strokeRect(x * cw, y * cw, cw, cw);
                }
                bresenham(mouseStart.x, mouseStart.y, mouseStart.x, y, drawrect);
                bresenham(mouseStart.x, mouseStart.y, x, mouseStart.y, drawrect);
                bresenham(x, mouseStart.y, x, y, drawrect);
                bresenham(mouseStart.x, y, x, y, drawrect);
            }
        }

        ctx.strokeStyle = '#0000FF';
        ctx.strokeRect(x * cw, y * cw, cw, cw);

        event.preventDefault();
    }

    function setTile(x, y) {
        if (level[y] !== null && level[y][x] !== null)
            level[y][x] = getCurrentTile();
    }

    function drawLevel() {
        ctx.clearRect(0, 0, width, height);

        var h = level.length,
            w = level[0].length;
        //Draw level
        for (var i = h; i--;) {
            for (var j = w; j--;) {
                switch (level[i][j]) {
                    case tiles.breakable:
                        ctx.fillStyle = '#999999';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    case tiles.solid:
                        ctx.fillStyle = 'white';
                        ctx.fillRect(j * cw, i * cw, cw, cw);
                        break;
                    default:
                }
            }
        }
        //Draw grid
        ctx.strokeStyle = "#CCCCCC";
        for (var i = h + 1; i--;) {
            ctx.beginPath();
            ctx.moveTo(0, cw * i);
            ctx.lineTo(width, cw * i);
            ctx.stroke();
        }
        for (var j = w + 1; j--;) {
            ctx.beginPath();
            ctx.moveTo(cw * j, 0);
            ctx.lineTo(cw * j, height);
            ctx.stroke();
        }
        ctx.lineWidth = 2;

        var midy = h / 2;
        ctx.beginPath();
        ctx.moveTo(0, cw * midy);
        ctx.lineTo(width, cw * midy);
        ctx.stroke();

        var midx = w / 2;
        ctx.beginPath();
        ctx.moveTo(cw * midx, 0);
        ctx.lineTo(cw * midx, height);
        ctx.stroke();

        ctx.lineWidth = 1;
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
};
