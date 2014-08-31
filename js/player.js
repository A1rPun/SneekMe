SneekMe.player = (function () {
    var MAX_TAILS = 5,
        MAX_LIFES = 3;
    // constructor
    function player(options) {
        if (arguments[0]) for (var prop in arguments[0]) this[prop] = arguments[0][prop];

        this.score = MAX_LIFES;
        this.maxSnake = 0;
        this.maxLife = 0;
        this.foodCount = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.respawn();
    }
    player.prototype = {
        registerLength: function () {
            if (this.snake) {
                var l = this.snake.length;

                if (l > this.maxSnake)
                    this.maxSnake = l;
            }
        },
        registerLife: function(){
            if (this.life) {
                var max = +new Date() - this.life;

                if (max > this.maxLife)
                    this.maxLife = max;
            }
        },
        respawn: function () {
            this.registerLife();
            this.registerLength();
            this.direction = 1;
            this.snake = [];
            this.tails = 0;
            this.shots = 0;
            this.life = +new Date();

            if (this.isComputer) {
                this.path = [];
                this.count = 0;
            }
        }
    };
    return player;
})();