// frontend/js/compras.js
// Módulo para registrar compras/gastos de servicios (ej: Spotify, Netflix, etc.)

function getBackendBase() {
  const ls = localStorage.getItem("backendBase");
  const resolved = localStorage.getItem("backendBaseResolved");
  const w =
    typeof window !== "undefined" && window.__backendBaseResolved
      ? window.__backendBaseResolved
      : null;
  const candidates = [
    ls,
    w,
    resolved,
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ]
    .filter(Boolean)
    .map((b) => String(b).replace(/\/$/, "").replace(/\/api$/, ""));
  return [...new Set(candidates)][0];
}

const API_BASE = getBackendBase();
const API_COMPRAS = `${API_BASE}/api/compras`;
const API_CUENTAS = `${API_BASE}/api/cuentas`;

let compras = [];
let compraEditando = null;
let cuentas = [];

function hoyISO() {
  const now = new Date();
  const fechaChile = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Santiago" })
  );
  const y = fechaChile.getFullYear();
  const m = String(fechaChile.getMonth() + 1).padStart(2, "0");
  const d = String(fechaChile.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const [y, m, d] = fechaISO.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

const MS_DIA = 1000 * 60 * 60 * 24;

function diasParaVencimiento(fechaISO) {
  if (!fechaISO) return null;
  try {
    const [y, m, d] = fechaISO.split("T")[0].split("-").map(Number);
    if (!y || !m || !d) return null;
    const ahora = new Date();
    const hoyChile = new Date(
      ahora.toLocaleString("en-US", { timeZone: "America/Santiago" })
    );
    const inicioHoyUTC = Date.UTC(
      hoyChile.getFullYear(),
      hoyChile.getMonth(),
      hoyChile.getDate()
    );
    const vencimientoUTC = Date.UTC(y, m - 1, d);
    return Math.round((vencimientoUTC - inicioHoyUTC) / MS_DIA);
  } catch (err) {
    console.error("No se pudo calcular días para vencimiento", err);
    return null;
  }
}

function estadoRenovacion(compra) {
  if (!compra || !compra.fecha_vencimiento) return null;
  const dias = diasParaVencimiento(compra.fecha_vencimiento);
  if (dias === null || Number.isNaN(dias)) return null;
  if (dias < 0) return { clave: "vencido", etiqueta: "Vencido", dias };
  if (dias === 0) return { clave: "vence-hoy", etiqueta: "Vence hoy", dias };
  if (dias <= 7) return { clave: "por-vencer", etiqueta: "Por vencer", dias };
  return { clave: "disponible", etiqueta: "Disponible", dias };
}

function badgeRenovacion(compra) {
  const esCompartida = compra?.es_cuenta_compartida === true;
  if (!esCompartida) {
    return '<span class="renovacion-pill muted">No aplica</span>';
  }
  const estado = estadoRenovacion(compra);
  if (!estado) {
    return '<span class="renovacion-pill muted">Sin fecha</span>';
  }

  const diasTexto =
    estado.dias === 0
      ? "hoy"
      : estado.dias > 0
      ? `en ${estado.dias}d`
      : `hace ${Math.abs(estado.dias)}d`;

  const nota =
    estado.clave === "vencido"
      ? "Renovar urgente"
      : estado.clave === "vence-hoy"
      ? "Pagar hoy"
      : estado.clave === "por-vencer"
      ? "Quedan pocos días"
      : "Al día";

  return `<div class="estado-renovacion">
    <span class="renovacion-pill ${estado.clave}">
      <span class="pill-dot"></span>
      <span class="pill-label">${estado.etiqueta}</span>
      <span class="pill-count">${diasTexto}</span>
    </span>
    <div class="renovacion-meta">
      <span>Próx. ${formatearFecha(compra.fecha_vencimiento)}</span>
      <span>${nota}</span>
    </div>
  </div>`;
}

function toggleTipoCambio() {
  const moneda = document.getElementById("moneda").value;
  const grupo = document.getElementById("grupo-tipo-cambio");
  if (moneda === "CLP") {
    grupo.style.display = "none";
    document.getElementById("tipo_cambio").value = "";
  } else {
    grupo.style.display = "block";
  }
}

async function cargarCompras() {
  try {
    const params = new URLSearchParams();
    const estado = document.getElementById("filter-estado").value;
    const activo = document.getElementById("filter-activo").value;
    const proveedor = document.getElementById("filter-proveedor").value;
    const desde = document.getElementById("filter-desde").value;
    const hasta = document.getElementById("filter-hasta").value;

    if (estado) params.append("estado", estado);
    if (activo) params.append("activo", activo);
    if (proveedor) params.append("proveedor", proveedor);
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    const url = params.toString() ? `${API_COMPRAS}?${params}` : API_COMPRAS;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    compras = Array.isArray(data.compras) ? data.compras : [];
    renderTabla();
  } catch (err) {
    console.error("Error cargando compras:", err);
  }
}

async function cargarStats() {
  try {
    const res = await fetch(`${API_COMPRAS}/stats/resumen`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.ok && data.resumen) {
      const r = data.resumen;
      document.getElementById("stat-total-compras").textContent = parseInt(
        r.total_compras || 0
      );
      document.getElementById("stat-total-clp").textContent =
        "$" + Math.round(r.total_clp || 0).toLocaleString("es-CL");
      document.getElementById("stat-mes").textContent =
        "$" + Math.round(r.total_mes || 0).toLocaleString("es-CL");
      document.getElementById("stat-pendientes").textContent = parseInt(
        r.pendientes || 0
      );
    }
  } catch (err) {
    console.error("Error cargando stats compras:", err);
  }
}

function badgeEstado(estado) {
  const st = (estado || "").toLowerCase();
  if (st === "pagado")
    return '<span style="padding:6px 12px;border-radius:4px;background:#d4edda;color:#155724;font-weight:bold;display:inline-block;">✅ Pagado</span>';
  if (st === "pendiente")
    return '<span style="padding:6px 12px;border-radius:4px;background:#fff3cd;color:#856404;font-weight:bold;display:inline-block;">⏳ Pendiente</span>';
  if (st === "cancelado")
    return '<span style="padding:6px 12px;border-radius:4px;background:#f8d7da;color:#721c24;font-weight:bold;display:inline-block;">Cancelado</span>';
  return estado || "-";
}

function etiquetaCuenta(c) {
  if (!c || c.es_cuenta_compartida !== true) return "-";
  const parts = [c.cuenta_producto_nombre, c.cuenta_usuario].filter(Boolean);
  return parts.length ? parts.join(" / ") : "Cuenta compartida";
}

function renderTabla() {
  const tbody = document.getElementById("tabla-compras");
  const empty = document.getElementById("compras-empty");
  const mostrandoEliminadas =
    document.getElementById("filter-activo").value === "false";

  if (!compras.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = compras
    .map((c) => {
      const montoClp = Number(c.monto_clp || 0);
      const montoMoneda = Number(c.monto_moneda || 0);
      const etiquetaMoneda =
        c.moneda === "CLP" ? "CLP" : `${c.moneda} @ ${c.tipo_cambio || "-"}`;
      const esEliminada = c.activo === false;

      const acciones = esEliminada
        ? `<button class="btn-link" onclick="restaurarCompra(${c.id})" title="Restaurar">♻️</button>`
        : `<button class="btn-link" onclick="editarCompra(${c.id})">✏️</button>
           <button class="btn-link" onclick="eliminarCompra(${c.id})">🗑️</button>`;

      return `<tr style="${
        esEliminada ? "opacity: 0.5; background: #2d1818;" : ""
      }">
        <td>${esEliminada ? "🗑️ " : ""}${c.concepto || "-"}</td>
        <td>${c.proveedor || "-"}</td>
        <td>${etiquetaCuenta(c)}</td>
        <td>$${Math.round(montoClp).toLocaleString("es-CL")}</td>
        <td>$${montoMoneda.toLocaleString("es-CL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${etiquetaMoneda}</td>
        <td>${c.medio_pago || "-"}</td>
        <td>${formatearFecha(c.fecha_pago)}</td>
        <td>${formatearFecha(c.fecha_vencimiento)}</td>
        <td>${badgeRenovacion(c)}</td>
        <td>${badgeEstado(c.estado)}</td>
        <td>${c.referencia || "-"}</td>
        <td>${c.notas ? c.notas : "-"}</td>
        <td>${acciones}</td>
      </tr>`;
    })
    .join("");
}

function esCuentaCompartidaSeleccionada() {
  const v = document.getElementById("es_cuenta_compartida")?.value;
  return v === "true";
}

function toggleCuentaCompartidaUI() {
  const show = esCuentaCompartidaSeleccionada();
  const grupo = document.getElementById("grupo-cuenta-id");
  if (!grupo) return;
  grupo.style.display = show ? "block" : "none";
  if (!show) {
    const sel = document.getElementById("cuenta_id");
    if (sel) sel.value = "";
  }
}

async function cargarCuentasSiHaceFalta() {
  if (cuentas.length) return;
  try {
    const res = await fetch(API_CUENTAS);
    const data = await res.json();
    cuentas = Array.isArray(data?.cuentas) ? data.cuentas : [];
  } catch (err) {
    console.error("Error cargando cuentas:", err);
    cuentas = [];
  }
}

async function poblarSelectCuentas() {
  const sel = document.getElementById("cuenta_id");
  if (!sel) return;
  await cargarCuentasSiHaceFalta();
  sel.innerHTML = '<option value="">Seleccionar cuenta...</option>';
  cuentas.forEach((cuenta) => {
    const opt = document.createElement("option");
    opt.value = cuenta.id;
    const nombre = cuenta.producto_nombre || "Sin producto";
    const slots = `${cuenta.slots_ocupados || 0}/${cuenta.slots_totales || 0}`;
    opt.textContent = `${nombre} (${cuenta.usuario}) - ${slots} slots`;
    sel.appendChild(opt);
  });
}

function abrirModal(compra = null) {
  compraEditando = compra;
  document.getElementById("modal-title").textContent = compra
    ? "✏️ Editar compra"
    : "🧾 Registrar compra";

  document.getElementById("concepto").value = compra?.concepto || "";
  document.getElementById("proveedor").value = compra?.proveedor || "";
  document.getElementById("monto_moneda").value = compra?.monto_moneda || "";
  document.getElementById("moneda").value = compra?.moneda || "CLP";
  document.getElementById("tipo_cambio").value =
    compra && compra.moneda !== "CLP" ? compra.tipo_cambio || "" : "";
  document.getElementById("medio_pago").value =
    compra?.medio_pago || "transferencia";
  document.getElementById("tarjeta").value = compra?.tarjeta || "";
  document.getElementById("fecha_pago").value = compra?.fecha_pago
    ? compra.fecha_pago.split("T")[0]
    : hoyISO();
  document.getElementById("fecha_vencimiento").value = compra?.fecha_vencimiento
    ? compra.fecha_vencimiento.split("T")[0]
    : "";
  document.getElementById("estado").value = compra?.estado || "pagado";
  document.getElementById("referencia").value = compra?.referencia || "";
  document.getElementById("notas").value = compra?.notas || "";
  if (document.getElementById("es_cuenta_compartida")) {
    document.getElementById("es_cuenta_compartida").value =
      compra?.es_cuenta_compartida === true ? "true" : "false";
  }

  toggleTipoCambio();
  toggleCuentaCompartidaUI();
  if (esCuentaCompartidaSeleccionada()) {
    poblarSelectCuentas().then(() => {
      const cuentaId = compra?.cuenta_id;
      if (cuentaId && document.getElementById("cuenta_id")) {
        document.getElementById("cuenta_id").value = String(cuentaId);
      }
    });
  }
  document.getElementById("modal-compra").style.display = "flex";
}

function cerrarModal() {
  compraEditando = null;
  document.getElementById("form-compra").reset();
  document.getElementById("fecha_pago").value = hoyISO();
  toggleTipoCambio();
  toggleCuentaCompartidaUI();
  document.getElementById("modal-compra").style.display = "none";
}

async function guardarCompra(event) {
  event.preventDefault();

  const concepto = document.getElementById("concepto").value.trim();
  const monto = Number(document.getElementById("monto_moneda").value);
  const moneda = document.getElementById("moneda").value;
  const tipoCambioInput = document.getElementById("tipo_cambio").value;
  const esCuentaCompartida = esCuentaCompartidaSeleccionada();
  const cuentaId = esCuentaCompartida
    ? Number(document.getElementById("cuenta_id").value)
    : null;
  const fechaVenc = document.getElementById("fecha_vencimiento").value || null;

  if (!concepto) {
    alert("⚠️ El concepto es obligatorio");
    return;
  }
  if (!monto || monto <= 0) {
    alert("⚠️ El monto debe ser mayor a 0");
    return;
  }
  if (moneda !== "CLP" && (!tipoCambioInput || Number(tipoCambioInput) <= 0)) {
    alert("⚠️ Debes indicar tipo de cambio para la moneda seleccionada");
    return;
  }

  if (esCuentaCompartida && (!cuentaId || cuentaId <= 0)) {
    alert("⚠️ Debes seleccionar una cuenta para compra compartida");
    return;
  }
  if (esCuentaCompartida && !fechaVenc) {
    alert("⚠️ Debes indicar el próximo pago (fecha vencimiento)");
    return;
  }

  const payload = {
    concepto,
    proveedor: document.getElementById("proveedor").value || null,
    cuenta_id: esCuentaCompartida ? cuentaId : null,
    es_cuenta_compartida: esCuentaCompartida,
    monto_moneda: monto,
    moneda,
    tipo_cambio: moneda === "CLP" ? 1 : Number(tipoCambioInput),
    medio_pago: document.getElementById("medio_pago").value,
    tarjeta: document.getElementById("tarjeta").value || null,
    fecha_compra: document.getElementById("fecha_pago").value,
    fecha_pago: document.getElementById("fecha_pago").value,
    fecha_vencimiento: fechaVenc,
    estado: document.getElementById("estado").value,
    referencia: document.getElementById("referencia").value || null,
    notas: document.getElementById("notas").value || null,
  };

  const url = compraEditando
    ? `${API_COMPRAS}/${compraEditando.id}`
    : API_COMPRAS;
  const method = compraEditando ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`❌ Error: ${data.error || res.statusText}`);
      return;
    }
    alert(compraEditando ? "✅ Compra actualizada" : "✅ Compra registrada");
    cerrarModal();
    await Promise.all([cargarCompras(), cargarStats()]);
  } catch (err) {
    console.error("Error guardando compra:", err);
    alert("Error al guardar. Revisa la consola.");
  }
}

