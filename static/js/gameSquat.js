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
}
const game = new Phaser.Game(config)

var countdown = 5
let squatCount = 0

function getSquatCountdown() {
    return countdown
}

function startTimer(duration, timerText) {
    var timer = duration;
    squatCount = 0;
    sessionStorage.setItem("squat_count", 0);
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

function preload() {
    // Load ant assets needed for the character page
    this.load.image('background', '../static/images/BG.png')
    this.load.spritesheet('duckDuck', 'static/images/DuckDuck.png',
							 { frameWidth: 640, frameHeight: 640 })
}

function create() {
    // Add background
    this.add.image(300, 400, 'background')

    // Add character
    this.player = this.add.sprite(300, 400, 'player')
    // Add animation
    this.anims.create({
        key: 'squat',
        frameRate: 5,
        frames: this.anims.generateFrameNumbers('player', {
            start: 8,
            end: 9,
        }),
    })
    this.player.play('squat')

    // Add text
    var text = this.add.text(300, 100, 'Squat bro', {
        fontSize: '42px',
        fontFamily: 'minecraft',
        fill: '#fff'
    });
    text.setOrigin(0.5, 0.5);

    this.squatCountText = this.add.text(300, 400, '', {
        fontSize: '64px',
        fontFamily: 'minecraft',
        fill: '#fff' });
    this.squatCountText.setOrigin(0.5)


    var startButton = this.add.text(300, 700, 'Start', {
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

function update() {
    // Update any logic for the character page
    if(count == 1 && countdown==0){
        this.player.play('squat');
        count++;
        squatCount++;
        this.squatCountText.setText(squatCount);
        sessionStorage.setItem("squat_count", squatCount);
    }
}