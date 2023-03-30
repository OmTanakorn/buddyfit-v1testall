const config = {
    type: Phaser.CANVAS,
    width: 600,
    height: 890,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var countdown = 5;
let pushupCount = 0;

function getPushupCountdown() {
    return countdown ; // สร้างฟังก์ชัน getPushupCountdown ให้คืนค่า pushupCountdown
  }

function preload() {
    // Load any assets needed for the character page
    this.load.image("background", "../static/images/BG.png");
    this.load.spritesheet('player', '../static/images/Minotor.png',
                                { frameWidth : 640, frameHeight : 640 });
}

function create() {
    // Create the character page
    // Add background image
    this.add.image(300, 400, 'background');

    // Add character image
    this.anims.create({
        key : 'egg_idle',
        frames : this.anims.generateFrameNumbers('player', { start : 0, end : 3}),
        frameRate : 5, repeat : -1
    });

    this.anims.create({
        key : 'pushup',
        frames : this.anims.generateFrameNumbers('player', { start : 12, end : 14}),
        frameRate : 5
    });
    this.player = this.add.sprite(300, 400, 'player');
    this.player.play('pushup');
    
    // Add text
    var text = this.add.text(300, 100, 'PushUp bro', {
        fontSize: '42px',
        fontFamily: 'minecraft',
        fill: '#fff'
    });
    text.setOrigin(0.5, 0.5);

    this.pushupCountText = this.add.text(300, 400, '', {
        fontSize: '64px',
        fontFamily: 'minecraft',
        fill: '#fff' });
    this.pushupCountText.setOrigin(0.5)


    const startButton = this.add.text(300, 700, 'Start', {
        fontSize: '64px',
        fontFamily: 'minecraft',
        fill: '#fff'
    });

    startButton.setOrigin(0.5);
    startButton.setInteractive();
    // Handle start button click event

    startButton.on('pointerdown', () => {
        startButton.disableInteractive(); // ปิดปุ่มให้ไม่สามารถคลิกได้
        var countdownText = this.add.text(300, 300, '', {
            fontSize: '64px',
            fontFamily: 'minecraft',
            fill: '#fff'
        }).setOrigin(0.5);
        countdown = 5;
        var countdownInterval = setInterval(() => {
            countdownText.setText(countdown);
            countdown--; 
            if (countdown < 0) {
                countdown = 0
                clearInterval(countdownInterval);
                countdownText.setText('');
                startTimer(30, this.add.text(300, 300, '', {
                  fontSize: '64px',
                  fontFamily: 'minecraft',
                  fill: '#fff'
                }).setOrigin(0.5)); // เริ่มจับเวลา 30 วินาที
            }
        }, 1000);
    });
    
}

function startTimer(duration, timerText) {
    var timer = duration;
    var timerInterval = setInterval(() => {
        timer--;
        if (timer >= 0) {
            var minutes = Math.floor(timer / 60);
            var seconds = timer % 60;

            // แสดงผลเวลาในรูปแบบ 00:00
            var timeString = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
            timerText.setText(timeString);
        }
        if (timer < 0) {
            clearInterval(timerInterval);
            timerText.setText("Time's up!");
            countdown = 10;
        }
    }, 1000);
}


function update() {
    // Update any logic for the character page
    if(count == 1 && countdown==0){
        this.player.play('pushup');
        count++;
        pushupCount++;
        this.pushupCountText.setText( pushupCount);
    }

}



// สร้างเกม
const game = new Phaser.Game(config);