const config = {
        type: Phaser.AUTO,
		scale: {
			width: 600,
			height: 800,
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
		this.load.image("background", "static/images/BG.png");
		this.load.spritesheet('player', 'static/images/Minotor.png',
									{ frameWidth : 640, frameHeight : 640, startFrame : 0, endFrame : 15});
	}
	
	function create() {
		// Create the character page
		// Add background image
		const BG = this.add.image(this.scale.width/2, this.scale.height/2, 'background')
	
		// Add character image
		this.anims.create({
			key : 'egg_idle',
			frames : this.anims.generateFrameNumbers('player', { start : 0, end : 3}),
			frameRate : 5, repeat : -1
		});

		this.anims.create({
			key : 'pushup',
			frames : this.anims.generateFrameNumbers('player', { start : 4, end : 6}),
			frameRate : 5
		});
		this.player = this.add.sprite(300, 400, 'player');
		this.player.play('egg_idle');
		
		// Add text
		var text = this.add.text(300, 100, buddyName, {
			fontSize: '42px',
			fontFamily: 'minecraft',
			fill: '#fff'
		});
		text.setOrigin(0.5, 0.5);
		// console.log(buddyName)	
	}
	
	function update() {
		// Update any logic for the character page
	}
    
    // สร้างเกม
    const game = new Phaser.Game(config);