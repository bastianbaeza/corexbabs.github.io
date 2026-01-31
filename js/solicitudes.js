function getBackendBase() {
  const ls = localStorage.getItem("backendBase");
  const resolved = localStorage.getItem("backendBaseResolved");
  const w =
    typeof window !== "undefined" && window.__backendBaseResolved
      ? window.__backendBaseResolved
      : null;
  const candidates = [ls, w, resolved, "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
    .filter(Boolean)
    .map((b) => String(b).replace(/\/$/, "").replace(/\/api$/, ""));
  return [...new Set(candidates)][0];
}

const API_URL = getBackendBase() + "/api";

let solicitudes = [];
let clientes = [];
let solicitudesFiltradas = [];
const CLIENTE_MANUAL_PREFIX = "[cliente_manual]";

// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

// Cerrar sidebar al hacer clic fuera
document.addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector(".nav-toggle");
  if (
    !sidebar.contains(e.target) &&
    !toggle.contains(e.target) &&
    sidebar.classList.contains("active")
  ) {
    sidebar.classList.remove("active");
  }
});

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  await cargarClientes();
  await cargarEstadisticas();
  await cargarSolicitudes();
  await cargarMasPedidas();
  activarAccionRapida();

  const clienteSelect = document.getElementById("cliente-id");
  if (clienteSelect) {
    clienteSelect.addEventListener("change", () => {
      if (clienteSelect.value) {
        document.getElementById("cliente-manual").value = "";
      }
    });
  }
});

function activarAccionRapida() {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash !== "nueva-solicitud") return;
  abrirModal();
  const inputProducto = document.getElementById("producto-servicio");
  if (inputProducto) {
    inputProducto.focus();
  }
}

