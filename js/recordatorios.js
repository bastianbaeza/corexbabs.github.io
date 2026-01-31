const API_URL = "http://127.0.0.1:3000";

let recordatorioEditando = null;
let clientes = [];

// Cargar datos iniciales
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  cargarRecordatorios();
});

// ========== CLIENTES ==========
async function cargarClientes() {
  try {
    const response = await fetch(`${API_URL}/api/clientes`);
    const data = await response.json();
    // El backend de clientes devuelve un array directo, no un objeto { clientes }
    clientes = Array.isArray(data) ? data : data.clientes || [];

    const select = document.getElementById("clienteId");
    select.innerHTML = '<option value="">Seleccione un cliente...</option>';

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = `${cliente.nombre_completo || cliente.nombre}`;
      option.dataset.email = cliente.email || "";
      select.appendChild(option);
    });

    // Auto-completar email cuando se selecciona cliente
    select.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0];
      const email = selectedOption?.dataset.email || "";
      document.getElementById("clienteEmail").value = email;
    });
  } catch (error) {
    console.error("Error cargando clientes:", error);
    alert("Error al cargar lista de clientes");
  }
}

// ========== RECORDATORIOS ==========
async function cargarRecordatorios() {
  try {
    const response = await fetch(`${API_URL}/api/recordatorios`);
    const data = await response.json();

    if (data.ok && data.recordatorios) {
      mostrarRecordatorios(data.recordatorios);
    } else {
      mostrarEstadoVacio();
    }
  } catch (error) {
    console.error("Error cargando recordatorios:", error);
    mostrarEstadoVacio();
  }
}

function mostrarRecordatorios(recordatorios) {
  const grid = document.getElementById("recordatoriosGrid");

  if (recordatorios.length === 0) {
    mostrarEstadoVacio();
    return;
  }

  grid.innerHTML = recordatorios.map((r) => crearCardRecordatorio(r)).join("");
}

function mostrarEstadoVacio() {
  const grid = document.getElementById("recordatoriosGrid");
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h3>No hay recordatorios configurados</h3>
      <p>Crea tu primer recordatorio automático para enviar emails programados</p>
    </div>
  `;
}

function crearCardRecordatorio(r) {
  const items = Array.isArray(r.items) ? r.items : [];
  const total = items.reduce(
    (sum, item) => sum + (parseFloat(item.precio) || 0),
    0
  );

  const estadoClass = r.activo ? "estado-activo" : "estado-inactivo";
  const estadoText = r.activo ? "✅ Activo" : "❌ Inactivo";

  const itemsHTML = items
    .map(
      (item) => `
    <div class="item-row">
      <span class="item-nombre">${item.nombre}</span>
      <span class="item-precio">$${formatearNumero(item.precio)}</span>
    </div>
  `
    )
    .join("");

  return `
    <div class="recordatorio-card">
      <div class="recordatorio-header">
        <div>
          <div class="recordatorio-cliente">${
            r.cliente_nombre || "Cliente sin nombre"
          }</div>
          <div class="recordatorio-email">📧 ${r.cliente_email}</div>
        </div>
        <span class="recordatorio-estado ${estadoClass}">${estadoText}</span>
      </div>

      <div class="recordatorio-info">
        <div class="info-item">
          <span class="info-label">Día del Mes</span>
          <span class="info-value">📅 Día ${r.dia_mes}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Hora de Envío</span>
          <span class="info-value">⏰ ${r.hora}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Concepto</span>
          <span class="info-value">${r.concepto}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total a Cobrar</span>
          <span class="info-value" style="color: #27ae60; font-size: 1.2rem;">$${formatearNumero(
            total
          )}</span>
        </div>
      </div>

      ${
        items.length > 0
          ? `
        <div class="recordatorio-items">
          <div class="items-title">📦 Items del Cobro:</div>
          ${itemsHTML}
        </div>
      `
          : ""
      }

      <div class="recordatorio-acciones">
        <button class="btn-accion btn-editar" onclick="editarRecordatorio(${
          r.id
        })">
          ✏️ Editar
        </button>
        <button class="btn-accion btn-test" onclick="enviarTest(${r.id})">
          📨 Enviar Test
        </button>
        <button class="btn-accion btn-historial" onclick="verHistorial(${
          r.id
        })">
          📊 Historial
        </button>
        <button class="btn-accion btn-eliminar" onclick="eliminarRecordatorio(${
          r.id
        })">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `;
}

