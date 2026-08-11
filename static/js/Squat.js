import {startPoseDetector} from "./pose/detector.js";

let stage = "UP";
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

    const angle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
    if (angle > 140) {
      stage = "UP";
    } else if (angle < 100 && stage === "UP") {
      stage = "DOWN";
      counter += 1;
      window.dispatchEvent(
        new CustomEvent("buddyfit:rep", {
          detail: {exercise: "squat", count: counter},
        }),
      );
    }
  },
});
