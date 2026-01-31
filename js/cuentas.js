// frontend/js/cuentas.js
// JavaScript para gestión de cuentas compartidas

const API_URL = "http://127.0.0.1:3000/api";
let cuentasData = [];
let productosData = [];
let clientesData = [];

// ==================== INICIALIZACIÓN ====================

document.addEventListener("DOMContentLoaded", () => {
  cargarResumen();
  cargarCuentas();
  cargarProductos();
  cargarClientes();
  verificarAlertas();
});

// ==================== CARGAR DATOS ====================

async function cargarResumen() {
  try {
    const res = await fetch(`${API_URL}/cuentas/resumen`);
    const data = await res.json();

    document.getElementById("statTotalCuentas").textContent =
      data.total_cuentas || 0;
    document.getElementById("statSlotsDisponibles").textContent =
      data.slots_disponibles || 0;
    document.getElementById("statSlotsOcupados").textContent =
      data.slots_ocupados || 0;
    document.getElementById("statPorExpirar").textContent =
      data.slots_por_vencer || 0;

    // Colorear estadísticas según valores
    if (data.slots_disponibles < 3) {
      document.getElementById("statSlotsDisponibles").style.color = "#f44336";
    }
    if (data.slots_por_vencer > 0) {
      document.getElementById("statPorExpirar").style.color = "#ff9800";
    }
  } catch (err) {
    console.error("Error al cargar resumen:", err);
  }
}

async function cargarCuentas() {
  try {
    const res = await fetch(`${API_URL}/cuentas`);
    const data = await res.json();
    cuentasData = data.cuentas || data || [];
    renderizarCuentas();
  } catch (err) {
    console.error("Error al cargar cuentas:", err);
    alert("Error al cargar cuentas: " + err.message);
  }
}

