const form = document.querySelector("[data-workout-form]");

if (form) {
  const exercise = form.dataset.exercise;
  const input = form.querySelector("input[type='hidden']");

  const syncCount = (event) => {
    if (event.detail.exercise === exercise) {
      input.value = event.detail.count;
    }
  };

  window.addEventListener("buddyfit:workout-progress", syncCount);
  window.addEventListener("buddyfit:workout-complete", syncCount);
}
