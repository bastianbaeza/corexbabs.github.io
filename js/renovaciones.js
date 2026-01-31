// frontend/js/renovaciones.js
// Módulo de renovaciones de cuentas

const API_RENOVACIONES = "http://127.0.0.1:3000/api/renovaciones";

let renovaciones = [];
let renovacionActual = null;

// ==================== WHATSAPP ====================

function normalizePhone(phone) {
  if (!phone) return "";
  // Remover todo lo que no sea número
  let cleaned = phone.replace(/\D/g, "");
  // Si empieza con 0, removerlo
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  // Asegurar que tiene formato internacional (56 para Chile)
  if (!cleaned.startsWith("56")) {
    cleaned = "56" + cleaned;
  }
  return cleaned;
}

function normalizeInstagram(user) {
  if (!user) return "";
  return String(user).trim().replace(/^@/, "");
}


function parseFechaLocal(fecha) {
  if (!fecha) return null;
  const texto = String(fecha).trim();
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const now = new Date();
    return new Date(year, month, day, now.getHours(), now.getMinutes(), 0, 0);
  }
  const parsed = new Date(texto);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}





async function enviarInstagramRenovacion(renovacion) {
  if (!renovacion) return;
  if (esPermanente(renovacion)) {
    alert("Esta venta no tiene fecha de vencimiento (permanente)");
    return;
  }

  const user = normalizeInstagram(renovacion.cliente_instagram);
  if (!user) {
    alert("Cliente sin usuario de Instagram");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:3000/api/instagram/enviar-renovacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venta_id: renovacion.id,
        instagram: user,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`Error al enviar: ${data.error || "No se pudo enviar"}`);
      return;
    }

    alert(`Instagram enviado a @${user}`);
  } catch (err) {
    console.error("Error enviando Instagram:", err);
    alert("Error de conexion con el backend");
  }
}

