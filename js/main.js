(function () {
    function makeImages(images, callback) {
        var result = {},
            loads = 0,
            keys = Object.keys(images),
            num = keys.length,
            cb = function () {
                if (++loads >= num) callback(result);
            };

        for (var i = num; i--;) {
            var key = keys[i],
                img = new Image();
            img.onload = cb;
            img.onerror = cb;
            img.src = images[key];
            result[key] = img;
        }
    }
    function makeAudio(sounds, callback) {
        var result = {},
            loads = 0,
            keys = Object.keys(sounds),
            num = keys.length,
            cb = function () {
                if (++loads >= num) callback(result);
            };

        for (var i = num; i--;) {
            var key = keys[i],
                snd = new Audio();
            snd.oncanplaythrough = cb;
            snd.onerror = cb;
            snd.src = sounds[key];
            result[key] = snd;
        }
    }
    SneekMe.playSound = function (snd, loop) {
        if (SneekMe.sound && SneekMe.sound[snd]) {
            var sound = SneekMe.sound[snd];

            try {
                sound.currentTime = 0;
            } catch (e) {

            }
            

            if (loop) {
                if (typeof sound.loop === 'boolean') {
                    sound.loop = true;
                } else {
                    sound.addEventListener('ended', function () {
                        sound.currentTime = 0;
                        sound.play();
                    }, false);
                }
            }
            sound.play();
        }
    };

    var bg = document.getElementById('bg'),
        bgctx = bg.getContext("2d"),
        cw = 8,
        width = 80 * cw,
        height = 56 * cw;

    makeImages({
        /*bg: 'img/steel.jpg'*/
        bg: 'img/wood.jpg'
    }, init);

    makeAudio({
        bg: 'sound/JINGLE.mp3',
        start: 'sound/0.wav',
        food: 'sound/1.wav',
        weapon: 'sound/2.wav',
        shoot: 'sound/3.wav',
        hit: 'sound/4.wav',
        dead: 'sound/5.wav'
    }, function (sounds) {
        SneekMe.sound = sounds;
        //SneekMe.playSound('bg', true);
    });

    function init(images) {
        SneekMe.keys = [];
        document.addEventListener('keydown', function (e) {
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = true;
        });
        document.addEventListener('keyup', function (e) {
            SneekMe.keyHandler && SneekMe.keyHandler();
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = false;
        });

        bg.width = width;
        bg.height = height;
        bgctx.drawImage(images.bg, 0, 0, width, height);

        var level = SneekMe.debug,
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

        SneekMe.startGame(level, cw);
        //SneekMe.editor(level, cw);
    }
}());