// ========== MODAL ==========
function abrirModalNuevo() {
  recordatorioEditando = null;
  document.getElementById("modalTitulo").textContent = "Nuevo Recordatorio";
  document.getElementById("formRecordatorio").reset();
  document.getElementById("activo").checked = true;
  document.getElementById("hora").value = "09:00";
  document.getElementById("itemsList").innerHTML = "";
  agregarItem(); // Agregar un item inicial
  document.getElementById("modalRecordatorio").classList.add("active");
}

async function editarRecordatorio(id) {
  try {
    const response = await fetch(`${API_URL}/api/recordatorios/${id}`);
    const data = await response.json();

    if (data.ok && data.recordatorio) {
      recordatorioEditando = data.recordatorio;
      llenarFormulario(data.recordatorio);
      document.getElementById("modalTitulo").textContent =
        "Editar Recordatorio";
      document.getElementById("modalRecordatorio").classList.add("active");
    }
  } catch (error) {
    console.error("Error cargando recordatorio:", error);
    alert("Error al cargar el recordatorio");
  }
}

function llenarFormulario(r) {
  document.getElementById("clienteId").value = r.cliente_id || "";
  document.getElementById("clienteEmail").value = r.cliente_email || "";
  document.getElementById("asunto").value = r.asunto || "";
  document.getElementById("concepto").value = r.concepto || "";
  document.getElementById("diaMes").value = r.dia_mes || "";
  document.getElementById("hora").value = r.hora || "09:00";
  document.getElementById("activo").checked = r.activo !== false;

  // Llenar items
  const itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = "";

  if (Array.isArray(r.items) && r.items.length > 0) {
    r.items.forEach((item) => {
      agregarItem(item.nombre, item.precio);
    });
  } else {
    agregarItem();
  }

  // Llenar datos de cuenta
  const datosCuenta = r.datos_cuenta || {};
  document.getElementById("cuentaTitulo").value = datosCuenta.titulo || "";
  document.getElementById("cuentaTitular").value = datosCuenta.titular || "";
  document.getElementById("cuentaRut").value = datosCuenta.rut || "";
  document.getElementById("cuentaNumero").value = datosCuenta.numero || "";
}

function cerrarModal() {
  document.getElementById("modalRecordatorio").classList.remove("active");
  recordatorioEditando = null;
}

// ========== ITEMS ==========
function agregarItem(nombre = "", precio = "") {
  const itemsList = document.getElementById("itemsList");
  const itemDiv = document.createElement("div");
  itemDiv.className = "item-form";
  itemDiv.innerHTML = `
    <input type="text" class="item-nombre" placeholder="Nombre del producto/servicio" value="${nombre}" required>
    <input type="number" class="item-precio" placeholder="Precio" value="${precio}" step="0.01" min="0" required>
    <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">🗑️</button>
  `;
  itemsList.appendChild(itemDiv);
}

