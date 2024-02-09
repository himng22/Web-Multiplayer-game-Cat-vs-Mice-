const Heart = function(ctx,x1,y1) {

    const sequence = {x: 448, y: 320, width: 64, height: 64, count: 1, timing: 200, loop: false};
    const sheet = new Image();
    sheet.src ="asset/mouse_sprite.png";
    
    let index = 0;
    let lastUpdate = 0;
    const draw = function() {
        ctx.save();

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage (
            sheet,
            sequence.x + index*sequence.width,
            sequence.y,
            sequence.width,
            sequence.height,
            x1, 
            y1,
            sequence.width*3,
            sequence.height*3
        );

        ctx.restore();
        return this;
    };

    return {
        draw: draw,
    };
}