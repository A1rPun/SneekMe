SneekMe.gameState = (function (g) {
    var instance,
        canvas,
        ctx,
        states,
        pause = true,
        update,
        now,
        then = Date.now(),
        interval,
        delta;

    // constructor
    function gameState(f, c, s) {
        canvas = c;
        ctx = c.getContext('2d');
        states = s || {};
        this.setFps(f || 60);

        if (instance) {
            return instance;
        }
        instance = this;
    }
    gameState.prototype.setFps = function (F) {
        interval = 1000 / F;
    };

    gameState.prototype.start = function (state) {
        this.state = state;
        this.loops = 0;
        update = states[this.state];

        if (pause) {
            pause = false;
            queue();
        }
    };
    gameState.prototype.stop = function () {
        pause = true;
    };
    gameState.prototype.isState = function (state) {
        return this.state === state
    };

    //convert to global
    function loop() {

        if (!pause) {
            now = Date.now();
            delta = now - then;

            if (delta > interval) {
                then = now - (delta % interval);
                clear();
                update && update(delta);
            }
            queue();
            instance.loops++;
        }
    }
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function queue() {
        g.requestAnimationFrame(loop);
    }

    return gameState;
})(window);