class gameEnd extends Phaser.Scene {
    constructor() {
        super("gameEnd");

    }

    preload() {

    }  

    create() {
        // Create the sky background
        
        const bg1 = this.add.image(400, 300, 'nik'); // Adjust position as needed
        const bg2 = this.add.image(400, 300, 'nik2'); // Adjust position as needed
        bg1.setScale(3);
        bg2.setScale(3);
        const logo = this.add.image(400, 160, 'Logo');
        logo.setScale(0.85);

        const score = this.registry.get('score');
        const scoreText = this.add.text(400, 300, 'Score: ' + Math.floor(score || 0), {
            fontSize: '34px',
            fontFamily: 'minecraft, monospace, sans-serif',
            fill: '#ffd75e',
            stroke: '#111827',
            strokeThickness: 5,
            align: 'center'
        });
        scoreText.setOrigin(0.5);

        // Create the "START" button
        const startButton = this.add.image(400, 420, 'start1');
        startButton.setScale(0.95);
        startButton.setOrigin(0.5);
        startButton.setInteractive({ cursor: 'pointer' });

        startButton.on('pointerout', () => {
            startButton.setTexture('start1');
        });
        startButton.on('pointerover', () => {
            startButton.setTexture('start2');
        });
        // Handle start button click event
        startButton.on('pointerdown', () => {
            this.scene.start("gamec"); // Start the "gamec" scene when the button is clicked
        });
    }

    update(time, delta) {

    }
}


