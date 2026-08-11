import {startPoseDetector} from "./pose/detector.js";

let stage = "DOWN";
let counter = 0;

function calculateAngle(first, middle, last) {
  const radians =
    Math.atan2(last.y - middle.y, last.x - middle.x) -
    Math.atan2(first.y - middle.y, first.x - middle.x);
  const angle = Math.abs((radians * 180) / Math.PI);
  return angle > 180 ? 360 - angle : angle;
}

startPoseDetector({
  onLandmarks(landmarks) {
    if (!landmarks) return;

    const angle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    if (angle > 140) {
      stage = "DOWN";
    } else if (angle < 30 && stage === "DOWN") {
      stage = "UP";
      counter += 1;
      window.dispatchEvent(
        new CustomEvent("buddyfit:rep", {
          detail: {exercise: "situp", count: counter},
        }),
      );
    }
  },
});
