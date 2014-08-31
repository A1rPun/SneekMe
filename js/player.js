SneekMe.player = (function () {
    var MAX_TAILS = 5,
        MAX_LIFES = 3;
    // constructor
    function player(options) {
        if (arguments[0]) for (var prop in arguments[0]) this[prop] = arguments[0][prop];
    }
    player.prototype.reset = function (life) {
        this.score = MAX_LIFES;
        this.tails = 0;
        this.shots = 0;
    }
    return player;
})();