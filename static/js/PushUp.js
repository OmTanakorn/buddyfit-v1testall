import {startPoseDetector} from "./pose/detector.js";

let stage = "UP";
let counter = 0;

startPoseDetector({
  onLandmarks(landmarks) {
    if (!landmarks) return;

    const noseY = landmarks[0].y;
    if (noseY <= 0.5) {
      stage = "UP";
    } else if (noseY > 0.7 && stage === "UP") {
      stage = "DOWN";
      counter += 1;
      window.dispatchEvent(
        new CustomEvent("buddyfit:rep", {
          detail: {exercise: "pushup", count: counter},
        }),
      );
    }
  },
});
