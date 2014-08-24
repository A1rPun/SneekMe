SneekMe.gameState = (function (g) {
    var instance,
        canvas,
        ctx,
        states,
        pause = true,
        update,
        fps = 10,
        now,
        then = Date.now(),
        interval = 1000 / fps,
        delta;

    // constructor
    function gameState(c, s) {
        canvas = c;
        ctx = c.getContext('2d');
        states = s || {};

        if (instance) {
            return instance;
        }
        instance = this;
    }
    gameState.prototype.start = function (state) {
        this.state = state;
        this.loops = 0;
        update = states[this.state];

        if (pause) {
            pause = false;
            queue();
        }
    }
    gameState.prototype.stop = function () {
        pause = true;
    }
    gameState.prototype.isState = function (state) {
        return this.state === state
    }

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