class gamec extends Phaser.Scene {
    constructor() {
        super("gamec");
        this.score = 0; // เริ่มต้นคะแนนที่ 0
        this.scoreText = null; // ตัวแปรสำหรับเก็บข้อความคะแนน
        this.hpText = null; // ตัวแปรสำหรับเก็บข้อความ HP
        this.level = 0;
        this.isRunningAnim = false;
        this.currentAnimKey = '';
        this.poseStage = 0;
        this.runCompleted = false;
        this.runSpeed = 340;
        this.donutsCollected = 0;
    }

    addDonut(x, y) {
        const donut = this.physics.add.image(x, y, 'donut');
        donut.setScale(1.35);

        // ภาพโดนัทเป็นทรงกลม จึงใช้ hitbox วงกลมที่เล็กกว่าขอบภาพเล็กน้อย
        // เพื่อให้ระยะที่ผู้เล่นมองเห็นตรงกับจังหวะที่เก็บโดนัทได้มากขึ้น
        const radius = Math.floor(Math.min(donut.width, donut.height) * 0.36);
        donut.setCircle(
            radius,
            (donut.width / 2) - radius,
            (donut.height / 2) - radius,
        );

        donut.body.setAllowGravity(false);
        donut.body.setImmovable(true);
        donut.body.setVelocityX(-this.runSpeed);
        this.donutGroup.add(donut);
    }

    addDonutPattern(startX, groundY = 430) {
        const patterns = [
            [0, 0, 0, 0, 0, 0],
            [0, -45, -80, -100, -80, -45, 0],
            [0, -35, -70, -35, 0, -35, -70, -35],
        ];
        const pattern = Phaser.Utils.Array.GetRandom(patterns);

        pattern.forEach((offsetY, index) => {
            this.addDonut(startX + (index * 58), groundY + offsetY);
        });
    }

    collectDonut(player, donut) {
        const popupX = donut.x;
        const popupY = donut.y;
        donut.destroy();

        this.donutsCollected += 1;
        this.score += 10;
        this.donutText.setText(`Donuts: ${this.donutsCollected}`);

        const popup = this.add.text(popupX, popupY, '+10', {
            fontSize: '22px',
            fontFamily: 'minecraft',
            color: '#ffd75e',
            stroke: '#7a3100',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: popup,
            y: popupY - 45,
            alpha: 0,
            duration: 450,
            ease: 'Cubic.easeOut',
            onComplete: () => popup.destroy(),
        });

        this.tweens.add({
            targets: this.player,
            scaleX: 0.66,
            scaleY: 0.66,
            yoyo: true,
            duration: 80,
        });
    }

    addPlatform(width, x, y, type) {
        
        let platform;
        if(type==1){
            platform = this.add.tileSprite(x+width/2, y, width, 64, "block1");
        }
        
        this.physics.add.existing(platform);
        platform.body.setVelocityX(-this.runSpeed);
        platform.body.setImmovable(true);
        platform.body.setAllowGravity(false);
        this.platformGroup.add(platform);
    }

    playAnimation(player, animationKey) {
        if (player.anims.currentAnim.key !== animationKey) {
            player.play(animationKey);
        }
    }

    setPlayerHitbox(width, height) {
        this.player.setSize(width, height);
        this.player.setOffset(
            (this.player.width - width) / 2,
            this.player.height - height,
        );
    }

    completeRun() {
        if (this.runCompleted) return;
        this.runCompleted = true;
        const score = Math.floor(this.score);
        this.registry.set('score', score);
        window.dispatchEvent(
            new CustomEvent('buddyfit:challenge-complete', {detail: {score}})
        );
        this.scene.start('gameEnd');
    }

    preload() {
    } 

