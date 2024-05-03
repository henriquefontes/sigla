function changeModalVisibility(modal) {
  document
    .querySelector(`[data-modal-name="${modal}"]`)
    .classList.toggle("open");
}

function resizeTable() {
  const table = document.querySelector(".table-wrapper");

  table.style.height = window.innerHeight - table.offsetTop - 40 + "px";
}

function rippleEffect(button, { layerX, layerY }) {
  const $ripple = document.createElement("span");

  $ripple.classList.add("ripple");
  $ripple.style.top = layerY - 10 + "px";
  $ripple.style.left = layerX - 10 + "px";

  button.appendChild($ripple);

  const DIAMETER = button.clientWidth * 2;
  const [R, G, B] = window
    .getComputedStyle(button)
    .getPropertyValue("background-color")
    .match(/\d+/g);

  $ripple.offsetHeight;

  $ripple.style.width = DIAMETER + "px";
  $ripple.style.height = DIAMETER + "px";
  $ripple.style.top = layerY - DIAMETER / 2 + "px";
  $ripple.style.left = layerX - DIAMETER / 2 + "px";
  $ripple.style.opacity = "0";
  $ripple.style.backgroundColor = `rgba(${R - 80}, ${G - 80}, ${B - 40}, 0.3)`;

  setTimeout(() => {
    $ripple.remove();
  }, 500);
}

window.addEventListener("load", resizeTable);
window.addEventListener("resize", resizeTable);

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    changeModalVisibility(button.dataset.modal);
  });
});

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (e) => {
    rippleEffect(button, e);
  });
});