async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/catalogo`);
    productosData = await res.json();

    // Llenar select de productos
    const select = document.getElementById("cuentaProductoId");
    select.innerHTML = '<option value="">Seleccionar...</option>';
    productosData.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.nombre} - ${p.duracion}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
}

async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    clientesData = await res.json();

    // Llenar select de clientes
    const select = document.getElementById("slotClienteId");
    select.innerHTML = '<option value="">Seleccionar cliente...</option>';
    clientesData.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.nombre} - ${c.telefono || "Sin teléfono"}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar clientes:", err);
  }
}

async function verificarAlertas() {
  try {
    const res = await fetch(`${API_URL}/cuentas/slots-liberar`);
    const slotsVencidos = await res.json();

    const container = document.getElementById("alertasContainer");
    container.innerHTML = "";

    if (slotsVencidos.length > 0) {
      const alerta = document.createElement("div");
      alerta.className = "alerta";
      alerta.innerHTML = `
        <strong>⚠️ Atención:</strong> Hay ${slotsVencidos.length} slot(s) vencido(s) que deben ser liberados.
        <button class="btn-secondary" onclick="verSlotsALiberar()" style="margin-left: 10px;">
          Ver detalles
        </button>
      `;
      container.appendChild(alerta);
    }
  } catch (err) {
    console.error("Error al verificar alertas:", err);
  }
}

// ==================== RENDERIZAR ====================

function renderizarCuentas() {
  const grid = document.getElementById("cuentasGrid");
  grid.innerHTML = "";

  if (cuentasData.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay cuentas registradas</p>';
    return;
  }

  cuentasData.forEach((cuenta) => {
    const porcentajeOcupado =
      (cuenta.slots_ocupados / cuenta.slots_totales) * 100;
    const esLlena = cuenta.slots_ocupados >= cuenta.slots_totales;
    const esExpirada =
      cuenta.fecha_expiracion && new Date(cuenta.fecha_expiracion) < new Date();

    let claseCard = "cuenta-card";
    if (esExpirada) claseCard += " expirada";
    else if (esLlena) claseCard += " llena";

    const card = document.createElement("div");
    card.className = claseCard;
    card.innerHTML = `
      <div class="cuenta-header">
        <div class="cuenta-titulo">${
          cuenta.producto_nombre || "Sin producto"
        }</div>
        <span class="cuenta-estado estado-${cuenta.estado}">
          ${cuenta.estado}
        </span>
      </div>
      
      <div class="cuenta-info">
        <strong>Usuario:</strong> ${cuenta.usuario}
      </div>
      
      <div class="cuenta-info">
        <strong>Proveedor:</strong> ${cuenta.proveedor || "N/A"}
      </div>

      ${
        cuenta.proximo_pago
          ? `
        <div class="cuenta-info">
          <strong>Próximo pago:</strong> ${formatearFecha(cuenta.proximo_pago)}
          ${badgePagoEstado(cuenta.pago_estado)}
        </div>
      `
          : cuenta.pago_estado
          ? `
        <div class="cuenta-info">
          <strong>Pago:</strong> ${badgePagoEstado(cuenta.pago_estado)}
        </div>
      `
          : ""
      }
      
      ${
        cuenta.fecha_expiracion
          ? `
        <div class="cuenta-info">
          <strong>Expira:</strong> ${formatearFecha(cuenta.fecha_expiracion)}
          ${
            esExpirada ? '<span style="color: #f44336;">⚠️ EXPIRADA</span>' : ""
          }
        </div>
      `
          : ""
      }
      
      <div class="slots-info">
        <div class="slots-bar">
          <div class="slots-fill" style="width: ${porcentajeOcupado}%"></div>
        </div>
        <div class="slots-texto">
          ${cuenta.slots_ocupados}/${cuenta.slots_totales} slots
        </div>
      </div>
      
      <div class="cuenta-acciones">
        <button class="btn-detalle" onclick="verDetalleCuenta(${cuenta.id})">
          Ver Detalle
        </button>
        <button class="btn-editar" onclick="editarCuenta(${cuenta.id})">
          ✏️
        </button>
        <button class="btn-eliminar" onclick="eliminarCuenta(${cuenta.id})">
          🗑️
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function badgePagoEstado(estado) {
  const st = String(estado || "").toLowerCase();
  if (!st) return "";
  if (st === "pagado")
    return '<span style="margin-left:8px;padding:3px 8px;border-radius:10px;background:#d4edda;color:#155724;font-weight:700;font-size:12px;">Pagado</span>';
  if (st === "pendiente")
    return '<span style="margin-left:8px;padding:3px 8px;border-radius:10px;background:#fff3cd;color:#856404;font-weight:700;font-size:12px;">Pendiente</span>';
  if (st === "cancelado")
    return '<span style="margin-left:8px;padding:3px 8px;border-radius:10px;background:#f8d7da;color:#721c24;font-weight:700;font-size:12px;">Cancelado</span>';
  return `<span style="margin-left:8px;padding:3px 8px;border-radius:10px;background:#e0e0e0;color:#333;font-weight:700;font-size:12px;">${estado}</span>`;
}

// ==================== MODAL CUENTA ====================

function abrirModalNuevaCuenta() {
  document.getElementById("modalCuentaTitulo").textContent = "Nueva Cuenta";
  document.getElementById("formCuenta").reset();
  document.getElementById("cuentaId").value = "";

  // Establecer fecha de expiración predeterminada (1 mes)
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  document.getElementById("cuentaExpiracion").value = fecha
    .toISOString()
    .split("T")[0];

  abrirModal("modalCuenta");
}

