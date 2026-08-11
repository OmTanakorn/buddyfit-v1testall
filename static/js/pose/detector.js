import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

function showPoseError(canvas, error) {
  document.body.classList.add("loaded");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.font = "20px sans-serif";
  context.textAlign = "center";
  context.fillText("เปิดกล้องไม่ได้ กรุณาตรวจสิทธิ์กล้อง", canvas.width / 2, 40);
  window.dispatchEvent(
    new CustomEvent("buddyfit:pose-error", {detail: {message: error.message}}),
  );
  console.error("Pose Landmarker failed to start", error);
}

async function createLandmarker(vision) {
  const options = {
    baseOptions: {modelAssetPath: MODEL_URL, delegate: "GPU"},
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    return await PoseLandmarker.createFromOptions(vision, options);
  } catch (error) {
    console.warn("GPU delegate unavailable; falling back to CPU", error);
    options.baseOptions.delegate = "CPU";
    return PoseLandmarker.createFromOptions(vision, options);
  }
}

export async function startPoseDetector({onLandmarks}) {
  const video = document.querySelector(".input_video");
  const canvas = document.querySelector("canvas.output");
  let landmarker = null;
  let stream = null;

  try {
    if (!video || !canvas || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not support camera pose detection");
    }

    const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
    landmarker = await createLandmarker(vision);
    const context = canvas.getContext("2d");
    const drawing = new DrawingUtils(context);
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {facingMode: "user", width: 480, height: 480},
    });

    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    document.body.classList.add("loaded");
    window.dispatchEvent(new CustomEvent("buddyfit:pose-ready"));

    let stopped = false;
    let lastVideoTime = -1;
    let frames = 0;
    let fps = 0;
    let sampledAt = performance.now();

    const stop = () => {
      if (stopped) return;
      stopped = true;
      stream.getTracks().forEach((track) => track.stop());
      landmarker.close();
    };

    const renderFrame = () => {
      if (stopped) return;

      const now = performance.now();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, now);
        const landmarks = result.landmarks?.[0] ?? null;

        frames += 1;
        if (now - sampledAt >= 1000) {
          fps = Math.round((frames * 1000) / (now - sampledAt));
          frames = 0;
          sampledAt = now;
        }

        if (landmarks) {
          drawing.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: "#00ff88",
            lineWidth: 4,
          });
          drawing.drawLandmarks(landmarks, {color: "#ff3355", radius: 3});
        }
        onLandmarks(landmarks, {fps});
      }

      requestAnimationFrame(renderFrame);
    };

    window.addEventListener("pagehide", stop, {once: true});
    requestAnimationFrame(renderFrame);
    return {stop};
  } catch (error) {
    stream?.getTracks().forEach((track) => track.stop());
    landmarker?.close();
    showPoseError(canvas ?? document.createElement("canvas"), error);
    return null;
  }
}
