const form = document.querySelector("[data-workout-form]");

if (form) {
  const exercise = form.dataset.exercise;
  const countInput = form.querySelector("[data-workout-count]");
  const countOutput = document.querySelector("[data-rep-count]");
  const messageOutput = document.querySelector("[data-workout-message]");
  const cameraStatus = document.querySelector("[data-camera-status]");

  const syncCount = (event) => {
    if (event.detail.exercise === exercise) {
      countInput.value = event.detail.count;
      if (countOutput) countOutput.textContent = event.detail.count;
      if (messageOutput) messageOutput.textContent = "เยี่ยมมาก! รักษาจังหวะนี้ไว้";
    }
  };

  window.addEventListener("buddyfit:workout-progress", syncCount);
  window.addEventListener("buddyfit:workout-complete", syncCount);
  window.addEventListener("buddyfit:pose-ready", () => {
    if (cameraStatus) cameraStatus.textContent = "กล้องพร้อมใช้งาน";
    if (messageOutput) messageOutput.textContent = "จัดร่างกายให้อยู่กลางกรอบ แล้วกด Start";
  });
  window.addEventListener("buddyfit:pose-error", () => {
    if (cameraStatus) cameraStatus.textContent = "ไม่สามารถเปิดกล้องได้";
    if (messageOutput) messageOutput.textContent = "ตรวจสอบสิทธิ์กล้องแล้วโหลดหน้าใหม่อีกครั้ง";
  });
}
