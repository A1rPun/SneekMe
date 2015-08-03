//
SneekMe.metaGame = function (tiles, colors, cw, callback) {
    var container = document.getElementById('Game'),
        canvas = document.getElementById('picklevel'),
        ctx = canvas.getContext("2d"),
        level = SneekMe.loadLevel(SneekMe.blank),
        tilewidth = 2,
        width = 80 * tilewidth,
        height = 56 * tilewidth;

    init();
    function init() {
        var lvl = SneekMe.loadLevel(SneekMe.store.getItem('level'));
        if (lvl) {
            level = lvl;
        }

        container.style.display = '';
        canvas.width = width;
        canvas.height = height;
        drawLevel();

        document.getElementById('cancelgame').addEventListener('click', function () {
            destroy();
            callback && callback();
        }, false);
        document.getElementById('playgame').addEventListener('click', function () {
            destroy();
            SneekMe.startGame(getPlayers(), level, tiles, colors, cw, callback);
        }, false);
    }

    function destroy() {
        //remove all listeners
        var elClone = container.cloneNode(true);
        container.parentNode.replaceChild(elClone, container);
        elClone.style.display = 'none';
    }

    function drawLevel() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);

        for (var i = height / tilewidth; i--;) {
            for (var j = width / tilewidth; j--;) {
                switch (level[i][j]) {
                    case tiles.breakable:
                        ctx.fillStyle = 'red';
                        ctx.fillRect(j * tilewidth, i * tilewidth, tilewidth, tilewidth);
                        break;
                    case tiles.solid:
                        ctx.fillStyle = 'black';
                        ctx.fillRect(j * tilewidth, i * tilewidth, tilewidth, tilewidth);
                        break;
                    default:
                }
            }
        }
        //ctx.
    }

    function getPlayers() {
        var controls = SneekMe.controls;
        return [
        /* */
        new SneekMe.player({
            id: 0,
            name: 'Player 1',
            color: 0,
            controls: controls.A,
            //relative: true
            isComputer: true
        }),
        /* */
        new SneekMe.player({
            id: 1,
            name: 'Player 2',
            color: 1,
            controls: controls.B,
            isComputer: true
        }),
        /* */
        new SneekMe.player({
            id: 2,
            name: 'Player 3',
            color: 2,
            controls: controls.C,
            isComputer: true
        }),
        new SneekMe.player({
            id: 3,
            name: 'Player 4',
            color: 3,
            controls: controls.D,
            isComputer: true
        }),
        /* */
        new SneekMe.player({
            id: 4,
            name: 'Player 5',
            color: 4,
            isComputer: true
        }),
        new SneekMe.player({
            id: 5,
            name: 'Player 6',
            color: 5,
            isComputer: true
        }),
        new SneekMe.player({
            id: 6,
            name: 'Player 7',
            color: 6,
            isComputer: true
        }),
        new SneekMe.player({
            id: 7,
            name: 'Player 8',
            color: 7,
            isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 8,
            name: 'Player 9',
            color: 8,
            isComputer: true
        }),
        new SneekMe.player({
            id: 9,
            name: 'Player 10',
            color: 9,
            isComputer: true
        })
        /* */
        ];
    }
}