async function editarCuenta(id) {
  try {
    const res = await fetch(`${API_URL}/cuentas/${id}`);
    const data = await res.json();
    const cuenta = data.cuenta || data;

    document.getElementById("modalCuentaTitulo").textContent = "Editar Cuenta";
    document.getElementById("cuentaId").value = cuenta.id;
    document.getElementById("cuentaProductoId").value =
      cuenta.producto_id || "";
    document.getElementById("cuentaUsuario").value = cuenta.usuario;
    document.getElementById("cuentaContrasena").value = cuenta.contrasena;
    document.getElementById("cuentaPin").value = cuenta.pin || "";
    document.getElementById("cuentaPerfil").value = cuenta.perfil || "";
    document.getElementById("cuentaSlotsTotal").value =
      cuenta.slots_totales || 1;
    document.getElementById("cuentaProveedor").value = cuenta.proveedor || "";
    document.getElementById("cuentaPrecio").value =
      cuenta.precio_compra_real || "";
    document.getElementById("cuentaExpiracion").value = cuenta.fecha_expiracion
      ? cuenta.fecha_expiracion.split("T")[0]
      : "";
    document.getElementById("cuentaTotp").value = cuenta.secreto_totp || "";
    document.getElementById("cuentaNotas").value = cuenta.notas || "";

    abrirModal("modalCuenta");
  } catch (err) {
    console.error("Error al cargar cuenta:", err);
    alert("Error al cargar datos de la cuenta");
  }
}

async function guardarCuenta(event) {
  event.preventDefault();

  const id = document.getElementById("cuentaId").value;
  const datos = {
    producto_id: document.getElementById("cuentaProductoId").value,
    usuario: document.getElementById("cuentaUsuario").value,
    contrasena: document.getElementById("cuentaContrasena").value,
    pin: document.getElementById("cuentaPin").value || null,
    perfil: document.getElementById("cuentaPerfil").value || null,
    slots_totales: parseInt(document.getElementById("cuentaSlotsTotal").value),
    proveedor: document.getElementById("cuentaProveedor").value || null,
    precio_compra_real:
      parseFloat(document.getElementById("cuentaPrecio").value) || null,
    fecha_expiracion: document.getElementById("cuentaExpiracion").value || null,
    secreto_totp: document.getElementById("cuentaTotp").value || null,
    notas: document.getElementById("cuentaNotas").value || null,
  };

  try {
    const url = id ? `${API_URL}/cuentas/${id}` : `${API_URL}/cuentas`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al guardar");
    }

    alert(
      id ? "Cuenta actualizada correctamente" : "Cuenta creada correctamente"
    );
    cerrarModal("modalCuenta");
    cargarCuentas();
    cargarResumen();
  } catch (err) {
    console.error("Error al guardar cuenta:", err);
    alert("Error: " + err.message);
  }
}

