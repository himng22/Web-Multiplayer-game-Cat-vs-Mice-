const Cheese = function (ctx, x, y, color) {
    var collectedCheese = 0;

    const collectCheese = function () {
        collectedCheese += 1;
    };
    const getCollectedCheese = function () {
        return collectedCheese;
    };

    const resetCollectedCheese = function () {
        collectedCheese = 0;
    };

    const sequences = {
        yellow:  { x: 256, y: 320, width: 64, height: 60, count: 1, timing: 1000, loop: false },
        green:    { x: 320, y: 320, width: 64, height: 60, count: 2, timing: 100, loop: true }
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[color])
          .setScale(1.5)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("asset/mouse_sprite.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the color of the gem.
    // - `color` - The colour of the gem which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const setColor = function (color) {
        birthTime = performance.now();
        sprite.setSequence(sequences[color]);
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
        const {x, y} = area.randomPoint();
        sprite.setXY(x, y);
    };

    const setXY = function (xloc, yloc) {
        sprite.setXY(xloc, yloc);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setColor: setColor,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw_horizontal,
        getStatus: sprite.getStatus,
        update: sprite.update_horizontal,
        setXY: setXY,
        collectCheese: collectCheese,
        getCollectedCheese: getCollectedCheese,
        resetCollectedCheese: resetCollectedCheese
    };
};
