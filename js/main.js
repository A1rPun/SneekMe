﻿(function () {
    //Default level
    var tiles = {
        none: 0,
        solid: 1,
        breakable: 2,
        food: 50,
        goldfood: 55,
        weapon: 22,
        bullit: 66,
        deadSnake: 88,
        snake: 99
    },
        colors = [{
            getColor: function (i, l) {
                var hue = i >= l ? 0 : (255 / l * i) | 0;
                return 'hsl(' + hue + ',100%,50%)';
            }
        }, {
            getColor: function (i, l) {
                var rgb = i >= l ? 0 : (255 / l * i) | 0;
                return 'rgb(' + rgb + ',' + rgb + ',' + rgb + ')';
            }
        }, {
            head: '#1E1959',
            body: '#373276',
        }, {
            head: '#3B1255',
            body: '#562A72',
        }, {
            head: '#801515',
            body: '#AA3939',
        }, {
            head: '#806815',
            body: '#AA9139',
        }, {
            head: '#196811',
            body: '#378B2E',
        }, {
            head: '#0D4C4C',
            body: '#226666',
        }, {
            head: '#671140',
            body: '#892D5F',
        }, {
            head: '#333333',
            body: '#707070',
        }];

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
    SneekMe.store = {
        getItem: function (key) {
            if (localStorage) {
                var value = localStorage.getItem(key);
                return value;
            }
        },
        get: function (key) {
            if (localStorage) {
                var value = localStorage.getItem(key);
                if (!value) return;
                try {
                    value = JSON.parse(value);
                } catch (e) { }
                return value;
            }
        },
        set: function (key, obj) {
            if (localStorage) {
                if (typeof obj === 'object') obj = JSON.stringify(obj);
                localStorage.setItem(key, obj);
            }
        }
    };

    SneekMe.saveLevel = function (lvl) {
        SneekMe.store.set('level', lvl);
    };

    SneekMe.loadLevel = function (lvl) {
        if (!lvl) return;

        try {
            lvl = JSON.parse(lvl);
        } catch (e) { }
        //is valid level
        if (Array.isArray(lvl) && lvl.length === 56) {
            //TODO: loop every row to check lengths
            return lvl;
        }
    };
    SneekMe.setControls = function () {
        SneekMe.controls = SneekMe.store.get('controls') || SneekMe.getDefaultControls();
    };
    SneekMe.getDefaultControls = function () {
        return {
            A: {
                left: 37,
                up: 38,
                right: 39,
                down: 40,
                shoot: 16,
            },
            B: {
                left: 65,
                up: 87,
                right: 68,
                down: 83,
                shoot: 81,//Q
            },
            C: {
                left: 74,
                up: 73,
                right: 76,
                down: 75,
                shoot: 76,
            },
            D: {
                left: 100,
                up: 104,
                right: 102,
                down: 101,
                shoot: 96,
            }
        };
    };

    var bg = document.getElementById('bg'),
        bgctx = bg.getContext("2d"),
        cw = 10,
        width = 80 * cw,
        height = 56 * cw;

    makeImages({
        bg: 'img/steelpix.jpg',
        //bg: 'img/wood.jpg',
        //bg: 'img/ground.jpg',
        food: 'img/food.png',
        crown: 'img/crown.png',
        weapon: 'img/weapon.png',
        goldfood: 'img/goldfood.png'
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
        
        SneekMe.setControls();
        SneekMe.keys = [];
        SneekMe.images = images;
        document.addEventListener('keydown', function (e) {
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = true;
            SneekMe.keyHandler && SneekMe.keyHandler(e.keyCode);
        });
        document.addEventListener('keyup', function (e) {            
            e = e ? e : window.event;
            SneekMe.keys[e.keyCode] = false;
        });

        bg.width = width;
        bg.height = height;
        bgctx.drawImage(images.bg, 0, 0, width, height);

        var menu = document.getElementById('Menu'),
            callback = function () {
                menu.style.display = '';
                SneekMe.keyHandler = null;
            };
        document.getElementById('setupgame').addEventListener('click', function () {
            SneekMe.metaGame(tiles, colors, cw, callback);
            menu.style.display = 'none';
        }, false);

        document.getElementById('setupcontrols').addEventListener('click', function () {
            SneekMe.setupcontrols(callback);
            menu.style.display = 'none';
        }, false);

        document.getElementById('leveleditor').addEventListener('click', function () {
            SneekMe.editor(tiles, cw, callback);
            menu.style.display = 'none';
        }, false);
    }
}());