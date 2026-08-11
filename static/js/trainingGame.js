export function createTrainingGame({exercise, title, animationKey, frames}) {
  const container = document.getElementById("game-container");
  let workoutActive = false;
  let exerciseCount = 0;

  function preload() {
    this.load.image("background", container.dataset.backgroundUrl);
    this.load.spritesheet("player", container.dataset.playerUrl, {
      frameWidth: 640,
      frameHeight: 640,
    });
  }

  function create() {
    this.add.image(300, 400, "background");
    this.anims.create({
      key: animationKey,
      frames: this.anims.generateFrameNumbers("player", frames),
      frameRate: 5,
    });
    this.player = this.add.sprite(300, 400, "player");
    this.player.play(animationKey);

    this.add
      .text(300, 100, title, {
        fontSize: "42px",
        fontFamily: "minecraft",
        fill: "#fff",
      })
      .setOrigin(0.5);
    this.countText = this.add
      .text(300, 400, "0", {
        fontSize: "64px",
        fontFamily: "minecraft",
        fill: "#fff",
      })
      .setOrigin(0.5);

    const onRep = (event) => {
      if (!workoutActive || event.detail.exercise !== exercise) return;
      exerciseCount += 1;
      this.player.play(animationKey);
      this.countText.setText(exerciseCount);
      window.dispatchEvent(
        new CustomEvent("buddyfit:workout-progress", {
          detail: {exercise, count: exerciseCount},
        }),
      );
    };
    window.addEventListener("buddyfit:rep", onRep);

    const startButton = this.add
      .text(300, 700, "Start", {
        fontSize: "64px",
        fontFamily: "minecraft",
        fill: "#fff",
      })
      .setOrigin(0.5)
      .setInteractive();

    startButton.on("pointerdown", () => {
      startButton.disableInteractive();
      const countdownText = this.add
        .text(300, 300, "5", {
          fontSize: "64px",
          fontFamily: "minecraft",
          fill: "#fff",
        })
        .setOrigin(0.5);
      let countdown = 5;
      const countdownInterval = window.setInterval(() => {
        countdown -= 1;
        countdownText.setText(countdown || "");
        if (countdown === 0) {
          window.clearInterval(countdownInterval);
          exerciseCount = 0;
          this.countText.setText("0");
          workoutActive = true;
          startTimer.call(this, 30, countdownText);
        }
      }, 1000);
    });
  }

  function startTimer(duration, timerText) {
    let remaining = duration;
    timerText.setText("00:30");
    const timerInterval = window.setInterval(() => {
      remaining -= 1;
      timerText.setText(`00:${String(Math.max(remaining, 0)).padStart(2, "0")}`);
      if (remaining <= 0) {
        window.clearInterval(timerInterval);
        workoutActive = false;
        timerText.setText("Time's up!");
        window.dispatchEvent(
          new CustomEvent("buddyfit:workout-complete", {
            detail: {exercise, count: exerciseCount},
          }),
        );
      }
    }, 1000);
  }

  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 600,
    height: 890,
    parent: "game-container",
    scene: {preload, create},
  });
}
