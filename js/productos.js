// Usa IPv4 explícito para evitar problemas de localhost/IPv6
const API_PRODUCTOS = "http://127.0.0.1:3000/api/productos";

// Global modal handlers
let openProductoModal = null;
let closeProductoModal = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  const form = document.getElementById("form-producto");
  form && form.addEventListener("submit", guardarProducto);

  const modal = document.getElementById("modal-producto");
  const btnAdd = document.getElementById("btn-agregar-producto");
  const btnCancel = document.getElementById("modal-producto-cancel");

  openProductoModal = function () {
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  };
  closeProductoModal = function () {
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  };
  btnAdd && btnAdd.addEventListener("click", () => openProductoModal());
  btnCancel &&
    btnCancel.addEventListener("click", (e) => {
      e.preventDefault();
      closeProductoModal();
    });
});

async function cargarProductos() {
  let productos = [];
  try {
    const res = await fetch(API_PRODUCTOS);
    if (!res.ok) throw new Error(`Estado ${res.status}`);
    productos = await res.json();
  } catch (err) {
    console.warn("No se pudo cargar productos:", err);
  }
  const tbody = document.querySelector("#tabla-productos tbody");
  tbody.innerHTML = "";

  const nf = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });
  productos.forEach((p) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${nf.format(Number(p.precio))}</td>
        <td>${p.duracion_meses || p.duracion || "-"}</td>
        <td>
          <button onclick="editarProducto(${p.id}, '${p.nombre}', ${
      p.precio
    }, ${p.duracion_meses || 1})">✏️</button>
          <button onclick="eliminarProducto(${p.id})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

async function guardarProducto(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const data = Object.fromEntries(form.entries());
  // Validaciones inline
  const showError = (name, msg) => {
    const el = document.querySelector(`small[data-error-for="${name}"]`);
    if (el) {
      el.textContent = msg || "";
      el.style.display = msg ? "block" : "none";
    }
  };
  showError("nombre", "");
  showError("precio", "");
  showError("duracion_meses", "");

  const precioNum = parseFloat(data.precio);
  const durNum = parseInt(data.duracion_meses, 10);
  let hasError = false;
  if (!data.nombre || data.nombre.trim().length < 2) {
    showError("nombre", "Ingresa un nombre válido (min 2 caracteres)");
    hasError = true;
  }
  if (isNaN(precioNum) || precioNum <= 0 || precioNum > 10000000) {
    showError("precio", "Precio debe ser > 0 y razonable");
    hasError = true;
  }
  if (isNaN(durNum) || durNum < 1 || durNum > 60) {
    showError("duracion_meses", "Duración entre 1 y 60 meses");
    hasError = true;
  }
  if (hasError) return;

  data.precio = precioNum;
  data.duracion_meses = durNum;

  try {
    const res = await fetch(API_PRODUCTOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Estado ${res.status}`);
    e.target.reset();
    // cerrar modal
    closeProductoModal && closeProductoModal();
    cargarProductos();
  } catch (err) {
    showError("nombre", "");
    showError("precio", "");
    showError("duracion_meses", "");
    const el = document.querySelector(`small[data-error-for="nombre"]`);
    if (el) {
      el.textContent =
        "Error guardando producto. Verifica backend (127.0.0.1:3000)";
      el.style.display = "block";
    }
    console.error(err);
  }
}

async function editarProducto(id, nombre, precio, duracion_meses) {
  // Reusar prompts por ahora; si quieres, creamos otro modal de edición
  const nuevoNombre = prompt("Nuevo nombre:", nombre);
  const nuevoPrecio = prompt("Nuevo precio:", precio);
  const nuevaDur = prompt("Duración meses:", duracion_meses);

  if (nuevoNombre && nuevoPrecio && nuevaDur) {
    await fetch(`${API_PRODUCTOS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevoNombre,
        precio: parseFloat(nuevoPrecio),
        duracion_meses: parseInt(nuevaDur, 10),
      }),
    });
  }

  cargarProductos();
}

async function eliminarProducto(id) {
  if (
    confirm("¿Eliminar este producto? Esto puede afectar compras existentes.")
  ) {
    await fetch(`${API_PRODUCTOS}/${id}`, { method: "DELETE" });
    cargarProductos();
  }
}

