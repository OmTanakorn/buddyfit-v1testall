const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // Load any assets needed for the character page
    this.load.image("background", "../static/images/BG.png");
    this.load.spritesheet('eggs', '../static/images/eggs.png',
                                { frameWidth : 255, frameHeight : 255, startFrame : 0, endFrame : 5});
}

function create() {
    // Create the character page
    // Add background image
    this.add.image(300, 400, 'background');

    // Add character image
    this.anims.create({
        key : 'egg_random',
        frames : this.anims.generateFrameNumbers('eggs', { start : 0, end : 5}),
        frameRate : 5, repeat : -1
    });

    this.player = this.add.sprite(300, 400, 'eggs');
    this.player.setScale(2);
    this.player.play('egg_random');
    
    // Add text
    var text = this.add.text(300, 100, 'Random Buddy', {
        fontSize: '42px',
        fontFamily: 'minecraft',
        fill: '#fff'
    });
    text.setOrigin(0.5, 0.5);

    
}

function update() {
    // Update any logic for the character page

}

// สร้างเกม
const game = new Phaser.Game(config);