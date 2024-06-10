const notyf = new Notyf();

function formDataToObject(formData) {
  const object = {};

  formData.forEach((value, key) => (object[key] = value));

  return object;
}

function renderTableData() {
  const table = document.querySelector("table");
  const data = table.data;
  const modalName = table.dataset.modalEdit;
  const props = [...table.querySelectorAll("thead th")]
    .map((p) => p.dataset.prop)
    .filter((p) => p);

  const rows = data.reduce((acc, val) => {
    acc += `
    <tr>
    ${props
      .map((prop) => {
        let value = val[prop];

        if (
          /\b(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\b/.test(value)
        ) {
          value = value.split("-");
          value = value[2] + "/" + value[1] + "/" + value[0];
        }
        return `<td data-prop="${prop}">` + value + `</td>`;
      })
      .join("")}
        <td style="display: flex; gap: 5px; justify-content: center; width: 100%; max-width: 100%;">
          <button onclick="changeModalVisibility('${modalName}', '${val.id}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="deleteTableData('${val.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;

    return acc;
  }, "");

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = rows;
}

async function deleteTableData(id) {
  if (!id) return;

  const table = document.querySelector("table");
  const route = table.dataset.route;

  changeModalVisibility("loading");

  if (await api.delete(route + "/" + id)) {
    notyf.success({
      message: "Registro removido com sucesso!",
      duration: 4000,
    });
  } else {
    notyf.error({
      message: "Erro ao remover o registro!",
      duration: 0,
      dismissible: true,
    });
  }

  changeModalVisibility("loading");

  loadTableData();
}

async function loadTableData() {
  const table = document.querySelector("table");
  const route = table.dataset.route;

  changeModalVisibility("loading");

  const data = await api.get(route);

  changeModalVisibility("loading");

  if (data) {
    table.data = [...data];
    table.originalData = [...data];
  } else {
    notyf.error({
      message: "Erro ao carregar os registros!",
      duration: 0,
      dismissible: true,
    });
    return;
  }

  changeModalVisibility("loading");

  if (await api.get(route)) {
    table.data = data;
  } else {
    notyf.error({
      message: "Erro ao carregar os registros!",
      duration: 0,
      dismissible: true,
    });
    return;
  }

  renderTableData();

  changeModalVisibility("loading");
}

async function handleFormSubmit(form) {
  const formData = new FormData(form);
  const isEdit = formData.get("id") != "";
  const method = isEdit ? "PUT" : "POST";
  const route = form.dataset.route + (isEdit ? "/" + formData.get("id") : "");

  if (!isEdit) formData.delete("id");

  changeModalVisibility("loading");

  const createdData = await api[method.toLowerCase()](route, {
    ...formDataToObject(formData),
  });

  if (createdData) {
    notyf.success({
      message: "Registro salvo com sucesso!",
      duration: 4000,
    });
  } else {
    notyf.error({
      message: "Erro ao criar o registro!",
      duration: 0,
      dismissible: true,
    });
  }

  changeModalVisibility("loading");
  changeModalVisibility(form.getParentElement("[data-modal-name]"));

  loadTableData(document.querySelector("table"));
}

function changeModalVisibility(modal, id) {
  if (modal instanceof Element) modal = modal.dataset.modalName;

  const $modal = document.querySelector(`[data-modal-name="${modal}"]`);

  if ($modal.classList.contains("open")) {
    $modal.classList.remove("open");
    return;
  }

  $modal.classList.add("open");

  const $form = $modal.querySelector("form");

  if ($form != null) {
    $form.reset();
    $modal.querySelector('[type="submit"]').textContent = !id
      ? "Adicionar"
      : "Salvar";
  }

  if (!id) return;

  const data = document
    .querySelector("table")
    .data.find((record) => record.id == id);

  for (const [key, value] of Object.entries(data)) {
    $modal.querySelector(`[name="${key}"]`).value = value;
  }
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

document.querySelectorAll(".modal form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit(form);
  });
});

document.querySelectorAll("[data-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    const sortField = button.dataset.sort;
    const sortDir = button.dataset.sortDir;
    const table = document.querySelector("table");
    const isSorted = table.sorted;

    if (isSorted) {
      const $sortedButton = document.querySelector("[data-sort].active");
      const $parentSortedButton = $sortedButton
        .getParentElement(".dropdown-wrapper")
        .querySelector("button");

      table.data = [...table.originalData];
      $sortedButton.classList.remove("active");
      $parentSortedButton.classList.remove("active");
      renderTableData();

      table.sorted = false;

      if (button == $sortedButton) return;
    }

    table.data.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDir == "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDir == "asc" ? 1 : -1;
      }

      return 0;
    });

    button.classList.add("active");
    button
      .getParentElement(".dropdown-wrapper")
      .querySelector("button")
      .classList.add("active");
    renderTableData();

    table.sorted = true;
  });
});

document.querySelector("body").addEventListener("click", () => {
  document
    .querySelectorAll(".button-dropdown")
    .forEach((d) => d.classList.remove("active"));
});

document.querySelectorAll(".dropdown-wrapper").forEach((wrapper) => {
  const button = wrapper.querySelector("button");

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    document
      .querySelectorAll(".button-dropdown")
      .forEach((dd) => dd.classList.remove("active"));
    wrapper.querySelector(".button-dropdown").classList.toggle("active");
  });
});

Element.prototype.getParentElement = function (parentElementSelector) {
  let parentElement = this.parentElement;

  while (
    parentElement != null &&
    !parentElement.matches(parentElementSelector)
  ) {
    parentElement = parentElement.parentElement;
  }

  return parentElement;
};

loadTableData(document.querySelector("table"));