async function eliminarCuenta(id) {
  if (!confirm("¿Está seguro de eliminar esta cuenta?")) return;

  try {
    const res = await fetch(`${API_URL}/cuentas/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al eliminar");
    }

    alert("Cuenta eliminada correctamente");
    cargarCuentas();
    cargarResumen();
  } catch (err) {
    console.error("Error al eliminar cuenta:", err);
    alert("Error: " + err.message);
  }
}

// ==================== DETALLE CUENTA ====================

async function verDetalleCuenta(id) {
  try {
    const res = await fetch(`${API_URL}/cuentas/${id}`);
    const data = await res.json();
    const cuenta = data.cuenta || data;

    const contenido = document.getElementById("detalleContenido");
    document.getElementById("detalleTitulo").textContent =
      cuenta.producto_nombre || "Cuenta";

    let slotsHTML = "";
    if (cuenta.slots && cuenta.slots.length > 0) {
      slotsHTML = '<div class="slots-list">';
      cuenta.slots.forEach((slot) => {
        const esVencido =
          slot.fecha_vencimiento &&
          new Date(slot.fecha_vencimiento) < new Date();
        const esPorVencer =
          slot.fecha_vencimiento &&
          new Date(slot.fecha_vencimiento) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        let claseSlot = "slot-item";
        if (slot.estado !== "activo") claseSlot += " liberado";
        else if (esVencido) claseSlot += " vencido";
        else if (esPorVencer) claseSlot += " por-vencer";

        slotsHTML += `
          <div class="${claseSlot}">
            <div class="slot-header">
              <div>
                <div class="slot-cliente">${
                  slot.cliente_nombre || "Sin asignar"
                }</div>
                <div class="slot-fecha">
                  ${slot.cliente_telefono || ""} 
                  ${slot.cliente_estado ? `(${slot.cliente_estado})` : ""}
                </div>
              </div>
              <div>
                ${
                  slot.fecha_vencimiento
                    ? `<div class="slot-fecha">Vence: ${formatearFecha(
                        slot.fecha_vencimiento
                      )}</div>`
                    : ""
                }
                ${
                  slot.estado === "activo"
                    ? `
                  <button class="btn-liberar" onclick="confirmarLiberarSlot(${slot.id})">
                    Liberar Slot
                  </button>
                `
                    : `<span style="color: #999;">Estado: ${slot.estado}</span>`
                }
              </div>
            </div>
            ${
              slot.notas
                ? `<div style="margin-top: 8px; font-size: 12px; color: #666;">${slot.notas}</div>`
                : ""
            }
          </div>
        `;
      });
      slotsHTML += "</div>";
    } else {
      slotsHTML = '<p style="color: #999;">No hay slots asignados</p>';
    }

    // Mostrar/ocultar contraseña
    let passVisible = false;

    contenido.innerHTML = `
      <div class="credenciales">
        <strong>Usuario:</strong> ${cuenta.usuario}<br>
        <strong>Contraseña:</strong> 
        <span id="passTexto" class="credenciales-ocultas">${
          cuenta.contrasena
        }</span>
        <button class="btn-toggle-pass" onclick="togglePassword()">
          👁️ Mostrar
        </button><br>
        ${cuenta.pin ? `<strong>PIN:</strong> ${cuenta.pin}<br>` : ""}
        ${cuenta.perfil ? `<strong>Perfil:</strong> ${cuenta.perfil}<br>` : ""}
        ${
          cuenta.secreto_totp
            ? `<strong>TOTP:</strong> ${cuenta.secreto_totp}`
            : ""
        }
      </div>

      <div class="cuenta-info">
        <strong>Proveedor:</strong> ${
          cuenta.proveedor || cuenta.ultimo_proveedor || "N/A"
        }
      </div>

      <div class="cuenta-info">
        <strong>Precio Compra:</strong> $${formatearNumero(
          cuenta.precio_compra_real ||
            cuenta.ultimo_monto_moneda ||
            cuenta.ultimo_monto_clp ||
            0
        )} ${
      (
        cuenta.proveedor ||
        cuenta.ultimo_proveedor ||
        ""
      )
        .toUpperCase()
        .includes("Z2U")
        ? "USD"
        : cuenta.ultimo_moneda || "CLP"
    }
      </div>

      ${
        cuenta.fecha_expiracion
          ? `
        <div class="cuenta-info">
          <strong>Fecha Expiración:</strong> ${formatearFecha(
            cuenta.fecha_expiracion
          )}
        </div>
      `
          : ""
      }

      <div class="cuenta-info">
        <strong>Slots:</strong> ${cuenta.slots_ocupados}/${
      cuenta.slots_totales
    } ocupados
      </div>

      ${
        cuenta.notas
          ? `<div class="cuenta-info"><strong>Notas:</strong><br>${cuenta.notas}</div>`
          : ""
      }

      <hr style="margin: 20px 0;">
      
      <h3>Slots Asignados</h3>
      ${slotsHTML}

      <div class="acciones-bar" style="margin-top: 20px;">
        ${
          cuenta.slots_ocupados < cuenta.slots_totales
            ? `
          <button class="btn-primary" onclick="abrirModalAsignarSlot(${cuenta.id})">
            ➕ Asignar Slot
          </button>
        `
            : ""
        }
        <button class="btn-secondary" onclick="editarCuenta(${cuenta.id})">
          ✏️ Editar Cuenta
        </button>
      </div>
    `;

    abrirModal("modalDetalle");
  } catch (err) {
    console.error("Error al cargar detalle:", err);
    alert("Error al cargar detalle de la cuenta");
  }
}

function togglePassword() {
  const passTexto = document.getElementById("passTexto");
  const btn = event.target;

  if (passTexto.classList.contains("credenciales-ocultas")) {
    passTexto.classList.remove("credenciales-ocultas");
    btn.textContent = "🙈 Ocultar";
  } else {
    passTexto.classList.add("credenciales-ocultas");
    btn.textContent = "👁️ Mostrar";
  }
}

// ==================== ASIGNAR SLOT ====================

function abrirModalAsignarSlot(cuentaId) {
  document.getElementById("slotCuentaId").value = cuentaId;
  document.getElementById("formAsignarSlot").reset();

  // Establecer fecha predeterminada (1 mes)
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + 1);
  document.getElementById("slotFechaVencimiento").value = fecha
    .toISOString()
    .split("T")[0];

  cerrarModal("modalDetalle");
  abrirModal("modalAsignarSlot");
}

async function asignarSlot(event) {
  event.preventDefault();

  const datos = {
    cuenta_id: parseInt(document.getElementById("slotCuentaId").value),
    cliente_id: parseInt(document.getElementById("slotClienteId").value),
    fecha_vencimiento: document.getElementById("slotFechaVencimiento").value,
    notas: document.getElementById("slotNotas").value || null,
  };

  try {
    const res = await fetch(`${API_URL}/cuentas/slots/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al asignar slot");
    }

    alert("Slot asignado correctamente");
    cerrarModal("modalAsignarSlot");
    cargarCuentas();
    cargarResumen();
  } catch (err) {
    console.error("Error al asignar slot:", err);
    alert("Error: " + err.message);
  }
}

