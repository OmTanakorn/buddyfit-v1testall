class gameStart extends Phaser.Scene {
    constructor() {
        super("gameStart");
    }

    preload() {

        this.load.image("start1", "../static/images/assets/challenge/start1.png");
        this.load.image("start2", "../static/images/assets/challenge/start2.png");

        this.load.image("Logo", "../static/images/assets/challenge/Logo.png");

        this.load.image("donut", "../static/images/assets/challenge/noEat.png");

        this.load.image("sky", "../static/images/assets/challenge/plx-1.png");
        this.load.image("sky2", "../static/images/assets/challenge/plx-2.png");
        this.load.image("sky3", "../static/images/assets/challenge/plx-3.png");
        this.load.image("sky4", "../static/images/assets/challenge/plx-4.png");
        this.load.image("sky5", "../static/images/assets/challenge/plx-5.png");
        this.load.image("nik", "../static/images/assets/challenge/stw-1.png");
        this.load.image("nik2", "../static/images/assets/challenge/stw-2.png");
        this.load.image("nik3", "../static/images/assets/challenge/stw-3.png");
        this.load.image("nik4", "../static/images/assets/challenge/stw-4.png");
        this.load.image("nik5", "../static/images/assets/challenge/stw-5.png");
        this.load.image("block1", "../static/images/assets/challenge/block1.png");

        this.load.image("HP", "../static/images/assets/challenge/HP_Bar.png")
        
        this.load.spritesheet("player" , "../static/images/assets/challenge/Momotaros_run.png",
                                    {frameWidth:144, frameHeight:192 ,startFrame:0 ,endFrame:2});
        this.load.spritesheet("player_jump" , "../static/images/assets/challenge/Momotaros_jump.png",
                                    {frameWidth:152, frameHeight:192 ,startFrame:0 ,endFrame:3});                            
        this.load.spritesheet("player_slide" , "../static/images/assets/challenge/Momotaros_slide.png",
                                    {frameWidth:144, frameHeight:192 ,startFrame:0 ,endFrame:1});
    }  

    create() {
        // Create the sky background
        
        const bg1 = this.add.image(400, 300, 'sky'); // Adjust position as needed
        const bg2 = this.add.image(400, 300, 'sky2'); // Adjust position as needed
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

            this.scene.start("gamecboss"); // Start the "gamec" scene when the button is clicked
        });
    }

    update(time, delta) {

    }
}


