// frontend/js/soporte.js
// Módulo de Soporte Técnico: tickets y dispositivos

const API_BASE = "http://127.0.0.1:3000/api";
const API_SOPORTE = `${API_BASE}/soporte`;

let clientesCache = [];
let dispositivosCache = [];
let ticketsCache = [];

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-CL");
}

function badgePrioridad(p) {
  const base = "badge";
  if (p === "alta")
    return `<span class="${base} badge-prioridad-alta">Alta</span>`;
  if (p === "baja")
    return `<span class="${base} badge-prioridad-baja">Baja</span>`;
  return `<span class="${base} badge-prioridad-media">Media</span>`;
}

function badgeEstado(e) {
  const base = "badge";
  return `<span class="${base} badge-estado-${e || "abierto"}">${(
    e || "abierto"
  ).replace("_", " ")}</span>`;
}

function renderEstadoSelect(t) {
  const estadoActual = t.estado || "abierto";
  const opciones = [
    { value: "abierto", label: "Abierto" },
    { value: "en_progreso", label: "En progreso" },
    { value: "resuelto", label: "Resuelto" },
    { value: "cerrado", label: "Cerrado" },
  ];
  const optionsHtml = opciones
    .map(
      (op) =>
        `<option value="${op.value}" ${
          op.value === estadoActual ? "selected" : ""
        }>${op.label}</option>`
    )
    .join("");
  return `
    <div class="estado-control">
      <select class="select-estado" data-id="${t.id}" data-prev="${estadoActual}">
        ${optionsHtml}
      </select>
    </div>
  `;
}

async function cargarStats() {
  try {
    const res = await fetch(`${API_SOPORTE}/dashboard`);
    const data = await res.json();
    if (!data.ok) return;
    const s = data.stats;
    document.getElementById("stat-abiertos").textContent = s.tickets_abiertos;
    document.getElementById("stat-alta").textContent = s.tickets_alta_prioridad;
    document.getElementById("stat-sla").textContent = s.tickets_sla_hoy;
    document.getElementById("stat-dispositivos").textContent =
      s.dispositivos_total;
  } catch (err) {
    console.error("Error cargando stats soporte:", err);
  }
}

async function cargarClientes() {
  try {
    const res = await fetch(`${API_BASE}/clientes`);
    const data = await res.json();
    clientesCache = Array.isArray(data) ? data : data.clientes || [];
    const opts = ['<option value="">Cliente (opcional)</option>']
      .concat(
        clientesCache.map((c) => `<option value="${c.id}">${c.nombre}</option>`)
      )
      .join("");
    document.getElementById("ticket-cliente").innerHTML = opts;
    document.getElementById("dispositivo-cliente").innerHTML = opts;
  } catch (err) {
    console.error("Error cargando clientes soporte:", err);
  }
}

async function cargarDispositivos() {
  try {
    const res = await fetch(`${API_SOPORTE}/dispositivos`);
    const data = await res.json();
    dispositivosCache = data.dispositivos || [];
    const opts = ['<option value="">Dispositivo (opcional)</option>']
      .concat(
        dispositivosCache.map(
          (d) =>
            `<option value="${d.id}">${d.nombre}${
              d.cliente_nombre ? " - " + d.cliente_nombre : ""
            }</option>`
        )
      )
      .join("");
    document.getElementById("ticket-dispositivo").innerHTML = opts;
  } catch (err) {
    console.error("Error cargando dispositivos soporte:", err);
  }
}

