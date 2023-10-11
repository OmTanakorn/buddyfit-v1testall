const config = {
        type: Phaser.CANVAS,
		scale: {
			width: 600,
			height: 890,
		},
		parent: 'game-container',
		backgroundColor: '#fff',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    function preload() {
		// Load any assets needed for the character page
		this.load.image("background", "../static/images/BG.png")
		this.load.spritesheet('minotor', '../static/images/Minotor.png',
                    		 {frameWidth: 640, frameHeight: 640})
	}
	
	function create() {
		// Create the character page
		// Add background image
		const BG = this.add.image(this.scale.width/2, this.scale.height/2, 'background')
		this.player = this.add.sprite(300, 400, 'player')

		this.anims.create({
			key:'move',
			frames: this.anims.generateFrameNumbers('minotor', { start: 0, end: 3, first: 0}),
			frameRate: 5, repeat: -1
		})
		this.player.play('move')
	}
	
	function update() {
		// Update any logic for the character page
	}
    
    // สร้างเกม
    const game = new Phaser.Game(config);