SneekMe.player = (function () {
    var START_DELAY = 500;
    // constructor
    function player(options) {
        //Default properties that can be overridden
        this.name = 'Player';
        this.relative = false;

        if (arguments[0]) for (var prop in arguments[0]) this[prop] = arguments[0][prop];

        //Default properties that can't be overridden
        this.score = 0;
        this.maxSnake = 0;
        this.maxLife = 0;
        this.respawns = -1;
        this.foodCount = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.shotDistance = 0;
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
            var me = this;
            me.registerStats();            
            me.tails = SneekMe.settings.DEFAULT_SNAKE_LENGTH - 1; // Minus the head
            me.shots = 0;
            me.shoot = false;
            me.life = +new Date();
            me.move = null;

            setTimeout(function () {
                me.move = me.moveStart;
            }, START_DELAY);
            

            if (me.isComputer) {
                me.path = [];
                me.pathCount = 0;
                me.autoCount = 0;
                me.findCount = 0;
                me.autoPilot = false;
                me.direction = -1;//
                me.tx = -1;
                me.ty = -1;
            } else {
                me.direction = -1;
                me.directions = [];
            }
        },
        move: null,
        moveStart: function () {
            if (this.directions.length) {
                var d = this.direction,
                    newDirection = -1;

                SneekMe.playSound('start');
                this.respawns++;

                while (newDirection === -1 && this.directions.length) {
                    var dir = this.directions.shift();

                    if (dir === 3 && d !== 3 && d !== 1) {
                        newDirection = 3;//left
                    } else if (dir === 0 && d !== 0 && d !== 2) {
                        newDirection = 0;//up
                    } else if (dir === 1 && d !== 1 && d !== 3) {
                        newDirection = 1;//right
                    } else if (dir === 2 && d !== 2 && d !== 0) {
                        newDirection = 2;//down
                    }
                }

                if (~newDirection) {
                    this.direction = newDirection;
                    this.move = this.relative ? this.moveRelative : this.moveAbsolute;
                }
            }
        },
        moveAbsolute: function () {
            if (this.directions.length) {
                var d = this.direction,
                    newDirection = -1;

                while (newDirection === -1 && this.directions.length) {
                    var dir = this.directions.shift();

                    if (dir === 3 && d !== 3 && d !== 1) {
                        newDirection = 3;//left
                    } else if (dir === 0 && d !== 0 && d !== 2) {
                        newDirection = 0;//up
                    } else if (dir === 1 && d !== 1 && d !== 3) {
                        newDirection = 1;//right
                    } else if (dir === 2 && d !== 2 && d !== 0) {
                        newDirection = 2;//down
                    }
                }

                if (~newDirection) {
                    this.direction = newDirection;
                }
            }
        },
        moveRelative: function () {
            if (this.directions.length) {
                var d = this.direction,
                    newDirection = -1;

                while (newDirection === -1 && this.directions.length) {
                    var dir = this.directions.shift();

                    if (dir === 3) {
                        newDirection = d-1;//left
                        if (newDirection < 0) newDirection = 3;
                    } else if (dir === 1) {
                        newDirection = d+1;//right
                        if (newDirection > 3) newDirection = 0;
                    }
                }

                if (~newDirection) {
                    this.direction = newDirection;
                }
            }
        }
    };
    return player;
})();