    create() {
        
        this.hp = 200 + 100; // HP เริ่มต้น
        this.level = 1;
        this.score = 0;
        this.poseStage = 0;
        this.runCompleted = false;
        this.runSpeed = 340;
        this.donutsCollected = 0;
        this.timer = 0;

        const onPoseState = (event) => {
            this.poseStage = event.detail.stage;
        };
        window.addEventListener('buddyfit:pose-state', onPoseState);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            window.removeEventListener('buddyfit:pose-state', onPoseState);
        });
        // สร้างอนิเมชั่นสำหรับการวิ่งของตัวละคร
        this.anims.create({
            key: 'run_anim',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 12,
            repeat: -1 // เล่นวนไปเรื่อย ๆ
        });
        // สร้างอนิเมชั่นสำหรับการกระโดดของตัวละคร
        this.anims.create({
            key: 'jump_anim',
            frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0 // ไม่เล่นวน
        });
        // สร้างอนิเมชั่นสำหรับการสไลด์ของตัวละคร
        this.anims.create({
            key: 'slide_anim',
            frames: this.anims.generateFrameNumbers('player_slide', { start: 0, end: 1 }),
            frameRate: 12,
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

        this.donutText = this.add.text(760, 52, 'Donuts: 0', {
            fontSize: '20px',
            fontFamily: 'minecraft',
            fill: '#ffd75e',
            stroke: '#5b2600',
            strokeThickness: 3,
        }).setOrigin(1, 0);

        this.player = this.physics.add.sprite(100,400, 'player');
        this.player.play('run_anim');
        this.player.setScale(0.6);
        this.player.setOrigin(1, 1)
        this.player.setGravityY(1100);
        this.setPlayerHitbox(90, 170);
        this.playerJumps = 0;

        this.platformGroup = this.add.group();
        this.addPlatform(1300, -200, 550, 1);

        this.donutGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
        this.addDonutPattern(420);

        this.physics.add.collider(this.player, this.platformGroup);
        this.physics.add.overlap(
            this.player,
            this.donutGroup,
            this.collectDonut,
            null,
            this,
        );
    }

    update(time, delta) {
        
        this.timer += delta / 1000; // เวลาเป็นมิลลิวินาที แปลงเป็นวินาที
        
        const stageNow = this.poseStage;

        if (this.player.body.touching.down && stageNow === 0) {
            this.playerJumps = 0;
            this.playAnimation(this.player, 'run_anim');
            this.player.setGravityY(1100);
            this.setPlayerHitbox(90, 170);
        }
    
        if (stageNow === -1 && this.playerJumps < 1) {
            this.player.setVelocityY(-620);
            this.playAnimation(this.player, 'jump_anim');
            this.setPlayerHitbox(90, 170);
            this.playerJumps += 1;
        }
    
        if (stageNow === 1) {
            this.playAnimation(this.player, 'slide_anim');
            this.player.setGravityY(1300);
            this.setPlayerHitbox(105, 75);
        }

        this.player.x = 100;

        // ใช้ delta เพื่อให้ความเร็วเท่ากันบนจอ 60/120Hz และเร่งตามคะแนน
        this.runSpeed = Math.min(500, 340 + (this.score * 0.18));
        // asset วิ่งออกแบบที่ 12 FPS สำหรับความเร็วฐาน 340 px/s
        // จึงเร่งรอบขาตามความเร็วเกมเพื่อลดอาการเท้าไถลเมื่อเกมเร็วขึ้น
        this.player.anims.timeScale = (
            this.player.anims.currentAnim?.key === 'run_anim'
                ? this.runSpeed / 340
                : 1
        );
        const scrollStep = (this.runSpeed * delta) / 1000;
        this.sky.tilePositionX += scrollStep * 0.08;
        this.sky2.tilePositionX += scrollStep * 0.22;
        this.sky3.tilePositionX += scrollStep * 0.48;
        this.sky4.tilePositionX += scrollStep * 0.78;

        this.score += delta * 0.002;
        
        if(this.player.y > 720) {
            this.completeRun();
            return;
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

        this.donutGroup.getChildren().forEach((donut) => {
            donut.body.setVelocityX(-this.runSpeed);
            if (donut.x < -80) donut.destroy();
        });

        let rightmostEdge = 0;
        this.platformGroup.getChildren().forEach((platform) => {
            platform.body.setVelocityX(-this.runSpeed);
            rightmostEdge = Math.max(
                rightmostEdge,
                platform.x + (platform.displayWidth / 2),
            );
            if (platform.x < -platform.displayWidth / 2) {
                platform.destroy();
            }
        });

        if (rightmostEdge < 1150) {
            const gap = Phaser.Math.Between(90, 160);
            const platformWidth = Phaser.Math.Between(560, 780);
            const platformStart = Math.max(800, rightmostEdge + gap);
            this.addPlatform(platformWidth, platformStart, 550, 1);

            // มีโดนัทแทบทุกช่วง สลับตำแหน่งต่ำ/สูงให้ต้องวิ่ง กระโดด และสไลด์
            const patternY = Phaser.Math.Between(0, 3) === 0 ? 355 : 430;
            this.addDonutPattern(platformStart + 80, patternY);
        }
    }
}
