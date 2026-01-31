// frontend/js/clientes.js
// Gestión de clientes

const API_URL = "http://127.0.0.1:3000/api/clientes";
let clientes = [];
let clienteEnEdicion = null;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  cargarEstadisticas();
  activarAccionRapida();
});

function activarAccionRapida() {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash !== "nuevo") return;
  abrirModalNuevo();
  const inputNombre = document.getElementById("nombre");
  if (inputNombre) {
    inputNombre.focus();
  }
}

// ============== CARGA DE DATOS ==============

async function cargarClientes() {
  try {
    const response = await fetch(API_URL);
    clientes = await response.json();
    renderizarTabla(clientes);
    aplicarEstadisticas(calcularStatsDesdeClientes(clientes));
  } catch (error) {
    console.error("Error cargando clientes:", error);
    alert("Error al cargar los clientes");
  }
}

async function cargarEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/stats/resumen`);
    const stats = await response.json();

    const base = calcularStatsDesdeClientes(clientes);
    aplicarEstadisticas({
      total_clientes: stats.total_clientes ?? stats.total ?? base.total_clientes,
      clientes_activos: stats.clientes_activos ?? base.clientes_activos,
      compras_totales: stats.compras_totales ?? base.compras_totales,
      contacto_whatsapp: stats.contacto_whatsapp ?? base.contacto_whatsapp,
      contacto_instagram: stats.contacto_instagram ?? base.contacto_instagram,
    });
  } catch (error) {
    console.error("Error cargando estad?sticas:", error);
  }
}

// ============== RENDERIZADO ==============

function renderizarTabla(clientesAMostrar) {
  const tbody = document.getElementById("tabla-clientes");
  const emptyState = document.getElementById("empty-state");

  if (clientesAMostrar.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tbody.innerHTML = clientesAMostrar
    .map((cliente) => {
      const contactos = [];
      if (cliente.telefono) contactos.push(`📱 ${cliente.telefono}`);
      if (cliente.email) contactos.push(`📧 ${cliente.email}`);
      if (cliente.instagram) contactos.push(`📷 @${cliente.instagram}`);

      const contactoHtml =
        contactos.length > 0
          ? contactos.slice(0, 2).join("<br>") +
            (contactos.length > 2 ? "<br>..." : "")
          : "-";

      return `
      <tr>
        <td>#${cliente.id}</td>
        <td><strong>${cliente.nombre}</strong></td>
        <td>${contactoHtml}</td>
        <td><span class="badge badge-${
          cliente.medio_contacto
        }">${formatearMedio(cliente.medio_contacto)}</span></td>
        <td>${cliente.total_compras || 0}</td>
        <td><span class="badge badge-${cliente.estado}">${
        cliente.estado
      }</span></td>
        <td>${formatearFecha(cliente.fecha_registro)}</td>
        <td>
          <div class="acciones-td">
            <button class="btn-mini btn-ver" onclick="verDetalles(${
              cliente.id
            })">👁️ Ver</button>
            <button class="btn-mini btn-editar" onclick="editarCliente(${
              cliente.id
            })">✏️ Editar</button>
            <button class="btn-mini btn-eliminar" onclick="eliminarCliente(${
              cliente.id
            })">🗑️</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

function formatearMedio(medio) {
  const medios = {
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    email: "Email",
    facebook: "Facebook",
    twitter: "Twitter",
    otro: "Otro",
  };
  return medios[medio] || medio;
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES");
}