async function editarCompra(id) {
  const compra = compras.find((c) => c.id === id);
  if (!compra) return;
  abrirModal(compra);
}

async function eliminarCompra(id) {
  if (!confirm("¿Eliminar esta compra?")) return;
  try {
    const res = await fetch(`${API_COMPRAS}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`❌ Error: ${data.error || res.statusText}`);
      return;
    }
    await Promise.all([cargarCompras(), cargarStats()]);
  } catch (err) {
    console.error("Error eliminando compra:", err);
    alert("No se pudo eliminar la compra");
  }
}

async function restaurarCompra(id) {
  if (!confirm("¿Restaurar esta compra? Volverá a aparecer en finanzas."))
    return;
  try {
    const res = await fetch(`${API_COMPRAS}/${id}/restaurar`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`❌ Error: ${data.error || res.statusText}`);
      return;
    }
    alert("✅ Compra restaurada exitosamente");
    await Promise.all([cargarCompras(), cargarStats()]);
  } catch (err) {
    console.error("Error restaurando compra:", err);
    alert("No se pudo restaurar la compra");
  }
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-nueva-compra")
    .addEventListener("click", () => abrirModal());
  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", cerrarModal);
  document
    .getElementById("btn-cancelar")
    .addEventListener("click", cerrarModal);
  document
    .getElementById("moneda")
    .addEventListener("change", toggleTipoCambio);
  document
    .getElementById("form-compra")
    .addEventListener("submit", guardarCompra);

  if (document.getElementById("es_cuenta_compartida")) {
    document
      .getElementById("es_cuenta_compartida")
      .addEventListener("change", async () => {
        toggleCuentaCompartidaUI();
        if (esCuentaCompartidaSeleccionada()) {
          await poblarSelectCuentas();
        }
      });
  }

  document.getElementById("btn-filtrar").addEventListener("click", (e) => {
    e.preventDefault();
    cargarCompras();
  });
  document.getElementById("btn-limpiar").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("filter-estado").value = "";
    document.getElementById("filter-activo").value = "";
    document.getElementById("filter-proveedor").value = "";
    document.getElementById("filter-desde").value = "";
    document.getElementById("filter-hasta").value = "";
    cargarCompras();
  });

  document.getElementById("fecha_pago").value = hoyISO();
  toggleTipoCambio();
  toggleCuentaCompartidaUI();

  cargarCompras();
  cargarStats();
});

