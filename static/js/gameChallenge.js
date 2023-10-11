class gamec extends Phaser.Scene {
    constructor() {
        super("gamec");
        this.score = 0; // เริ่มต้นคะแนนที่ 0
        this.scoreText = null; // ตัวแปรสำหรับเก็บข้อความคะแนน
        this.hpText = null; // ตัวแปรสำหรับเก็บข้อความ HP
        this.level = 0;
        this.isRunningAnim = false;
        this.currentAnimKey = '';
    }

    addObstacle(x, y) {
        let obstacle = this.add.image(x,y,"donut")
    
        // เปลี่ยนคุณสมบัติต่าง ๆ ของสิ่งกีดขวางตามความต้องการ เช่น ใส่ physics, collider, เป็นต้น
        this.physics.add.existing(obstacle); // เพิ่ม physics ให้สิ่งกีดขวาง
        obstacle.body.setVelocityX(-200);
        obstacle.body.setImmovable(true); // ทำให้สิ่งกีดขวางไม่เคลื่อนไหวเมื่อถูกชน
    
        // เพิ่มสิ่งกีดขวางลงในกลุ่ม obstacleGroup (ถ้าคุณมีกลุ่มสำหรับการจัดการสิ่งกีดขวาง)
        this.obstacleGroup.add(obstacle);
    }

    addPlatform(width, x, y, type) {
        
        let platform;
        if(type==1){
            platform = this.add.tileSprite(x+width/2, y, width, 64, "block1");
        }
        
        this.physics.add.existing(platform);
        platform.body.setVelocityX(-200);
        platform.body.setImmovable(true);
        this.platformGroup.add(platform);
    }

    playAnimation(player, animationKey) {
        if (player.anims.currentAnim.key !== animationKey) {
            player.play(animationKey);
        }
    }

    preload() {
    } 

    create() {
        
        this.hp = 200 + 100; // HP เริ่มต้น
        this.level = 1;
        this.score = 0;
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
        this.player.setGravityY(800);
        this.playerJumps = 0;

        this.obstacleGroup = this.add.group();
        this.addObstacle(800, 430);
    
        this.platformGroup = this.add.group();
        this.addPlatform(1000, 10, 550, 1);

        this.physics.add.collider(this.player, this.platformGroup);    
    }

    update(time, delta) {
        
        this.timer += delta / 1000; // เวลาเป็นมิลลิวินาที แปลงเป็นวินาที
        
        if (this.timer >= 5) {
            // ทำงานที่คุณต้องการเมื่อผ่านไป 5 วินาที
            console.log('Passed 5 seconds!');
            console.log('Player X:', this.player.x);
            console.log('Player Y:', this.player.y);
            
            this.timer = 0;
        }

        if (this.player.body.touching.down && stage === 0) {
            this.playerJumps = 0;
            this.playAnimation(this.player, 'run_anim');
            this.player.setSize(144, 192);
            //ปรับตำแหน่ง hitbox ให้อยู่กลางของ Sprite
            this.player.setOffset(0, this.player.height - 192);
        }
    
        if (stage === -1 && this.playerJumps < 1) {
            this.player.setVelocityY(-500);
            this.playAnimation(this.player, 'jump_anim');
            this.playerJumps += 1;
        }
    
        if (stage === 1) {
            this.playAnimation(this.player, 'slide_anim');
            this.player.setGravityY(1000);

            this.player.setSize(144, 90);
            //ปรับตำแหน่ง hitbox ให้อยู่กลางของ Sprite
            this.player.setOffset(0, this.player.height - 90);
        }

        this.physics.overlap(this.player, this.obstacleGroup, (player, obstacle) => {
            this.hp = this.hp -100;
            this.hpper = this.hp/100;
            this.hpbar.setScale(this.hpper,1);
            // ลบสิ่งกีดขวางออกจาก this.obstacleGroup
            this.obstacleGroup.remove(obstacle);
            obstacle.destroy(); // ลบออกจากที่ทำงานทั่วไป
        });

        if(this.hp <= 0){
            this.scene.start("gameEnd", { score: this.score });
            this.registry.set('score', this.score);
            sessionStorage.setItem("score", Math.floor(this.score));
        }
            

        // if (this.isSlide == 1 && this.player.play == 'run_anim') {
        //     this.player.play('slide_anim');
        // }
        this.player.x = 100;
        
        this.sky2.tilePositionX += 0.5;
        this.sky3.tilePositionX += 0.8;
        this.sky4.tilePositionX += 1.2;

        this.score += ((1/50)*1.4); // เพิ่มคะแนนขึ้นทีละ 1 ทุกเฟรม + เพิ่มขึ้นตาม level ของตัวละคร
        
        if(this.player.y > 720) {
            this.scene.start("gameEnd");
            this.registry.set('score', this.score);
            sessionStorage.setItem("score", Math.floor(this.score));
        }
        
        if(this.score > 200 && this.level == 1){
            this.level = 2;
            this.sky.setTexture('nik');
            this.sky.setScale(3.5);
            this.sky2.setTexture('nik2');
            this.sky2.setScale(3.5);
            this.sky3.setTexture('nik3');
            this.sky3.setScale(3.5);
            this.sky4.setTexture('nik4');
            this.sky4.setScale(3.5);
        
        }

        // อัปเดตข้อความคะแนนบนหน้าจอ
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        this.obstacleGroup.getChildren().forEach((obstacle) => {
            if(obstacle.x < (obstacle.displayWidth /2)-100){
                this.obstacleGroup.killAndHide(obstacle);
                this.obstacleGroup.remove(obstacle);
                console.log("KILL obstacle")
                }
            });
                    
        let minDistance = 500; // เปลี่ยนเป็นการสุ่มค่าในช่วงที่คุณต้องการ
        this.platformGroup.getChildren().forEach((platform) => {
            let platformDistance = 800 - platform.x - (platform.displayWidth / 2);
            minDistance = Math.min(minDistance, platformDistance);
            
            if (platform.x < -platform.displayWidth / 2) {
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
        }
        });

        if (minDistance > Phaser.Math.Between(200, 400)) { // เปลี่ยนเป็นการสุ่มค่าในช่วงที่คุณต้องการ
            let platformWidth = Phaser.Math.Between(400, 600); // เปลี่ยนเป็นการสุ่มค่าในช่วงที่คุณต้องการ
            this.addPlatform(platformWidth, 800, 550, 1);
            let obstacleX = 800 + platformWidth / 2; // กำหนด x ให้เป็นค่าตรงกลางของ platformWidth
            if(Phaser.Math.Between(1,4) == 1){
                this.addObstacle(obstacleX, 430);
            }

        }
    }
}