// Cargar lista de clientes para el select
async function cargarClientes() {
  try {
    const response = await fetch(`${API_URL}/clientes`);
    const data = await response.json();

    const lista = Array.isArray(data) ? data : data.clientes || [];
    clientes = lista;
    const select = document.getElementById("cliente-id");

    // Limpiar opciones anteriores excepto la primera
    select.innerHTML = '<option value="">Sin cliente asociado</option>';

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      const telefono = cliente.telefono ? ` - ${cliente.telefono}` : "";
      option.textContent = `${cliente.nombre}${telefono}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
}

function extraerClienteManual(notas) {
  if (!notas) return "";
  const match = String(notas).match(/\[cliente_manual\]\s*([^|]+)/i);
  return match ? match[1].trim() : "";
}

function limpiarClienteManual(notas) {
  if (!notas) return "";
  return String(notas)
    .replace(/\s*\[cliente_manual\][^|]*(\|\s*)?/i, "")
    .trim();
}

function combinarNotasConCliente(notas, clienteManual) {
  const base = limpiarClienteManual(notas || "");
  if (clienteManual) {
    const pref = `${CLIENTE_MANUAL_PREFIX} ${clienteManual}`;
    return base ? `${pref} | ${base}` : pref;
  }
  return base;
}

// Cargar estadísticas
async function cargarEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/solicitudes/stats`);
    const data = await response.json();

    if (data.ok && data.stats) {
      document.getElementById("stat-total").textContent = data.stats.total || 0;
      document.getElementById("stat-pendientes").textContent =
        data.stats.pendientes || 0;
      document.getElementById("stat-analisis").textContent =
        data.stats.en_analisis || 0;
      document.getElementById("stat-implementadas").textContent =
        data.stats.implementadas || 0;
      document.getElementById("stat-alta-prioridad").textContent =
        data.stats.alta_prioridad || 0;
    }
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

// Cargar productos más pedidos
async function cargarMasPedidas() {
  try {
    const response = await fetch(`${API_URL}/solicitudes/mas-pedidas`);
    const data = await response.json();

    if (data.ok && data.mas_pedidas && data.mas_pedidas.length > 0) {
      const container = document.getElementById("mas-pedidas-container");
      const list = document.getElementById("mas-pedidas-list");

      list.innerHTML = data.mas_pedidas
        .map(
          (item) => `
        <div class="mas-pedidas-item">
          <div>
            <strong>${item.producto}</strong>
            <br>
            <small style="color: #95a5a6;">
              Clientes: ${item.clientes ? item.clientes.join(", ") : "N/A"}
            </small>
          </div>
          <div class="contador-solicitudes">${item.cantidad} solicitudes</div>
        </div>
      `
        )
        .join("");

      container.style.display = "block";
    }
  } catch (error) {
    console.error("Error al cargar productos más pedidos:", error);
  }
}

// Cargar solicitudes
async function cargarSolicitudes() {
  try {
    const response = await fetch(`${API_URL}/solicitudes`);
    const data = await response.json();

    if (data.ok) {
      solicitudes = data.solicitudes || [];
      solicitudesFiltradas = [...solicitudes];
      renderizarTabla();
    }
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }
}

// Renderizar tabla
function renderizarTabla() {
  const tbody = document.getElementById("tabla-solicitudes");
  const emptyState = document.getElementById("empty-state");

  if (solicitudesFiltradas.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tbody.innerHTML = solicitudesFiltradas
    .map(
      (sol) => `
    <tr>
      <td>
        <strong>${sol.producto_servicio}</strong>
        ${
          sol.descripcion
            ? `<br><small style="color: #95a5a6;">${sol.descripcion}</small>`
            : ""
        }
      </td>
      <td>
        ${
          sol.cliente_nombre
            ? `${sol.cliente_nombre}<br><small style="color: #95a5a6;">${sol.cliente_telefono}</small>`
            : extraerClienteManual(sol.notas)
            ? `<span>${extraerClienteManual(sol.notas)}</span>`
            : '<span style="color: #95a5a6;">Sin cliente</span>'
        }
      </td>
      <td>
        <span class="badge badge-tipo-${sol.tipo}">
          ${formatTipo(sol.tipo)}
        </span>
      </td>
      <td>
        <span class="badge badge-estado-${sol.estado}">
          ${formatEstado(sol.estado)}
        </span>
      </td>
      <td>
        <span class="badge badge-prioridad-${sol.prioridad}">
          ${formatPrioridad(sol.prioridad)}
        </span>
      </td>
      <td>${formatFecha(sol.fecha_solicitud)}</td>
      <td>
        <button class="btn-accion btn-editar" onclick="editarSolicitud(${
          sol.id
        })">
          &#9998;&#65039; Editar
        </button>
        <button class="btn-accion" onclick="cotizarDesdeSolicitud(${sol.id})">
          &#128196; Cotizar
        </button>
        <button class="btn-accion btn-eliminar" onclick="eliminarSolicitud(${
          sol.id
        })">
          &#128465;&#65039;
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Filtrar solicitudes
function filtrarSolicitudes() {
  const filtroEstado = document.getElementById("filtro-estado").value;
  const filtroTipo = document.getElementById("filtro-tipo").value;
  const filtroPrioridad = document.getElementById("filtro-prioridad").value;

  solicitudesFiltradas = solicitudes.filter((sol) => {
    let cumple = true;

    if (filtroEstado && sol.estado !== filtroEstado) cumple = false;
    if (filtroTipo && sol.tipo !== filtroTipo) cumple = false;
    if (filtroPrioridad && sol.prioridad !== filtroPrioridad) cumple = false;

    return cumple;
  });

  renderizarTabla();
}

// Abrir modal
function abrirModal() {
  document.getElementById("modal-titulo").textContent = "Nueva Solicitud";
  document.getElementById("form-solicitud").reset();
  document.getElementById("solicitud-id").value = "";
  document.getElementById("cliente-manual").value = "";
  document.getElementById("modal-solicitud").style.display = "block";
}

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal-solicitud").style.display = "none";
}

// Guardar solicitud
async function guardarSolicitud(event) {
  event.preventDefault();

  const id = document.getElementById("solicitud-id").value;
  const clienteId = document.getElementById("cliente-id").value || null;
  const clienteManualInput = document
    .getElementById("cliente-manual")
    .value.trim();
  const notasRaw = document.getElementById("notas").value;
  const clienteManual = clienteId ? "" : clienteManualInput;
  const notasFinal = combinarNotasConCliente(notasRaw, clienteManual);

  const datos = {
    cliente_id: clienteId,
    producto_servicio: document.getElementById("producto-servicio").value,
    descripcion: document.getElementById("descripcion").value,
    tipo: document.getElementById("tipo").value,
    estado: document.getElementById("estado").value,
    prioridad: document.getElementById("prioridad").value,
    notas: notasFinal || null,
    creado_por: "Admin",
  };

  try {
    const url = id ? `${API_URL}/solicitudes/${id}` : `${API_URL}/solicitudes`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (data.ok) {
      alert(data.mensaje);
      cerrarModal();
      await cargarSolicitudes();
      await cargarEstadisticas();
      await cargarMasPedidas();
    } else {
      alert("Error: " + data.mensaje);
    }
  } catch (error) {
    console.error("Error al guardar solicitud:", error);
    alert("Error al guardar la solicitud");
  }
}

// Editar solicitud
async function editarSolicitud(id) {
  const solicitud = solicitudes.find((s) => s.id === id);
  if (!solicitud) return;

  const clienteManual = extraerClienteManual(solicitud.notas);
  const notasLimpias = limpiarClienteManual(solicitud.notas);

  document.getElementById("modal-titulo").textContent = "Editar Solicitud";
  document.getElementById("solicitud-id").value = solicitud.id;
  document.getElementById("cliente-id").value = solicitud.cliente_id || "";
  document.getElementById("cliente-manual").value = clienteManual;
  document.getElementById("producto-servicio").value =
    solicitud.producto_servicio;
  document.getElementById("descripcion").value = solicitud.descripcion || "";
  document.getElementById("tipo").value = solicitud.tipo;
  document.getElementById("estado").value = solicitud.estado;
  document.getElementById("prioridad").value = solicitud.prioridad;
  document.getElementById("notas").value = notasLimpias || "";

  document.getElementById("modal-solicitud").style.display = "block";
}

// Eliminar solicitud
async function eliminarSolicitud(id) {
  if (!confirm("¿Estás seguro de eliminar esta solicitud?")) return;

  try {
    const response = await fetch(`${API_URL}/solicitudes/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.ok) {
      alert("Solicitud eliminada exitosamente");
      await cargarSolicitudes();
      await cargarEstadisticas();
      await cargarMasPedidas();
    } else {
      alert("Error: " + data.mensaje);
    }
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    alert("Error al eliminar la solicitud");
  }
}

// Formatear tipo
function formatTipo(tipo) {
  const tipos = {
    producto: "Producto",
    servicio: "Servicio",
    sugerencia: "Sugerencia",
  };
  return tipos[tipo] || tipo;
}

// Formatear estado
function formatEstado(estado) {
  const estados = {
    pendiente: "Pendiente",
    en_analisis: "En Análisis",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    implementado: "Implementado",
  };
  return estados[estado] || estado;
}

// Formatear prioridad
function formatPrioridad(prioridad) {
  const prioridades = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };
  return prioridades[prioridad] || prioridad;
}

