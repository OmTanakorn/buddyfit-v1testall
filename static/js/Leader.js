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
	}
	
	function create() {
		// Create the character page
		// Add background image
		const BG = this.add.image(this.scale.width/2, this.scale.height/2, 'background')
	
		
	}
	
	function update() {
		// Update any logic for the character page
	}
    
    // สร้างเกม
    const game = new Phaser.Game(config);