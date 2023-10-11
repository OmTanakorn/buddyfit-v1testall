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
        this.add.image(400,200,'Logo');

        // Create the "START" button
        const startButton = this.add.image(400, 400, 'start1')
        startButton.setScale(1);

        startButton.setOrigin(0.5);
        startButton.setInteractive();

        startButton.on('pointerout', () => {
            startButton.setTexture('start1'); // เปลี่ยนภาพเป็น 'start1' เมื่อเมาส์ออกนอกปุ่ม
        });
        startButton.on('pointerover',()=>{
            startButton.setTexture('start2');
        })
        // Handle start button click event
        startButton.on('pointerdown', () => {

            this.scene.start("gamec"); // Start the "gamec" scene when the button is clicked
        });
        const score = this.registry.get('score');
        const scoreText = this.add.text(400, 300, 'Score: ' + Math.floor(score), {
            fontSize: '32px',
            fontFamily: 'minecraft',
            fill: '#fff',
            align: 'center'
        });
        scoreText.setOrigin(0.5);
    }

    update(time, delta) {

    }
}