// Formatear fecha
function formatFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
  const modal = document.getElementById("modal-solicitud");
  if (event.target === modal) {
    cerrarModal();
  }
};



function normalizarTelefono(tel) {
  if (!tel) return "";
  return String(tel).replace(/s+/g, "").trim();
}

function clienteKey(sol) {
  if (sol && sol.cliente_id) return `id:${sol.cliente_id}`;
  const tel = normalizarTelefono(sol && sol.cliente_telefono);
  if (tel) return `tel:${tel}`;
  const manual = extraerClienteManual(sol && sol.notas);
  if (manual) return `manual:${manual.toLowerCase()}`;
  return "";
}

function datosClienteDesdeSolicitud(sol) {
  if (!sol) return { nombre: "", telefono: "" };
  if (sol.cliente_nombre) {
    return {
      nombre: sol.cliente_nombre || "",
      telefono: sol.cliente_telefono || "",
    };
  }
  const manual = extraerClienteManual(sol.notas);
  return { nombre: manual || "", telefono: "" };
}

function cotizarDesdeSolicitud(solicitudId) {
  const sol = solicitudes.find((s) => String(s.id) === String(solicitudId));
  if (!sol) {
    alert("No se encontr\u00F3 la solicitud.");
    return;
  }

  const key = clienteKey(sol);
  if (!key) {
    alert(
      "Esta solicitud no tiene cliente asociado. Asocia un cliente o escribe uno manual para cotizar."
    );
    return;
  }

  const items = solicitudes
    .filter((s) => clienteKey(s) === key)
    .filter((s) => ["pendiente", "en_analisis"].includes(String(s.estado)))
    .map((s) => String(s.producto_servicio || "").trim())
    .filter(Boolean);

  const uniqueItems = [...new Set(items)];
  const cliente = datosClienteDesdeSolicitud(sol);
  const labelCliente = cliente.nombre || "cliente";

  const ok = confirm(
    `Crear una cotizaci\u00F3n para ${labelCliente} con ${uniqueItems.length} item(s)?`
  );
  if (!ok) return;

  sessionStorage.setItem(
    "cotizacionPrefill",
    JSON.stringify({
      source: "solicitudes",
      cliente,
      items: uniqueItems.map((nombre) => ({ nombre, cantidad: 1 })),
    })
  );

  window.location.href = "cotizaciones.html";
}

