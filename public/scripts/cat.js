const Cat = function(ctx, x, y, gameArea) {
    var isStunned = false;
    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { x: 0, y: 48, width: 48, height: 48, count: 1, timing: 50, loop: false },
        idleUp:    { x: 0, y: 144, width: 48, height: 48, count: 1, timing: 50, loop: false },
        idleRight: { x: 0, y: 96, width: 48, height: 48, count: 1, timing: 50, loop: false },
        idleDown:  {x: 0, y: 0, width: 48, height: 48, count: 1, timing: 50, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 0, y: 48, width: 48, height: 48, count: 3, timing: 50, loop: true },
        moveUp:    { x: 0, y: 144, width: 48, height: 48, count: 3, timing: 50, loop: true },
        moveRight: { x: 0, y: 96, width: 48, height: 48, count: 3, timing: 50, loop: true },
        moveDown:  { x: 0, y: 0, width: 48, height: 48, count: 3, timing: 50, loop: true }
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
          .setScale(2)
          .setShadowScale({ x: 0.75, y: 0.20 })
          .useSheet("asset/cat_sprites.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // This is the moving speed (pixels per second) of the player
    let speed = 150;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function (dir) {
        if (dir == 5) {
            dir = direction;
        }
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function() {
        speed = 250;
    };

    // This function slows down the player.
    const slowDown = function() {
        speed = 150;
    };

    const setSpeed = function(newSpeed) {
        speed = newSpeed;
    };

    const getSpeed = function() {
        return speed;
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();

            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            if (gameArea.isPointInBox(x, y))
                sprite.setXY(x, y);
        }

        /* Update the sprite object */
        sprite.update_horizontal(time);
    };

    const setStunned = function (status) {
        isStunned = status;
    };

    const getIsStunned = function () {
        return isStunned;  
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw_horizontal,
        getStatus: sprite.getStatus,
        update: update,
        setSpeed: setSpeed,
        getSpeed: getSpeed,
        setStunned: setStunned,
        getIsStunned: getIsStunned
    };
};
