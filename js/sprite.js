SneekMe.sprite = (function () {
    function sprite(options) {
		this.x = 0;
		this.y = 0;
		this.frameRate = 0;
		this.frameIndex = 0;
		//Place properties that can be overridden here
        if (arguments[0]) for (var prop in arguments[0]) this[prop] = arguments[0][prop];
		//Place properties that CAN'T be overridden here
    }
    sprite.prototype = {
        
    };
    return sprite;
})();
/*
var sprite = new SneekMe.sprite({
    x: 200,
    y: 100,
    image: imageObj,
    animation: 'standing',
    animations: {//object or array
      standing: [
        // x, y, width, height (6 frames)
        0, 0, 49, 109,
        52, 0, 49, 109,
        105, 0, 49, 109,
        158, 0, 49, 109,
        210, 0, 49, 109,
        262, 0, 49, 109
      ],
      kicking: [
        // x, y, width, height (6 frames)
        0, 109, 45, 98,
        45, 109, 45, 98,
        95, 109, 63, 98,
        156, 109, 70, 98,
        229, 109, 60, 98,
        287, 109, 41, 98
      ]          
    },
    frameRate: 7,
    frameIndex: 0
  });
*/