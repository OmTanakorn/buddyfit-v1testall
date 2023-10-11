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
		this.load.image("background", "static/images/BG.png")
		this.load.spritesheet('duckEgg', 'static/images/DuckEgg.png',
							 { frameWidth: 640, frameHeight: 640 })
		this.load.spritesheet('duckDuck', 'static/images/DuckDuck.png',
							 { frameWidth: 640, frameHeight: 640 })
		this.load.spritesheet('duckImperfect', 'static/images/DuckImperfect.png',
							 { frameWidth: 640, frameHeight: 640 })
	}
	
	function create() {
		// Create the character page
		// Add background image
		const BG = this.add.image(this.scale.width/2, this.scale.height/2, 'background')
	
		// Add egg character image
		this.anims.create({
			key: 'eggIdle',
			frames: this.anims.generateFrameNumbers('duckEgg', { start: 0, end: 3}),
			frameRate: 5, repeat: -1
		});

		this.anims.create({
			key: 'eggBreak',
			frames: this.anims.generateFrameNumbers('duckEgg', { start: 4, end: 7 }),
			frameRate: 5, repeat: -1
		});

		// Add normal character image
		this.anims.create({
			key:'move',
			frames: this.anims.generateFrameNumbers('duckDuck', { start: 0, end: 3, first: 0}),
			frameRate: 5, repeat: -1
		})

		// Add imperfect character image
		this.anims.create({
			key: 'armImperfect',
			frames: this.anims.generateFrameNumbers('duckImperfect', { start : 0, end : 3 }),
			frameRate: 5, repeat: -1
		});
		
		this.anims.create({
			key: 'legImperfect',
			frames: this.anims.generateFrameNumbers('duckImperfect', { start : 8, end : 11 }),
			frameRate: 5, repeat: -1
		})

		this.anims.create({
			key: 'bodyImperfect',
			frames: this.anims.generateFrameNumbers('duckImperfect', { start : 4, end : 6 }),
			frameRate: 5, repeat: -1
		})

		// Add character
		this.player = this.add.sprite(this.scale.width/2, this.scale.height/2, 'duckEgg')
		this.player.play('eggIdle').setScale(0.75)

		// Add text
		var text = this.add.text(this.scale.width/2+20, this.scale.height/2-300, buddyName, {
			fontSize: '42px',
			fontFamily: 'minecraft',
			fill: '#fff'
		})
		text.setOrigin(0.5)
		// console.log(buddyName)

		// Set interactive when values to change
		console.log(armLevel);
		const totalLevel = (armLevel + legLevel + bodyLevel) / 3;

		if (totalLevel >= 40) {
    		this.player.anims.play('move').setScale(1);
    		console.log("move 40");
		} else if (totalLevel >= 30) {
			this.player.anims.play('move').setScale(0.75);
			console.log("move 30");
		} else if (totalLevel >= 20) {
			this.player.play('move').setScale(0.50);
			console.log("move 20");
		} else if (totalLevel >= 10) {
			this.player.play('eggBreak').setScale(0.75);
			console.log("eggBreak");
		} else if (totalLevel >= 0) {
			this.player.play('eggIdle').setScale(0.75);
			console.log("eggIdle");
		}
			// if (armPower <= 40) {
		// 	this.player.anims.play('armImperfect')
		// }
		// if (legPower <= 40) {
		// 	this.player.anims.play('legImperfect')
		// }
		// if (bodyPower <= 40) {
		// 	this.player.anims.play('bodyImperfect')
		// }
	}
	
	function update() {
		// Update any logic for the character page
	}
    
    // สร้างเกม
    const game = new Phaser.Game(config);