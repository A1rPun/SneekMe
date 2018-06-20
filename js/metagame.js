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
        var lvl = SneekMe.loadLevel(SneekMe.store.getItem('level') || SneekMe.blank);
        if (lvl)
            level = lvl;

        if (SneekMe.players)
            loadPlayers();

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
            savePlayers();
            SneekMe.startGame(getPlayers(), level, tiles, colors, cw, callback);
        }, false);

        var controlButtons = container.querySelectorAll('.btn-controls');
        var controlListener = function () {
            this.innerHTML = this.innerHTML === 'Key' ? 'AI' : 'Key';
        };
        for (var i = controlButtons.length; i--;)
            controlButtons[i].addEventListener('click', controlListener);
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
        var players = [];
        var controls = SneekMe.controls;
        var playerSettings = container.querySelectorAll('.player');
        for (var i = 0, l = playerSettings.length; i < l; i++) {
            var settings = playerSettings[i];
            if (!settings.querySelector('.cbx-active').checked)
                continue;

            var player = new SneekMe.player({
                id: i,
                color: i,
                name: settings.querySelector('.txt-name').value,
                controls: [controls.A, controls.B, controls.C, controls.D][i % 4],
                //relative: true
                isComputer: settings.querySelector('.btn-controls').innerHTML === 'AI',
            });
            players.push(player);
        }
        return players;
    }

    function savePlayers(players) {
        var players = [];
        var playerSettings = container.querySelectorAll('.player');
        for (var i = 0, l = playerSettings.length; i < l; i++) {
            var settings = playerSettings[i];
            players.push({
                active: settings.querySelector('.cbx-active').checked,
                name: settings.querySelector('.txt-name').value,
                isComputer: settings.querySelector('.btn-controls').innerHTML === 'AI',
            });
        }
        SneekMe.store.set('players', players);
        SneekMe.players = players;
    }

    function loadPlayers() {
        var players = SneekMe.players;
        var playerSettings = container.querySelectorAll('.player');
        for (var i = 0, l = playerSettings.length; i < l; i++) {
            var settings = playerSettings[i];
            settings.querySelector('.cbx-active').checked = players[i].active;
            settings.querySelector('.txt-name').value = players[i].name;
            settings.querySelector('.btn-controls').innerHTML = players[i].isComputer ? 'AI' : 'Key';
        }
    }
}