async function revisarInstagramRespuesta(renovacion) {
  if (!renovacion) return;
  if (esPermanente(renovacion)) {
    alert("Esta venta no tiene fecha de vencimiento (permanente)");
    return;
  }

  const user = normalizeInstagram(renovacion.cliente_instagram);
  if (!user) {
    alert("Cliente sin usuario de Instagram");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:3000/api/instagram/revisar-respuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venta_id: renovacion.id,
        instagram: user,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`Error al revisar: ${data.error || "No se pudo revisar"}`);
      return;
    }

    if (data.matched) {
      alert(`Respuesta SI detectada. Datos enviados a @${user}`);
    } else {
      alert(`No hay respuesta SI. Ultimo: ${data.last || "(vacio)"}`);
    }
  } catch (err) {
    console.error("Error revisando Instagram:", err);
    alert("Error de conexion con el backend");
  }
}
async function enviarTransferenciaRenovacion(renovacion) {
  if (!renovacion) return;
  if (esPermanente(renovacion)) {
    alert("Esta venta no tiene fecha de vencimiento (permanente)");
    return;
  }

  const phone = normalizePhone(renovacion.cliente_telefono);
  if (!phone || phone.length < 10) {
    alert(`Telefono invalido: ${renovacion.cliente_telefono || "no existe"}`);
    return;
  }

  try {
    const res = await fetch(
      "http://127.0.0.1:3000/api/renovaciones/enviar-transferencia",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venta_id: renovacion.id,
          telefono: phone,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(`Error al enviar: ${data.error || "No se pudo enviar"}`);
      return;
    }

    alert(`Datos de transferencia enviados a ${phone}`);
  } catch (err) {
    console.error("Error enviando transferencia:", err);
    alert("Error de conexion con el backend");
  }
}
function formatearFechaHora(fecha) {
  const date = parseFechaLocal(fecha);
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function esPermanente(renovacion) {
  if (!renovacion) return true;
  if (!renovacion.fecha_vencimiento) return true;
  const duracion = String(renovacion.producto_duracion || "").toLowerCase();
  if (
    duracion.includes("permanente") ||
    duracion.includes("ilimitad") ||
    duracion.includes("lifetime")
  ) {
    return true;
  }
  return false;
}


function buildRenewalMessage({
  nombre,
  apellido,
  producto,
  monto,
  fechaVencimiento,
}) {
  const nombreCompleto = `${nombre || ""}${apellido ? " " + apellido : ""}`.trim();
  const fechaTxt = formatearFechaHora(fechaVencimiento);
  const montoTxt = monto ? `$${Math.round(monto).toLocaleString("es-CL")}` : "";
  let msg = `Hola ${nombreCompleto}`;
  msg += `\n\nTu ${producto || "servicio"} vencio el ${fechaTxt}.`;
  if (montoTxt) {
    msg += `\nLa renovacion es por ${montoTxt} (CLP).`;
  }
  msg +=
    "\nQuieres renovarla este mes? Responde SI y te envio los datos de transferencia.";
  return msg;
}


function copiarMensajeAlPortapapeles(renovacion) {
  const mensaje = buildRenewalMessage({
    nombre: renovacion.cliente_nombre || "",
    apellido: renovacion.cliente_apellido || "",
    producto: renovacion.producto_nombre || "",
    monto: renovacion.precio_venta_clp || 0,
    fechaVencimiento: renovacion.fecha_vencimiento,
  });

  navigator.clipboard
    .writeText(mensaje)
    .then(() => {
      alert(`✅ Mensaje copiado:\n\n${mensaje}\n\nAhora pégalo en WhatsApp`);
    })
    .catch(() => {
      alert("❌ No se pudo copiar. Copia manualmente:\n\n" + mensaje);
    });
}

function abrirWhatsappRenovacion(renovacion) {
  if (!renovacion || (renovacion.estado_renovacion !== "vencida" && renovacion.estado_renovacion !== "vence_hoy")) {
    alert("Solo puedes contactar por WhatsApp cuentas vencidas");
    return;
  }

  if (esPermanente(renovacion)) {
    alert("Esta venta no tiene fecha de vencimiento (permanente)");
    return;
  }

  const phone = normalizePhone(renovacion.cliente_telefono);
  if (!phone || phone.length < 10) {
    alert(`Telefono invalido: ${renovacion.cliente_telefono || "no existe"}`);
    return;
  }

  console.log("Enviando WhatsApp automatico:");
  console.log("  Telefono:", phone);

  // Llamar al backend para enviar automaticamente
  enviarWhatsappAutomatico(renovacion.id, phone);
}

async function enviarWhatsappAutomatico(ventaId, telefono) {
  try {
    const res = await fetch(
      "http://127.0.0.1:3000/api/renovaciones/enviar-whatsapp-venta",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venta_id: ventaId,
          telefono: telefono,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("Error:", data.error);
      alert(
        `Error al enviar: ${data.error}

Intenta con el boton "Copiar" y envia manualmente.`
      );
      return;
    }

    alert(`Mensaje enviado exitosamente a ${telefono}`);
    console.log("Enviado:", data);
  } catch (err) {
    console.error("Error de conexion:", err);
    alert(
      `Error de conexion con el backend.

Intenta con el boton "Copiar" para envio manual.`
    );
  }
}

function abrirWhatsappTodosVencidos() {
  const vencidas = renovaciones.filter(
    (r) => (r.estado_renovacion === "vencida" || r.estado_renovacion === "vence_hoy") && !esPermanente(r)
  );

  if (!vencidas.length) {
    alert("No hay cuentas vencidas para contactar");
    return;
  }

  const sinTelefono = vencidas.filter((r) => !normalizePhone(r.cliente_telefono));
  if (sinTelefono.length > 0) {
    const nombres = sinTelefono.map((r) => r.cliente_nombre).join(", ");
    alert(`Los siguientes clientes no tienen telefono registrado: ${nombres}`);
  }

  const conTelefono = vencidas.filter((r) => normalizePhone(r.cliente_telefono));
  if (!conTelefono.length) {
    alert("Ninguna cuenta vencida tiene telefono registrado");
    return;
  }

  if (confirm(`Enviar automaticamente ${conTelefono.length} mensaje(s) por WhatsApp?`)) {
    enviarWhatsappMasivo(conTelefono);
  }
}

async function enviarWhatsappMasivo(renovaciones) {
  let enviados = 0;
  let errores = 0;

  for (const r of renovaciones) {
    try {
      const phone = normalizePhone(r.cliente_telefono);

      const res = await fetch(
        "http://127.0.0.1:3000/api/renovaciones/enviar-whatsapp-venta",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venta_id: r.id,
            telefono: phone,
          }),
        }
      );

      const data = await res.json();
      if (data.ok) {
        enviados++;
        console.log(`Enviado a ${r.cliente_nombre}`);
      } else {
        errores++;
        console.error(`Error con ${r.cliente_nombre}: ${data.error}`);
      }

      // Pequeno retraso entre envios
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      errores++;
      console.error(`Error con ${r.cliente_nombre}:`, err);
    }
  }

  alert(
    `Resumen:

Enviados: ${enviados}
Errores: ${errores}

Total: ${renovaciones.length}`
  );
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const [year, month, day] = fechaISO.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

