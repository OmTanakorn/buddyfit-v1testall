import {startPoseDetector} from "./pose/detector.js";

const JUMP_THRESHOLD = 0.4;
const CROUCH_THRESHOLD = 0.8;

let stage = 0;

function drawPoseZones() {
  const canvas = document.querySelector("canvas.output");
  const context = canvas.getContext("2d");
  const jumpY = canvas.height * JUMP_THRESHOLD;
  const crouchY = canvas.height * CROUCH_THRESHOLD;

  context.save();

  // ระบายสีบาง ๆ เพื่อให้เห็นพื้นที่ของแต่ละท่าชัดโดยไม่บังภาพกล้อง
  context.fillStyle = "rgba(36, 255, 126, 0.10)";
  context.fillRect(0, 0, canvas.width, jumpY);
  context.fillStyle = "rgba(255, 196, 61, 0.08)";
  context.fillRect(0, jumpY, canvas.width, crouchY - jumpY);
  context.fillStyle = "rgba(255, 91, 91, 0.10)";
  context.fillRect(0, crouchY, canvas.width, canvas.height - crouchY);

  context.setLineDash([12, 8]);
  context.lineWidth = 3;
  context.font = "bold 18px sans-serif";
  context.textBaseline = "bottom";
  context.shadowColor = "rgba(0, 0, 0, 0.8)";
  context.shadowBlur = 4;

  context.strokeStyle = "#24ff7e";
  context.fillStyle = "#24ff7e";
  context.beginPath();
  context.moveTo(0, jumpY);
  context.lineTo(canvas.width, jumpY);
  context.stroke();
  context.fillText("กระโดด ↑  จมูกเหนือเส้น", 12, jumpY - 6);

  context.strokeStyle = "#ff5b5b";
  context.fillStyle = "#ff5b5b";
  context.beginPath();
  context.moveTo(0, crouchY);
  context.lineTo(canvas.width, crouchY);
  context.stroke();
  context.fillText("ย่อ ↓  จมูกใต้เส้น", 12, crouchY - 6);

  context.setLineDash([]);
  context.fillStyle = "#ffd75e";
  context.textAlign = "right";
  context.fillText("วิ่งปกติ", canvas.width - 12, (jumpY + crouchY) / 2);
  context.restore();
}

startPoseDetector({
  onLandmarks(landmarks) {
    drawPoseZones();
    if (!landmarks) return;

    const noseY = landmarks[0].y;
    const nextStage =
      noseY >= CROUCH_THRESHOLD ? 1 : noseY <= JUMP_THRESHOLD ? -1 : 0;
    stage = nextStage;
    window.dispatchEvent(
      new CustomEvent("buddyfit:pose-state", {detail: {stage}}),
    );
  },
});