function formatearMontoClp(monto) {
  if (monto === null || monto === undefined) return "-";
  const numero = Number(monto);
  if (Number.isNaN(numero)) return String(monto);
  return numero.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

// ============== FILTROS ==============

function aplicarFiltros() {
  const filtroEstado = document.getElementById("filtro-estado").value;
  const filtroMedio = document.getElementById("filtro-medio").value;
  const filtroBuscar = document
    .getElementById("filtro-buscar")
    .value.toLowerCase();

  let clientesFiltrados = [...clientes];

  if (filtroEstado) {
    clientesFiltrados = clientesFiltrados.filter(
      (c) => c.estado === filtroEstado
    );
  }

  if (filtroMedio) {
    clientesFiltrados = clientesFiltrados.filter(
      (c) => c.medio_contacto === filtroMedio
    );
  }

  if (filtroBuscar) {
    clientesFiltrados = clientesFiltrados.filter(
      (c) =>
        (c.nombre && c.nombre.toLowerCase().includes(filtroBuscar)) ||
        (c.telefono && c.telefono.toLowerCase().includes(filtroBuscar)) ||
        (c.email && c.email.toLowerCase().includes(filtroBuscar)) ||
        (c.instagram && c.instagram.toLowerCase().includes(filtroBuscar))
    );
  }

  renderizarTabla(clientesFiltrados);
}

// ============== MODAL NUEVO/EDITAR ==============

function abrirModalNuevo() {
  clienteEnEdicion = null;
  document.getElementById("modal-title").textContent = "Nuevo Cliente";
  document.getElementById("form-cliente").reset();
  document.getElementById("modal-cliente").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-cliente").classList.remove("active");
  clienteEnEdicion = null;
}

async function guardarCliente(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = {
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono") || null,
    email: formData.get("email") || null,
    instagram: formData.get("instagram") || null,
    facebook: formData.get("facebook") || null,
    twitter: formData.get("twitter") || null,
    medio_contacto: formData.get("medio_contacto"),
    notas: formData.get("notas") || null,
    estado: formData.get("estado") || "activo",
  };

  try {
    let response;

    if (clienteEnEdicion) {
      // Actualizar
      response = await fetch(`${API_URL}/${clienteEnEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Crear nuevo
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    const result = await response.json();

    if (response.ok && (result.ok || result.id)) {
      alert(
        clienteEnEdicion
          ? "✅ Cliente actualizado correctamente"
          : "✅ Cliente creado correctamente"
      );
      cerrarModal();
      cargarClientes();
      cargarEstadisticas();
      clienteEnEdicion = null;
    } else {
      alert("❌ Error: " + (result.error || "No se pudo guardar el cliente"));
    }
  } catch (error) {
    console.error("Error guardando cliente:", error);
    alert("❌ Error al guardar el cliente");
  }
}

async function editarCliente(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();

    clienteEnEdicion = id;
    document.getElementById("modal-title").textContent = "Editar Cliente";

    // Llenar formulario
    document.getElementById("nombre").value = data.nombre || "";
    document.getElementById("telefono").value = data.telefono || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("instagram").value = data.instagram || "";
    document.getElementById("facebook").value = data.facebook || "";
    document.getElementById("twitter").value = data.twitter || "";
    document.getElementById("medio_contacto").value =
      data.medio_contacto || "whatsapp";
    document.getElementById("notas").value = data.notas || "";
    document.getElementById("estado").value = data.estado || "activo";

    document.getElementById("modal-cliente").classList.add("active");
  } catch (error) {
    console.error("Error cargando cliente:", error);
    alert("❌ Error al cargar los datos del cliente");
  }
}

// ============== MODAL DETALLES ==============

async function verDetalles(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const cliente = await response.json();

    const contactos = [];
    if (cliente.telefono)
      contactos.push(`📱 <strong>Teléfono:</strong> ${cliente.telefono}`);
    if (cliente.email)
      contactos.push(`📧 <strong>Email:</strong> ${cliente.email}`);
    if (cliente.instagram)
      contactos.push(`📷 <strong>Instagram:</strong> @${cliente.instagram}`);
    if (cliente.facebook)
      contactos.push(`👤 <strong>Facebook:</strong> ${cliente.facebook}`);
    if (cliente.twitter)
      contactos.push(`🐦 <strong>Twitter:</strong> @${cliente.twitter}`);
    const resumenVentas = cliente.resumen_ventas || {};
    const resumenHtml = `
      <div class="info-section">
        <h3>�Y"S Resumen de Compras</h3>
        <div class="info-row">
          <span class="info-label">Total de compras:</span>
          <span class="info-value">${resumenVentas.total_ventas || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pagadas:</span>
          <span class="info-value">${resumenVentas.ventas_pagadas || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pendientes:</span>
          <span class="info-value">${resumenVentas.ventas_pendientes || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total gastado (CLP):</span>
          <span class="info-value">${formatearMontoClp(
            resumenVentas.total_gastado_clp
          )}</span>
        </div>
      </div>
    `;

    let historialHtml = "";
    if (cliente.historial_compras && cliente.historial_compras.length > 0) {
      historialHtml = `
        <div class="info-section">
          <h3>�Y"� Historial de Compras (ultimas 25)</h3>
          <table style="width: 100%; margin-top: 10px; font-size: 12px;">
            <thead>
              <tr style="background: #ecf0f1;">
                <th style="padding: 8px;">Producto</th>
                <th style="padding: 8px;">Fecha Compra</th>
                <th style="padding: 8px;">Vencimiento</th>
                <th style="padding: 8px;">Estado</th>
                <th style="padding: 8px;">Medio</th>
                <th style="padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cliente.historial_compras
                .map(
                  (compra) => `
                <tr>
                  <td style="padding: 8px;">${
                    compra.producto_nombre || "-"
                  }</td>
                  <td style="padding: 8px;">${formatearFecha(
                    compra.fecha_compra
                  )}</td>
                  <td style="padding: 8px;">${formatearFecha(
                    compra.fecha_vencimiento
                  )}</td>
                  <td style="padding: 8px;"><span class="badge">${
                    compra.estado || "pendiente"
                  }</span></td>
                  <td style="padding: 8px;">${compra.medio_pago || "-"}</td>
                  <td style="padding: 8px;">${formatearMontoClp(
                    compra.precio_venta_clp
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    } else {
      historialHtml = `
        <div class="info-section">
          <h3>�Y"� Historial de Compras</h3>
          <p style="margin: 10px 0; color: #7f8c8d;">Sin compras registradas.</p>
        </div>
      `;
    }

    const html = `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #3498db; margin-bottom: 10px;">${cliente.nombre}</h3>
        <span class="badge badge-${
          cliente.estado
        }">${cliente.estado.toUpperCase()}</span>
        <span class="badge badge-${
          cliente.medio_contacto
        }" style="margin-left: 10px;">
          Preferencia: ${formatearMedio(cliente.medio_contacto)}
        </span>
      </div>

      <div class="info-section">
        <h3>📞 Información de Contacto</h3>
        ${
          contactos.length > 0
            ? contactos
                .map((c) => `<p style="margin: 5px 0;">${c}</p>`)
                .join("")
            : "<p>Sin información de contacto</p>"
        }
      </div>

      <div class="info-section">
        <h3>📊 Estadísticas</h3>
        <div class="info-row">
          <span class="info-label">Total de Compras:</span>
          <span class="info-value">${cliente.total_compras || 0}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de Registro:</span>
          <span class="info-value">${formatearFecha(
            cliente.fecha_registro
          )}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Última Compra:</span>
          <span class="info-value">${
            formatearFecha(cliente.ultima_compra) || "Sin compras"
          }</span>
        </div>
      </div>

      ${resumenHtml}
      ${
        cliente.notas
          ? `
        <div class="info-section">
          <h3>📝 Notas</h3>
          <p style="margin: 10px 0; color: #7f8c8d;">${cliente.notas}</p>
        </div>
      `
          : ""
      }

      ${historialHtml}
    `;

    document.getElementById("detalles-content").innerHTML = html;
    document.getElementById("modal-detalles").classList.add("active");
  } catch (error) {
    console.error("Error cargando detalles:", error);
    alert("❌ Error al cargar los detalles del cliente");
  }
}

function cerrarModalDetalles() {
  document.getElementById("modal-detalles").classList.remove("active");
}

// ============== ELIMINAR CLIENTE ==============

async function eliminarCliente(id) {
  if (
    !confirm(
      "⚠️ ¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE este cliente de la base de datos? Esta acción NO se puede deshacer."
    )
  )
    return;

  // Segunda confirmación para ser extra seguro
  if (
    !confirm(
      "⚠️ ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los datos del cliente. ¿Deseas continuar?"
    )
  )
    return;

  try {
    const response = await fetch(`${API_URL}/${id}?permanente=true`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("✅ Cliente eliminado permanentemente de la base de datos");
      cargarClientes();
      cargarEstadisticas();
    } else {
      const error = await response.json();
      alert("❌ Error: " + (error.error || "No se pudo eliminar el cliente"));
    }
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    alert("❌ Error al eliminar el cliente");
  }
}


function calcularStatsDesdeClientes(lista) {
  const total_clientes = Array.isArray(lista) ? lista.length : 0;
  let clientes_activos = 0;
  let compras_totales = 0;
  let contacto_whatsapp = 0;
  let contacto_instagram = 0;

  if (Array.isArray(lista)) {
    lista.forEach((cliente) => {
      if (cliente.estado === "activo") clientes_activos += 1;
      if (cliente.medio_contacto === "whatsapp") contacto_whatsapp += 1;
      if (cliente.medio_contacto === "instagram") contacto_instagram += 1;
      compras_totales += Number(cliente.total_compras || 0);
    });
  }

  return {
    total_clientes,
    clientes_activos,
    compras_totales,
    contacto_whatsapp,
    contacto_instagram,
  };
}

function aplicarEstadisticas(stats) {
  document.getElementById("stat-total").textContent =
    stats.total_clientes || 0;
  document.getElementById("stat-activos").textContent =
    stats.clientes_activos || 0;
  document.getElementById("stat-compras").textContent =
    stats.compras_totales || 0;
  document.getElementById("stat-whatsapp").textContent =
    stats.contacto_whatsapp || 0;
  document.getElementById("stat-instagram").textContent =
    stats.contacto_instagram || 0;
}





