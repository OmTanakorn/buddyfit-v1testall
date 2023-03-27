


const config = {
        type: Phaser.AUTO,
        width: 800,
		height: 1200,
		parent: 'game-container',
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
		this.add.image(400, 600, 'background');
	
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
		this.player = this.add.sprite(400, 600, 'player');
		console.log(`${armPower}`)
		this.player.play('egg_idle');
		
		// Add text
		var text = this.add.text(400, 100, 'Buddy Minecraft', {
			fontSize: '62px',
			fontFamily: 'minecraft',
			fill: '#fff'
		});
		text.setOrigin(0.5, 0.5);
	
		
	}
	
	function update() {
		// Update any logic for the character page
		if(count == 1){
            console.log(count);
			this.player.play('pushup');
            count++;
            
        }
	}
    
    // สร้างเกม
    const game = new Phaser.Game(config);