function getEstadoEmoji(estado) {
  const emojis = {
    activa: "✅",
    proxima_vencer: "🟡",
    vence_hoy: "🔴",
    vencida: "❌",
    cerrada: "🚫",
    pendiente: "⏳",
  };
  return emojis[estado] || "•";
}

function getEstadoTexto(estado) {
  const textos = {
    activa: "Activa",
    proxima_vencer: "Próxima a vencer",
    vence_hoy: "Vence hoy",
    vencida: "Vencida",
    cerrada: "Cerrada",
    pendiente: "Pendiente",
  };
  return textos[estado] || estado;
}

function getEstadoClase(estado) {
  const clases = {
    activa: "badge-activo",
    proxima_vencer: "badge-warning",
    vence_hoy: "badge-danger",
    vencida: "badge-inactivo",
    cerrada: "badge-inactivo",
    pendiente: "badge-muted",
  };
  return clases[estado] || "badge-muted";
}

let ventaNoRenovarId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-filtrar").addEventListener("click", (e) => {
    e.preventDefault();
    cargarRenovaciones();
  });
  document.getElementById("btn-limpiar").addEventListener("click", (e) => {
    e.preventDefault();
    limpiarFiltros();
    cargarRenovaciones();
  });
  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", cerrarModal);
  document
    .getElementById("btn-cancelar")
    .addEventListener("click", cerrarModal);
  document
    .getElementById("btn-confirmar-renovar")
    .addEventListener("click", confirmarRenovar);

  // Modal No Renovar
  const c1 = document.getElementById("btn-no-renovar-cerrar");
  if (c1) c1.addEventListener("click", cerrarModalNoRenovar);
  const c2 = document.getElementById("btn-no-renovar-cancelar");
  if (c2) c2.addEventListener("click", cerrarModalNoRenovar);
  const c3 = document.getElementById("btn-confirmar-no-renovar");
  if (c3) c3.addEventListener("click", confirmarNoRenovar);

  cargarInicial();
});

async function cargarInicial() {
  try {
    await Promise.all([cargarRenovaciones(), cargarStats()]);
  } catch (err) {
    console.error("Error inicial en renovaciones:", err);
    alert("No se pudieron cargar los datos de renovaciones");
  }
}

async function cargarRenovaciones() {
  try {
    const estado = document.getElementById("filter-estado").value;
    const cliente = document.getElementById("filter-cliente").value;

    let url = API_RENOVACIONES;
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    if (cliente) params.append("cliente", cliente);
    if (params.toString()) url += "?" + params.toString();

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renovaciones = Array.isArray(data) ? data : [];
    renderTabla();
  } catch (err) {
    console.error("Error cargando renovaciones:", err);
  }
}