// ========== GUARDAR ==========
document
  .getElementById("formRecordatorio")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recolectar items
    const itemsElements = document.querySelectorAll(".item-form");
    const items = Array.from(itemsElements)
      .map((el) => {
        const nombre = el.querySelector(".item-nombre").value.trim();
        const precio = parseFloat(el.querySelector(".item-precio").value) || 0;
        return { nombre, precio };
      })
      .filter((item) => item.nombre); // Filtrar items vacíos

    // Recolectar datos de cuenta
    const datosCuenta = {
      titulo: document.getElementById("cuentaTitulo").value.trim(),
      titular: document.getElementById("cuentaTitular").value.trim(),
      rut: document.getElementById("cuentaRut").value.trim(),
      numero: document.getElementById("cuentaNumero").value.trim(),
    };

    // Obtener nombre del cliente seleccionado
    const clienteSelect = document.getElementById("clienteId");
    const clienteNombre = clienteSelect.selectedOptions[0]?.textContent || "";

    const recordatorio = {
      cliente_id: parseInt(document.getElementById("clienteId").value) || null,
      cliente_nombre: clienteNombre,
      cliente_email: document.getElementById("clienteEmail").value.trim(),
      asunto: document.getElementById("asunto").value.trim(),
      concepto: document.getElementById("concepto").value.trim(),
      items: items,
      datos_cuenta: datosCuenta,
      dia_mes: parseInt(document.getElementById("diaMes").value),
      hora: document.getElementById("hora").value,
      activo: document.getElementById("activo").checked,
    };

    try {
      let response;
      if (recordatorioEditando) {
        // Actualizar
        response = await fetch(
          `${API_URL}/api/recordatorios/${recordatorioEditando.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recordatorio),
          }
        );
      } else {
        // Crear nuevo
        response = await fetch(`${API_URL}/api/recordatorios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordatorio),
        });
      }

      const data = await response.json();

      if (data.ok) {
        alert(
          recordatorioEditando
            ? "Recordatorio actualizado correctamente"
            : "Recordatorio creado correctamente"
        );
        cerrarModal();
        cargarRecordatorios();
      } else {
        alert("Error: " + (data.error || "No se pudo guardar el recordatorio"));
      }
    } catch (error) {
      console.error("Error guardando recordatorio:", error);
      alert("Error al guardar el recordatorio");
    }
  });

// ========== ACCIONES ==========
async function eliminarRecordatorio(id) {
  if (
    !confirm(
      "¿Estás seguro de eliminar este recordatorio? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/recordatorios/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.ok) {
      alert("Recordatorio eliminado correctamente");
      cargarRecordatorios();
    } else {
      alert("Error al eliminar: " + (data.error || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error eliminando recordatorio:", error);
    alert("Error al eliminar el recordatorio");
  }
}

async function enviarTest(id) {
  if (!confirm("¿Enviar un email de prueba ahora con este recordatorio?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/recordatorios/${id}/test`, {
      method: "POST",
    });
    const data = await response.json();

    if (data.ok) {
      alert(
        "✅ Email de prueba enviado correctamente!\n\nRevisa la bandeja de entrada del destinatario."
      );
    } else {
      alert("❌ Error al enviar email: " + (data.error || "Error desconocido"));
    }
  } catch (error) {
    console.error("Error enviando test:", error);
    alert("Error al enviar el email de prueba");
  }
}

async function verHistorial(id) {
  try {
    const response = await fetch(
      `${API_URL}/api/recordatorios/historial/${id}`
    );
    const data = await response.json();

    if (data.ok && data.historial) {
      mostrarModalHistorial(data.historial);
    } else {
      alert("No hay historial disponible para este recordatorio");
    }
  } catch (error) {
    console.error("Error cargando historial:", error);
    alert("Error al cargar el historial");
  }
}

function mostrarModalHistorial(historial) {
  if (historial.length === 0) {
    alert("No se han enviado emails todavía para este recordatorio");
    return;
  }

  const historialHTML = historial
    .map(
      (h) => `
    <div style="padding: 10px; border-bottom: 1px solid #ecf0f1;">
      <strong>📅 ${new Date(h.fecha_envio).toLocaleString("es-CL")}</strong><br>
      Estado: ${h.exitoso ? "✅ Enviado" : "❌ Error"}<br>
      ${h.error_mensaje ? `Error: ${h.error_mensaje}` : ""}
    </div>
  `
    )
    .join("");

  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>📊 Historial de Envíos</h2>
        <button class="btn-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
        ${historialHTML}
      </div>
      <div class="modal-footer">
        <button class="btn-cancelar" onclick="this.closest('.modal').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// ========== UTILIDADES ==========
function formatearNumero(num) {
  return new Intl.NumberFormat("es-CL").format(num || 0);
}