async function cargarTickets() {
  try {
    const params = new URLSearchParams();
    const estado = document.getElementById("filter-estado").value;
    const prioridad = document.getElementById("filter-prioridad").value;
    const categoria = document.getElementById("filter-categoria").value;
    if (estado) params.append("estado", estado);
    if (prioridad) params.append("prioridad", prioridad);
    if (categoria) params.append("categoria", categoria);

    const url = params.toString()
      ? `${API_SOPORTE}/tickets?${params.toString()}`
      : `${API_SOPORTE}/tickets`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "No se pudo cargar tickets");
    ticketsCache = data.tickets || [];

    const tbody = document.getElementById("tabla-tickets");
    if (!ticketsCache.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" style="text-align:center; color: var(--muted);">Sin tickets</td></tr>';
      return;
    }

    tbody.innerHTML = ticketsCache
      .map((t) => {
        return `
          <tr>
            <td>#${t.id}</td>
            <td>${t.cliente_nombre || "-"}</td>
            <td>${t.titulo || "-"}</td>
            <td>${t.categoria || "-"}</td>
            <td>${badgePrioridad(t.prioridad)}</td>
            <td>${renderEstadoSelect(t)}</td>
            <td>${fmtDate(t.fecha_venc_sla)}</td>
            <td>${fmtDate(t.created_at)}</td>
            <td>
              <button class="btn-link" type="button" data-edit-ticket="${t.id}">
                Editar
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
    bindEstadoSelects();
    bindEditarTickets();
  } catch (err) {
    console.error("Error cargando tickets soporte:", err);
    alert("Error al cargar tickets: " + err.message);
  }
}

async function actualizarEstadoTicket(id, estado) {
  const res = await fetch(`${API_SOPORTE}/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo actualizar el estado");
  }
}

async function crearTicket(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  try {
    const res = await fetch(`${API_SOPORTE}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok)
      throw new Error(data.error || "No se pudo crear el ticket");
    alert("✅ Ticket creado");
    form.reset();
    await Promise.all([cargarTickets(), cargarStats()]);
  } catch (err) {
    console.error("Error creando ticket soporte:", err);
    alert("Error: " + err.message);
  }
}

async function crearDispositivo(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  try {
    const res = await fetch(`${API_SOPORTE}/dispositivos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok)
      throw new Error(data.error || "No se pudo crear el dispositivo");
    alert("✅ Dispositivo guardado");
    form.reset();
    await Promise.all([cargarDispositivos(), cargarStats()]);
  } catch (err) {
    console.error("Error creando dispositivo soporte:", err);
    alert("Error: " + err.message);
  }
}

async function actualizarTicket(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const id = payload.id;
  delete payload.id;
  try {
    const res = await fetch(`${API_SOPORTE}/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok)
      throw new Error(data.error || "No se pudo actualizar el ticket");
    alert("Ticket actualizado");
    closePanel(document.getElementById("panel-editar-ticket"));
    await Promise.all([cargarTickets(), cargarStats()]);
  } catch (err) {
    console.error("Error actualizando ticket:", err);
    alert("Error: " + err.message);
  }
}

function showPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  panel.classList.add("active");
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusPrimerCampo(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const input = panel.querySelector("input, select, textarea");
  if (input) {
    input.focus();
  }
}

function closePanel(panelEl) {
  if (!panelEl) return;
  panelEl.classList.remove("active");
}

function fillCasoHoy() {
  const hoy = new Date().toISOString().split("T")[0];
  const ticketForm = document.getElementById("form-ticket");
  const dispositivoForm = document.getElementById("form-dispositivo");

  if (ticketForm) {
    ticketForm.elements["titulo"].value =
      "Notebook con disco duro quemado";
    ticketForm.elements["categoria"].value = "pc";
    ticketForm.elements["prioridad"].value = "alta";
    ticketForm.elements["estado"].value = "resuelto";
    ticketForm.elements["fecha_venc_sla"].value = hoy;
    ticketForm.elements["asignado_a"].value = "Soporte";
    ticketForm.elements["descripcion"].value =
      "Cliente entrega notebook con disco duro quemado. Se reemplaza disco duro y memoria RAM. Se instala Windows 11 con actualizaciones y drivers. Se instala Office 365.";
    ticketForm.elements["notas_internas"].value =
      "Reemplazo de disco duro, upgrade de memoria RAM, instalacion Windows 11, actualizaciones, drivers, Office 365.";
  }

  if (dispositivoForm) {
    dispositivoForm.elements["nombre"].value = "Notebook cliente";
    dispositivoForm.elements["tipo"].value = "Notebook";
    dispositivoForm.elements["sistema_operativo"].value = "Windows 11";
    dispositivoForm.elements["licencia"].value = "Office 365";
    dispositivoForm.elements["estado"].value = "operativo";
    dispositivoForm.elements["ubicacion"].value = "Taller";
    dispositivoForm.elements["notas"].value =
      "Se reemplaza disco duro y memoria RAM. Instalacion limpia de Windows 11 con actualizaciones y drivers.";
  }
}

function bindEstadoSelects() {
  document.querySelectorAll(".select-estado").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const target = e.target;
      const id = target.dataset.id;
      const nuevoEstado = target.value;
      const prev = target.dataset.prev;
      target.disabled = true;
      try {
        await actualizarEstadoTicket(id, nuevoEstado);
        await Promise.all([cargarTickets(), cargarStats()]);
      } catch (err) {
        console.error("Error actualizando estado:", err);
        alert("Error: " + err.message);
        target.value = prev;
      } finally {
        target.disabled = false;
      }
    });
  });
}

function bindEditarTickets() {
  document.querySelectorAll("[data-edit-ticket]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.editTicket;
      const ticket = ticketsCache.find((t) => String(t.id) === String(id));
      if (!ticket) return;
      const form = document.getElementById("form-ticket-edit");
      form.elements["id"].value = ticket.id;
      form.elements["titulo"].value = ticket.titulo || "";
      form.elements["categoria"].value = ticket.categoria || "";
      form.elements["prioridad"].value = ticket.prioridad || "media";
      form.elements["estado"].value = ticket.estado || "abierto";
      form.elements["fecha_venc_sla"].value = ticket.fecha_venc_sla
        ? ticket.fecha_venc_sla.split("T")[0]
        : "";
      form.elements["asignado_a"].value = ticket.asignado_a || "";
      form.elements["descripcion"].value = ticket.descripcion || "";
      form.elements["notas_internas"].value = ticket.notas_internas || "";
      showPanel("panel-editar-ticket");
    });
  });
}

function bindEventos() {
  document.getElementById("btn-filtrar").addEventListener("click", (e) => {
    e.preventDefault();
    cargarTickets();
  });
  document.getElementById("btn-limpiar").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("filter-estado").value = "";
    document.getElementById("filter-prioridad").value = "";
    document.getElementById("filter-categoria").value = "";
    cargarTickets();
  });

  document
    .getElementById("form-ticket")
    .addEventListener("submit", crearTicket);
  document
    .getElementById("form-dispositivo")
    .addEventListener("submit", crearDispositivo);
  document
    .getElementById("form-ticket-edit")
    .addEventListener("submit", actualizarTicket);

  const accionesBtn = document.getElementById("btn-acciones");
  const accionesMenu = document.getElementById("acciones-menu");
  if (accionesBtn && accionesMenu) {
    accionesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      accionesMenu.classList.toggle("active");
    });
    accionesMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = e.target.closest("[data-panel]");
      if (item) {
        showPanel(item.dataset.panel);
        accionesMenu.classList.remove("active");
      }
    });
    document.addEventListener("click", () => {
      accionesMenu.classList.remove("active");
    });
  }

  document.querySelectorAll("[data-close-panel]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const panel = e.target.closest(".form-panel");
      closePanel(panel);
    });
  });

  document.querySelectorAll("[data-fill-caso]").forEach((btn) => {
    btn.addEventListener("click", () => {
      fillCasoHoy();
    });
  });

  const casoHoyBtn = document.getElementById("btn-caso-hoy");
  if (casoHoyBtn) {
    casoHoyBtn.addEventListener("click", () => {
      fillCasoHoy();
      showPanel("panel-ticket");
      showPanel("panel-dispositivo");
      if (accionesMenu) {
        accionesMenu.classList.remove("active");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEventos();
  activarAccionRapida();
  await Promise.all([cargarClientes(), cargarDispositivos(), cargarStats()]);
  await cargarTickets();
});

function activarAccionRapida() {
  const hash = (window.location.hash || "").replace("#", "");
  if (!hash) return;

  if (hash === "nuevo-ticket") {
    showPanel("panel-ticket");
    focusPrimerCampo("panel-ticket");
    return;
  }
  if (hash === "nuevo-dispositivo") {
    showPanel("panel-dispositivo");
    focusPrimerCampo("panel-dispositivo");
    return;
  }
  if (hash === "caso-hoy") {
    fillCasoHoy();
    showPanel("panel-ticket");
    showPanel("panel-dispositivo");
    focusPrimerCampo("panel-ticket");
  }
}