async function cargarStats() {
  try {
    const res = await fetch(`${API_RENOVACIONES}/stats/resumen`);
    if (!res.ok) {
      console.error("Error cargando stats:", res.status);
      return;
    }
    const data = await res.json();

    if (data.ok && data.resumen) {
      const r = data.resumen;
      document.getElementById("stat-activas").textContent =
        parseInt(r.activas) || 0;
      document.getElementById("stat-proximas").textContent =
        parseInt(r.proximas_vencer) || 0;
      document.getElementById("stat-vence-hoy").textContent =
        parseInt(r.vence_hoy) || 0;
      document.getElementById("stat-vencidas").textContent =
        parseInt(r.vencidas) || 0;
      document.getElementById("stat-renovadas").textContent =
        parseInt(r.renovadas_mes) || 0;
    }
  } catch (err) {
    console.error("Error cargando stats:", err);
  }
}

function renderTabla() {
  const tbody = document.getElementById("tabla-renovaciones");
  const empty = document.getElementById("renovaciones-empty");

  if (!renovaciones.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = renovaciones
    .map((r) => {
      const estado = r.estado_renovacion || "pendiente";
      const emoji = getEstadoEmoji(estado);
      const textoEstado = getEstadoTexto(estado);
      const claseEstado = getEstadoClase(estado);

      let diasDiferencia = r.dias_diferencia || 0;
      let textoDias = "";
      if (estado === "vencida") {
        textoDias = `Vencida hace ${diasDiferencia} días`;
      } else if (estado === "vence_hoy") {
        textoDias = "Hoy";
      } else {
        textoDias = `${diasDiferencia} días`;
      }

      // Boton WhatsApp para vencidas
      const puedeWhatsapp =
        (estado === "vencida" || estado === "vence_hoy") &&
        normalizePhone(r.cliente_telefono) &&
        !esPermanente(r);

      const btnWhatsapp = puedeWhatsapp
        ? `<button class="btn-whatsapp" onclick="abrirWhatsappRenovacion(renovaciones.find(x => x.id === ${r.id}))" title="Contactar por WhatsApp">WhatsApp</button>
             <button class="btn-copy" onclick="copiarMensajeAlPortapapeles(renovaciones.find(x => x.id === ${r.id}))" title="Copiar mensaje">Copiar</button>
             <button class="btn-copy" onclick="enviarTransferenciaRenovacion(renovaciones.find(x => x.id === ${r.id}))" title="Enviar datos de transferencia">Transferencia</button>`
        : `<button class="btn-whatsapp btn-disabled" title="Solo disponible para cuentas con vencimiento" style="opacity: 0.5; cursor: not-allowed;">WhatsApp</button>`;

      const tieneInstagram = !!normalizeInstagram(r.cliente_instagram);
      const btnInstagram = tieneInstagram && (estado === "vencida" || estado === "vence_hoy") && !esPermanente(r)
        ? `<button class="btn-copy" onclick="enviarInstagramRenovacion(renovaciones.find(x => x.id === ${r.id}))" title="Enviar por Instagram">Instagram</button>
             <button class="btn-copy" onclick="revisarInstagramRespuesta(renovaciones.find(x => x.id === ${r.id}))" title="Revisar respuesta IG">IG Revisar</button>`
        : ``;

      return `
        <tr>
          <td>${r.cliente_nombre || "-"}</td>
          <td>${r.producto_nombre || "-"}<br><small>${
        r.producto_duracion || ""
      }</small></td>
          <td>${formatearFecha(r.fecha_compra)}</td>
          <td>${formatearFecha(r.fecha_vencimiento)}</td>
          <td><span class="badge ${claseEstado}">${emoji} ${textoEstado}</span></td>
          <td>${textoDias}</td>
          <td>$${Math.round(r.precio_venta_clp || 0).toLocaleString(
            "es-CL"
          )}</td>
          <td>
            ${btnWhatsapp}${btnInstagram}
            ${
              estado !== "activa"
                ? `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <button class="btn-accion" onclick="abrirModalRenovar(${
                      r.id
                    }, '${r.cliente_nombre}', '${r.producto_nombre}', '${
                    r.fecha_vencimiento
                  }')">🔄 Renovar</button>
                    ${
                      estado === "vencida" || estado === "vence_hoy"
                        ? `<button class="btn-danger" onclick="abrirModalNoRenovar(${r.id}, '${r.cliente_nombre}', '${r.producto_nombre}')">✖️ No renovar</button>`
                        : ""
                    }
                   </div>`
                : "<span style='color: var(--muted);'>-</span>"
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function limpiarFiltros() {
  document.getElementById("filter-estado").value = "";
  document.getElementById("filter-cliente").value = "";
}

function abrirModalRenovar(id, cliente, producto, vence) {
  renovacionActual = id;
  document.getElementById(
    "renovar-cliente"
  ).innerHTML = `Cliente: <strong>${cliente}</strong>`;
  document.getElementById(
    "renovar-producto"
  ).innerHTML = `Producto: <strong>${producto}</strong>`;
  document.getElementById(
    "renovar-vence"
  ).innerHTML = `Vence: <strong>${formatearFecha(vence)}</strong>`;
  document.getElementById("modal-renovar").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-renovar").classList.remove("active");
  renovacionActual = null;
}

function abrirModalNoRenovar(id, cliente, producto) {
  ventaNoRenovarId = id;
  document.getElementById(
    "no-renovar-cliente"
  ).innerHTML = `Cliente: <strong>${cliente}</strong>`;
  document.getElementById(
    "no-renovar-producto"
  ).innerHTML = `Producto: <strong>${producto}</strong>`;
  document.getElementById("modal-no-renovar").classList.add("active");
}
function cerrarModalNoRenovar() {
  document.getElementById("modal-no-renovar").classList.remove("active");
  ventaNoRenovarId = null;
}

async function confirmarRenovar() {
  if (!renovacionActual) return;

  const dias = document.getElementById("dias-renovacion").value;

  try {
    const res = await fetch(`${API_RENOVACIONES}/${renovacionActual}/renovar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dias_renovacion: parseInt(dias) }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`❌ Error: ${data.error || "No se pudo renovar"}`);
      return;
    }

    // Mostrar información de la renovación
    if (data.nuevaVenta) {
      alert(
        `✅ Cuenta renovada exitosamente\n\n` +
          `📝 Nueva venta creada: #${data.nuevaVenta.id}\n` +
          `💰 Monto: $${Math.round(
            data.nuevaVenta.precio_venta_clp
          ).toLocaleString("es-CL")}\n` +
          `📅 Vence: ${formatearFecha(data.nuevaVenta.fecha_vencimiento)}\n\n` +
          `ℹ️ Esta renovación quedó registrada como una nueva venta.`
      );
    } else {
      alert("✅ Cuenta renovada exitosamente");
    }

    cerrarModal();
    await Promise.all([cargarRenovaciones(), cargarStats()]);
  } catch (err) {
    console.error("Error renovando:", err);
    alert(`❌ Error de conexión: ${err.message}`);
  }
}

async function noRenovar(ventaId) {
  if (!ventaId) return;
  try {
    const res = await fetch(`${API_RENOVACIONES}/${ventaId}/no-renovar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(`❌ Error: ${data.error || "No se pudo liberar el slot"}`);
      return;
    }
    alert("✅ Slot liberado. No se registró renovación.");
    await Promise.all([cargarRenovaciones(), cargarStats()]);
  } catch (err) {
    console.error("Error en no-renovar:", err);
    alert(`❌ Error de conexión: ${err.message}`);
  }
}

function confirmarNoRenovar() {
  if (!ventaNoRenovarId) return;
  noRenovar(ventaNoRenovarId)
    .then(() => cerrarModalNoRenovar())
    .catch(() => cerrarModalNoRenovar());
}

