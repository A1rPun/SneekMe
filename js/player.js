SneekMe.player = (function () {
    var DEFAULT_SNAKE_LENGTH = 9;//+1 head
    // constructor
    function player(options) {
        if (arguments[0]) for (var prop in arguments[0]) this[prop] = arguments[0][prop];

        if (!this.name) {
            this.name = 'Player';
        }
        this.score = 0;
        this.maxSnake = 0;
        this.maxLife = 0;
        this.foodCount = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.respawn();
    }
    player.prototype = {
        registerStats: function () {
            if (this.snake) {
                var l = this.snake.length;

                if (l > this.maxSnake)
                    this.maxSnake = l;
            }
            if (this.life) {
                var max = +new Date() - this.life;

                if (max > this.maxLife)
                    this.maxLife = max;
            }
        },
        respawn: function () {
            this.registerStats();            
            this.tails = DEFAULT_SNAKE_LENGTH;
            this.shots = 0;
            this.life = +new Date();

            if (this.isComputer) {
                this.path = [];
                this.count = 0;
                this.autoPilot = false;
                this.direction = 1;//random?
            } else {
                this.direction = -1;
            }
        }
    };
    return player;
})();