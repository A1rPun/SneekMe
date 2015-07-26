SneekMe.sprite = (function () {
    function sprite(options) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.frameIndex = 0;
        this.frameRate = 0;
        this.frameCount = 0;

        Object.defineProperty(this, "mappings", {
            set: function (val) {
                if (!val) return;
                if (val.shift || val.hasOwnProperty('x')) {
                    this._mappings = { standard: val };
                    this.map = 'standard';
                } else {
                    this._mappings = val;
                }
            }
        });
        //Map all options to object
        if (arguments[0])
            for (var prop in arguments[0])
                this[prop] = arguments[0][prop];
    }

    sprite.prototype = {
        draw: function (context, x, y, width, height) {
            var currentFrame, currentMap = this._mappings[this.map];
            if (!currentMap) return;
            currentFrame = currentMap.shift ? currentMap[this.frameIndex] : currentMap;

            context.drawImage(
                /* Image */
                this.image,
                /* Source */
                currentFrame.x,
                currentFrame.y,
                currentFrame.width,
                currentFrame.height,
                /* Destination */
                x || this.x,
                y || this.y,
                width || this.width,
                height || this.height
            );

            this.frameCount++;
            if (this.frameCount > this.frameRate) {
                this.frameCount = 0;
                this.frameIndex++;
                if (this.frameIndex >= currentMap.length) this.frameIndex = 0;
            }
        }
    };
    return sprite;
})();