// ==================== LIBERAR SLOT ====================

async function confirmarLiberarSlot(slotId) {
  const motivo = prompt(
    "¿Por qué se libera este slot?\n(Ej: No renovó, Solicitó cancelación, etc.)"
  );
  if (!motivo) return;

  try {
    const res = await fetch(`${API_URL}/cuentas/slots/${slotId}/liberar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al liberar slot");
    }

    alert("Slot liberado correctamente");
    cerrarModal("modalDetalle");
    cargarCuentas();
    cargarResumen();
    verificarAlertas();
  } catch (err) {
    console.error("Error al liberar slot:", err);
    alert("Error: " + err.message);
  }
}

async function verSlotsALiberar() {
  try {
    const res = await fetch(`${API_URL}/cuentas/slots-liberar`);
    const slots = await res.json();

    const contenido = document.getElementById("slotsLiberarContenido");

    if (slots.length === 0) {
      contenido.innerHTML =
        '<p style="color: #999;">No hay slots vencidos que liberar</p>';
    } else {
      let html = '<div class="slots-list">';
      slots.forEach((slot) => {
        html += `
          <div class="slot-item vencido">
            <div class="slot-header">
              <div>
                <div class="slot-cliente">${slot.cliente_nombre}</div>
                <div class="slot-fecha">
                  ${slot.producto_nombre} - ${slot.cuenta_usuario}<br>
                  ${slot.cliente_telefono} (${slot.cliente_estado})
                </div>
              </div>
              <div>
                <div class="slot-fecha" style="color: #f44336;">
                  Venció: ${formatearFecha(slot.fecha_vencimiento)}
                </div>
                <button class="btn-liberar" onclick="confirmarLiberarSlot(${
                  slot.id
                })">
                  Liberar Ahora
                </button>
              </div>
            </div>
          </div>
        `;
      });
      html += "</div>";
      contenido.innerHTML = html;
    }

    abrirModal("modalSlotsLiberar");
  } catch (err) {
    console.error("Error al cargar slots a liberar:", err);
    alert("Error al cargar slots vencidos");
  }
}

// ==================== UTILIDADES ====================

function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
};

function formatearFecha(fecha) {
  if (!fecha) return "";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-CL");
}

function formatearNumero(num) {
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

