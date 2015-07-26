//
SneekMe.metaGame = function (tiles, cw, callback) {
    var container = document.getElementById('Game'),
        canvas = document.getElementById('picklevel'),
        ctx = canvas.getContext("2d"),
        level = SneekMe.loadLevel(SneekMe.difficulties),
        tilewidth = 2,
        width = 80 * tilewidth,
        height = 56 * tilewidth;

    init();
    function init() {
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
            SneekMe.startGame(getPlayers(), level, tiles, cw, callback);
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
            name: 'Blue',
            head: '#1E1959',
            body: '#373276',
            controls: controls.A,
            //relative: true
            //isComputer: true
        }),
        /* */
        new SneekMe.player({
            id: 1,
            name: 'Purple',
            head: '#3B1255',
            body: '#562A72',
            controls: controls.B,
            //isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 2,
            name: 'Red',
            head: '#801515',
            body: '#AA3939',
            controls: controls.C,
            isComputer: true
        }),
        new SneekMe.player({
            id: 3,
            name: 'Yellow',
            head: '#806815',
            body: '#AA9139',
            controls: controls.D,
            isComputer: true
        }),
        /* /
        new SneekMe.player({
            id: 4,
            name: 'Green',
            head: '#196811',
            body: '#378B2E',
            isComputer: true
        }),
        new SneekMe.player({
            id: 5,
            name: 'Teal',
            head: '#0D4C4C',
            body: '#226666',
            isComputer: true
        }),
        new SneekMe.player({
            id: 6,
            name: 'Pink',
            head: '#671140',
            body: '#892D5F',
            isComputer: true
        }),
        new SneekMe.player({
            id: 7,
            name: 'Grey',
            head: '#333333',
            body: '#707070',
            isComputer: true
        }),
        /* */
        ];
    }
}