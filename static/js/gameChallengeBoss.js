class gamecboss extends Phaser.Scene {
    constructor() {
        super("gamecboss");
        this.score = 0; // เริ่มต้นคะแนนที่ 0
        this.scoreText = null; // ตัวแปรสำหรับเก็บข้อความคะแนน
        this.hpText = null; // ตัวแปรสำหรับเก็บข้อความ HP
        this.level = 0;
        this.isRunningAnim = false;
        this.currentAnimKey = '';
    }

    playAnimation(player, animationKey) {
        if (player.anims.currentAnim.key !== animationKey) {
            player.play(animationKey);
        }
    }

    preload() {
    } 

    create() {
        
        // สร้างอนิเมชั่นสำหรับการวิ่งของตัวละคร
        this.anims.create({
            key: 'run_anim',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 7,
            repeat: -1 // เล่นวนไปเรื่อย ๆ
        });
        // สร้างอนิเมชั่นสำหรับการกระโดดของตัวละคร
        this.anims.create({
            key: 'jump_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
            frameRate: 7,
            repeat: 0 // ไม่เล่นวน
        });
        // สร้างอนิเมชั่นสำหรับการสไลด์ของตัวละคร
        this.anims.create({
            key: 'slide_anim',
            frames: this.anims.generateFrameNumbers('player_slide', { start: 0, end: 1 }),
            frameRate: 7,
            repeat: 1, // ไม่เล่นวน
            repeatDelay: 2000
        });
        // กำหนดให้ตัวละครเล่นอนิเมชั่น run_anim ในเริ่มต้น
        

        //Smoothing camera rendering
        this.cameras.main.roundPixels = true;
        this.sky = this.add.tileSprite(400, 300,800,600, 'sky');
        this.sky.setScale(3);
        this.sky2 = this.add.tileSprite(400, 300, 800, 600, 'sky2');
        this.sky2.setScale(3);
        this.sky3 = this.add.tileSprite(400, 300, 800, 600, 'sky4');
        this.sky3.setScale(3);
        this.sky4 = this.add.tileSprite(400, 300, 800, 600, 'sky5');
        this.sky4.setScale(3);

        //Add more in 
        // สร้างข้อความ HP และกำหนดตำแหน่งและสไตล์ของข้อความ
        this.hpbar = this.add.image(30,30,'HP');
        this.hpper = this.hp/100
        this.hpbar.setScale(this.hpper,1);
        this.hpbar.setOrigin(0, 0);

        
        // สร้างข้อความคะแนนและกำหนดตำแหน่งและสไตล์ของข้อความ
        this.scoreText = this.add.text(760, 20, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'minecraft',
            fill: '#fff'
        }).setOrigin(1, 0); // ตั้งตำแหน่งให้อยู่บนขวาบน

        this.player = this.physics.add.sprite(100,400, 'player');
        this.player.play('run_anim');
        this.player.setScale(0.6);
        this.player.setOrigin(1, 1)
  
    }

    update(time, delta) {
        
        this.timer += delta / 1000; // เวลาเป็นมิลลิวินาที แปลงเป็นวินาที
        
        if (this.timer >= 5) {
            console.log('Passed 5 seconds!');
            console.log('Player X:', this.player.x);
            console.log('Player Y:', this.player.y);
            
            this.timer = 0;
        }

        
    }
}

