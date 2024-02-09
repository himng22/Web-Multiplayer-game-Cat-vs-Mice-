const MouseTrap = function (ctx, x, y, status) {
    var draw = false;
    const sequences = {
        open:  { x: 128, y: 320, width: 64, height: 58, count: 1, timing: 1000, loop: false },
        close:    { x: 192, y: 320, width: 64, height: 58, count: 1, timing: 1000, loop: false }
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[status])
          .setScale(1.3)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("asset/mouse_sprite.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the color of the gem.
    // - `color` - The colour of the gem which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const setStatus = function (status) {
        birthTime = performance.now();
        sprite.setSequence(sequences[status]);
    };

    // This function gets the age (in millisecond) of the gem.
    // - `now` - The current timestamp
    const getAge = function(now) {
        return now - birthTime;
    };

    // This function randomizes the gem colour and position.
    // - `area` - The area that the gem should be located in.
    const randomize = function(area) {
        /* Randomize the position */
        birthTime = performance.now();
        sprite.setSequence(sequences.open);
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    const setXY = function (xloc, yloc) {
        sprite.setXY(xloc, yloc);
    };

    const shouldDraw = function () {
        return draw;  
    };

    const changeDraw = function (shouldDraw) {
        draw = shouldDraw;
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setStatus: setStatus,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw_horizontal,
        getStatus: sprite.getStatus,
        update: sprite.update_horizontal,
        setXY: setXY,
        shouldDraw: shouldDraw,
        changeDraw: changeDraw
    };
};
