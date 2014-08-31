(function () {
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

    var bg = document.getElementById('bg'),
        bgctx = bg.getContext("2d"),
        width = 1024,
        height = 720;

    makeImages({ /*bg: 'img/steel.jpg'*/ bg: 'img/wood.jpg' }, init);
    function init(images) {
        SneekMe.keys = [];
        document.addEventListener('keydown', function (e) {
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = true;
        });
        document.addEventListener('keyup', function (e) {
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = false;
        });

        bg.width = width;
        bg.height = height;
        bgctx.drawImage(images.bg, 0, 0, width, height);

        var level = SneekMe.first,
            lvl = localStorage.getItem('level');

        if (lvl) {
            var lvlh = lvl.split('-');
            for (var i = 0, l = lvlh.length; i < l; i++) {

                var lvlw = lvlh[i].split(';');
                for (var j = 0, k = lvlw.length; j < k; j++) {
                    level[i][j] = +lvlw[j];
                }
            }
        }

        SneekMe.startGame(SneekMe.first, width, height);
        //SneekMe.editor(SneekMe.first, width, height);
    }
}());