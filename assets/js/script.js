function changeModalVisibility(modal) {
  document
    .querySelector(`[data-modal-name="${modal}"]`)
    .classList.toggle("open");
}

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    changeModalVisibility(button.dataset.modal);
  });
});
