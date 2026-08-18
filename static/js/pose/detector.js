import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs";

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

function getFriendlyErrorMessage(error) {
  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return {
      title: "เบราว์เซอร์ไม่ได้รับสิทธิ์เข้าถึงกล้อง",
      desc: "กรุณากดไอคอนรูปแม่กุญแจหรือการตั้งค่าเว็บไซต์ที่แถบ URL ด้านบน แล้วเลือก 'อนุญาต (Allow)' ให้เว็บไซต์เข้าถึงกล้อง",
    };
  }
  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return {
      title: "ไม่พบอุปกรณ์กล้อง (Webcam)",
      desc: "กรุณาตรวจสอบว่าได้เชื่อมต่อกล้องเว็บแคมเข้ากับคอมพิวเตอร์เรียบร้อยแล้ว",
    };
  }
  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return {
      title: "กล้องถูกใช้งานโดยโปรแกรมอื่น",
      desc: "กรุณาปิดโปรแกรมอื่นที่อาจกำลังใช้กล้องอยู่ (เช่น Zoom, Teams, Google Meet, OBS หรือแท็บเบราว์เซอร์อื่น)",
    };
  }
  if (error.name === "OverconstrainedError") {
    return {
      title: "กล้องไม่รองรับการตั้งค่าความละเอียด",
      desc: "อุปกรณ์กล้องไม่รองรับค่าความละเอียดที่ระบุ กรุณาลองใหม่อีกครั้ง",
    };
  }
  return {
    title: "ไม่สามารถเปิดระบบตรวจจับท่าทางได้",
    desc: "เกิดข้อผิดพลาดในการโหลด AI Model หรือเชื่อมต่อกล้อง (" + (error.message || error.name || "Error") + ") กรุณาตรวจสอบอินเทอร์เน็ตหรือปิด AdBlock ชั่วคราว",
  };
}

function showPoseError(canvas, error) {
  document.body.classList.remove("loaded");
  document.body.classList.add("has-camera-error");

  const statusEl = document.querySelector("[data-camera-status]");
  if (statusEl) {
    statusEl.textContent = "เปิดกล้องไม่สำเร็จ";
  }

  const { title, desc } = getFriendlyErrorMessage(error);
  const wrap = canvas.closest(".camera-wrap") || canvas.parentElement;

  if (wrap) {
    const existing = wrap.querySelector(".camera-error-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "camera-error-overlay";
    overlay.innerHTML = `
      <div class="camera-error-icon">📷⚠️</div>
      <div class="camera-error-title">${title}</div>
      <div class="camera-error-desc">${desc}</div>
      <button type="button" class="camera-retry-btn" onclick="window.location.reload()">ลองใหม่อีกครั้ง</button>
    `;
    wrap.appendChild(overlay);
  }

  window.dispatchEvent(
    new CustomEvent("buddyfit:pose-error", {detail: {message: error.message, error}}),
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

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: {ideal: 640},
          height: {ideal: 480},
        },
      });
    } catch (camErr) {
      console.warn("Retrying getUserMedia with basic fallback", camErr);
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
    }

    video.muted = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.srcObject = stream;
    await video.play();

    document.body.classList.remove("has-camera-error");
    document.body.classList.add("loaded");

    const statusEl = document.querySelector("[data-camera-status]");
    if (statusEl) {
      statusEl.textContent = "ควบคุมด้วยท่าทาง";
    }

    window.dispatchEvent(new CustomEvent("buddyfit:pose-ready"));

    let stopped = false;
    let lastVideoTime = -1;
    let frames = 0;
    let fps = 0;
    let sampledAt = performance.now();

    const stop = () => {
      if (stopped) return;
      stopped = true;
      stream?.getTracks().forEach((track) => track.stop());
      landmarker?.close();
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
