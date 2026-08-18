import {startPoseDetector} from "./pose/detector.js";

const JUMP_THRESHOLD = 0.4;
const CROUCH_THRESHOLD = 0.8;

let stage = 0;

function drawScreenText(context, text, screenX, screenY, options = {}) {
  context.save();
  // canvas.output มี CSS transform: scaleX(-1) เพื่อให้กล้องเป็นภาพกระจกเงา
  // การวาดข้อความจึงต้อง flip แกน X กลับ (scale(-1, 1)) และเลื่อนตำแหน่งแกน X
  // ให้ตรงกับตำแหน่งที่ผู้ใช้มองเห็นบนหน้าจอ
  const canvasX = context.canvas.width - screenX;
  context.translate(canvasX, screenY);
  context.scale(-1, 1);

  if (options.font) context.font = options.font;
  if (options.fillStyle) context.fillStyle = options.fillStyle;
  if (options.textAlign) context.textAlign = options.textAlign;
  if (options.textBaseline) context.textBaseline = options.textBaseline;
  if (options.shadowColor) context.shadowColor = options.shadowColor;
  if (options.shadowBlur) context.shadowBlur = options.shadowBlur;

  context.fillText(text, 0, 0);
  context.restore();
}

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

  context.strokeStyle = "#24ff7e";
  context.beginPath();
  context.moveTo(0, jumpY);
  context.lineTo(canvas.width, jumpY);
  context.stroke();

  context.strokeStyle = "#ff5b5b";
  context.beginPath();
  context.moveTo(0, crouchY);
  context.lineTo(canvas.width, crouchY);
  context.stroke();

  context.restore();

  const textStyle = {
    font: "bold 16px sans-serif",
    shadowColor: "rgba(0, 0, 0, 0.85)",
    shadowBlur: 4,
  };

  drawScreenText(context, "กระโดด ↑  จมูกเหนือเส้น", 14, jumpY - 6, {
    ...textStyle,
    fillStyle: "#24ff7e",
    textAlign: "left",
    textBaseline: "bottom",
  });

  drawScreenText(context, "ย่อ ↓  จมูกใต้เส้น", 14, crouchY - 6, {
    ...textStyle,
    fillStyle: "#ff5b5b",
    textAlign: "left",
    textBaseline: "bottom",
  });

  drawScreenText(context, "วิ่งปกติ", canvas.width - 14, (jumpY + crouchY) / 2, {
    ...textStyle,
    fillStyle: "#ffd75e",
    textAlign: "right",
    textBaseline: "middle",
  });
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
