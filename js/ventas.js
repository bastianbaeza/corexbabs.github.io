// frontend/js/ventas.js
// Módulo de ventas: registra ventas, márgenes y vencimientos

const API_VENTAS = "http://127.0.0.1:3000/api/ventas";
const API_CLIENTES = "http://127.0.0.1:3000/api/clientes";
const API_CATALOGO = "http://127.0.0.1:3000/api/catalogo";
let ventas = [];
let clientes = [];
let catalogo = [];
const COSTO_LANK_DEFAULT = 1375; // Costo por slot de Lank (editable)

// Función para formatear dinero en pesos chilenos sin decimales
function fmtCLP(n) {
  const value = Number(n || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return "$" + formatted;
}

function hoyISO() {
  // Obtener fecha actual en zona horaria de Chile (America/Santiago)
  const ahora = new Date();
  const fechaChile = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Santiago" })
  );
  const year = fechaChile.getFullYear();
  const month = String(fechaChile.getMonth() + 1).padStart(2, "0");
  const day = String(fechaChile.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  // Convierte YYYY-MM-DD a DD/MM/YYYY
  const [year, month, day] = fechaISO.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

function parseDuracionADias(duracionTexto = "1 mes") {
  const lower = (duracionTexto || "").toLowerCase();
  const match = lower.match(/(\d+)/);
  const cantidad = match ? parseInt(match[1], 10) : 1;
  if (lower.includes("dia") || lower.includes("día")) return cantidad;
  if (lower.includes("semana")) return cantidad * 7;
  if (lower.includes("mes")) return cantidad * 30;
  if (lower.includes("año") || lower.includes("ano")) return cantidad * 365;
  return 30;
}

function calcularVencimientoAuto(duracionTexto) {
  const dias = parseDuracionADias(duracionTexto);
  const fechaCompra = document.getElementById("fecha_compra").value || hoyISO();
  const fecha = new Date(fechaCompra);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", async () => {
  document
    .getElementById("btn-nueva-venta")
    .addEventListener("click", abrirModalVenta);
  document
    .getElementById("btn-cerrar-modal")
    .addEventListener("click", cerrarModalVenta);
  document
    .getElementById("btn-cancelar")
    .addEventListener("click", cerrarModalVenta);
  document
    .getElementById("producto_id")
    .addEventListener("change", onProductoChange);
  document
    .getElementById("precio_venta_clp")
    .addEventListener("input", calcularMargenEnTiempo);
  document
    .getElementById("costo_clp")
    .addEventListener("input", calcularMargenEnTiempo);
  document
    .getElementById("canal_venta")
    .addEventListener("change", onCanalChange);
  document
    .getElementById("form-venta")
    .addEventListener("submit", guardarVenta);
  document.getElementById("btn-filtrar").addEventListener("click", (e) => {
    e.preventDefault();
    cargarVentas();
  });
  document.getElementById("btn-limpiar").addEventListener("click", (e) => {
    e.preventDefault();
    limpiarFiltros();
    cargarVentas();
  });

  document.getElementById("fecha_compra").value = hoyISO();
  await cargarInicial();
  activarAccionRapida();
});

function activarAccionRapida() {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash !== "nueva-venta") return;
  abrirModalVenta();
  const inputCliente = document.getElementById("cliente_id");
  if (inputCliente) {
    inputCliente.focus();
  }
}

async function cargarInicial() {
  try {
    await Promise.all([cargarClientes(), cargarCatalogo()]);
    await Promise.all([cargarVentas(), cargarStats()]);
  } catch (err) {
    console.error("Error inicial en ventas:", err);
    alert("No se pudieron cargar los datos iniciales de ventas");
  }
}

async function cargarClientes() {
  try {
    const res = await fetch(API_CLIENTES);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    clientes = Array.isArray(data) ? data : [];
    const sel = document.getElementById("cliente_id");
    sel.innerHTML = clientes
      .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
      .join("");
  } catch (err) {
    console.error("Error cargando clientes:", err);
  }
}

async function cargarCatalogo() {
  try {
    const res = await fetch(API_CATALOGO);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    catalogo = Array.isArray(data) ? data : [];

    const selProducto = document.getElementById("producto_id");
    selProducto.innerHTML = catalogo
      .map(
        (p) =>
          `<option value="${p.id}" data-duracion="${p.duracion}" data-precio="${p.precio_venta_clp}">${p.nombre} (${p.duracion})</option>`
      )
      .join("");

    const filterProducto = document.getElementById("filter-producto");
    filterProducto.innerHTML =
      '<option value="">Producto</option>' +
      catalogo
        .map((p) => `<option value="${p.id}">${p.nombre}</option>`)
        .join("");
  } catch (err) {
    console.error("Error cargando catálogo:", err);
  }
}

async function cargarVentas() {
  try {
    const params = new URLSearchParams();
    const estado = document.getElementById("filter-estado").value;
    const producto = document.getElementById("filter-producto").value;
    const desde = document.getElementById("filter-desde").value;
    const hasta = document.getElementById("filter-hasta").value;

    if (estado) params.append("estado", estado);
    if (producto) params.append("producto_id", producto);
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);

    const url = params.toString()
      ? `${API_VENTAS}?${params.toString()}`
      : API_VENTAS;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    ventas = Array.isArray(data) ? data : [];
    renderTablaVentas();
  } catch (err) {
    console.error("Error cargando ventas:", err);
  }
}

async function cargarStats() {
  try {
    const res = await fetch(`${API_VENTAS}/stats/resumen`);
    if (!res.ok) {
      console.error("Error cargando stats:", res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log("Stats recibidas:", data);

    if (data.ok && data.resumen) {
      const r = data.resumen;
      const totalVentas = parseInt(r.total_ventas) || 0;
      const ingresos = parseFloat(r.ingresos_totales) || 0;
      const margen = parseFloat(r.margen_total) || 0;
      const pendientes = parseInt(r.pendientes) || 0;
      const vencen = parseInt(r.vencen_pronto) || 0;

      document.getElementById("stat-total-ventas").textContent = totalVentas;
      document.getElementById("stat-ingresos").textContent = fmtCLP(ingresos);
      document.getElementById("stat-margen").textContent = fmtCLP(margen);
      document.getElementById("stat-pendientes").textContent = pendientes;
      document.getElementById("stat-vencen").textContent = vencen;
    } else {
      console.warn("Respuesta inesperada de stats:", data);
    }
  } catch (err) {
    console.error("Error cargando stats de ventas:", err);
  }
}

function renderTablaVentas() {
  const tbody = document.getElementById("tabla-ventas");
  const empty = document.getElementById("ventas-empty");

  if (!ventas.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = ventas
    .map((v) => {
      const margen =
        v.margen_clp !== null && v.margen_clp !== undefined
          ? Number(v.margen_clp)
          : Number(v.precio_venta_clp || 0) - Number(v.costo_clp || 0);

      const canal = (v.canal_venta || "directo").toLowerCase();
      let canalBadge = canal;
      if (canal === "lank") {
        canalBadge = `<span style="padding: 4px 8px; border-radius: 4px; background: #e8f5e9; color: #1b5e20; font-weight: 600">Lank</span>`;
      } else if (canal === "directo") {
        canalBadge = `<span style="padding: 4px 8px; border-radius: 4px; background: #eef2ff; color: #3b5bdb; font-weight: 600">Directo</span>`;
      }

      // Badge de estado con colores (solo visual, no editable)
      let badgeEstado = "";
      if (v.estado === "pagado") {
        badgeEstado = `<span style="
          padding: 6px 12px;
          border-radius: 4px;
          background-color: #d4edda;
          color: #155724;
          font-weight: bold;
          display: inline-block;
        ">✅ Pagado</span>`;
      } else if (v.estado === "pendiente") {
        badgeEstado = `<span style="
          padding: 6px 12px;
          border-radius: 4px;
          background-color: #f8d7da;
          color: #721c24;
          font-weight: bold;
          display: inline-block;
        ">⏳ Pendiente</span>`;
      } else if (v.estado === "entregado") {
        badgeEstado = `<span style="
          padding: 6px 12px;
          border-radius: 4px;
          background-color: #d1ecf1;
          color: #0c5460;
          font-weight: bold;
          display: inline-block;
        ">📦 Entregado</span>`;
      } else if (v.estado === "anulada") {
        badgeEstado = `<span class="badge badge-inactivo">❌ Anulada</span>`;
      } else {
        badgeEstado = `<span>${v.estado}</span>`;
      }

      return `
        <tr>
          <td>${v.cliente_nombre || "-"}</td>
          <td>${v.producto_nombre || "-"}<br><small>${
        v.producto_duracion || ""
      }</small></td>
          <td>${v.cuenta_usuario ? v.cuenta_usuario : "—"}</td>
          <td>${fmtCLP(v.precio_venta_clp || 0)}</td>
          <td>${fmtCLP(margen)}</td>
          <td>${formatearFecha(v.fecha_compra)}</td>
          <td>${formatearFecha(v.fecha_vencimiento)}</td>
          <td>${canalBadge}</td>
          <td>${v.medio_pago || "-"}</td>
          <td>${badgeEstado}</td>
          <td>${v.notas ? v.notas : ""}</td>
          <td>
            <button class="btn-accion" onclick="editarVenta(${
              v.id
            })" title="Editar venta">✏️</button>
            <button class="btn-accion" onclick="enviarWhatsapp(${
              v.id
            })" title="Enviar WhatsApp">📲</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function limpiarFiltros() {
  document.getElementById("filter-estado").value = "";
  document.getElementById("filter-producto").value = "";
  document.getElementById("filter-desde").value = "";
  document.getElementById("filter-hasta").value = "";
}

function abrirModalVenta() {
  document.getElementById("modal-title").textContent = "💸 Nueva venta";
  document.getElementById("form-venta").reset();
  document.getElementById("venta-id").value = "";
  document.getElementById("fecha_compra").value = hoyISO();
  document.getElementById("canal_venta").value = "directo";
  document.getElementById("costo_clp").value = "";
  const primerProducto = catalogo[0];
  if (primerProducto) {
    document.getElementById("producto_id").value = primerProducto.id;
    document.getElementById("precio_venta_clp").dataset.precioCatalogo =
      primerProducto.precio_venta_clp;
    document.getElementById("precio_venta_clp").value =
      primerProducto.precio_venta_clp;
    document.getElementById("fecha_vencimiento").value =
      calcularVencimientoAuto(primerProducto.duracion);
  }
  calcularMargenEnTiempo();
  cambiarColorEstado();
  document.getElementById("modal-venta").classList.add("active");
}

// Cambiar color del select estado según el valor
function cambiarColorEstado() {
  const selectEstado = document.getElementById("estado");
  const valor = selectEstado.value;

  // Eliminar clases anteriores
  selectEstado.style.backgroundColor = "";
  selectEstado.style.color = "";

  if (valor === "pagado") {
    selectEstado.style.backgroundColor = "#d4edda";
    selectEstado.style.color = "#155724";
    selectEstado.style.borderColor = "#28a745";
  } else if (valor === "pendiente") {
    selectEstado.style.backgroundColor = "#f8d7da";
    selectEstado.style.color = "#721c24";
    selectEstado.style.borderColor = "#dc3545";
  } else if (valor === "entregado") {
    selectEstado.style.backgroundColor = "#d1ecf1";
    selectEstado.style.color = "#0c5460";
    selectEstado.style.borderColor = "#17a2b8";
  }
}

// Editar venta existente
async function editarVenta(ventaId) {
  try {
    const res = await fetch(`${API_VENTAS}/${ventaId}`);
    if (!res.ok) throw new Error("No se pudo cargar la venta");

    const data = await res.json();
    const venta = data.ok ? data.venta : data;

    document.getElementById("modal-title").textContent = "✏️ Editar venta";
    document.getElementById("venta-id").value = venta.id;
    document.getElementById("cliente_id").value = venta.cliente_id;
    document.getElementById("producto_id").value = venta.producto_id;
    document.getElementById("fecha_compra").value =
      venta.fecha_compra.split("T")[0];
    document.getElementById("fecha_vencimiento").value =
      venta.fecha_vencimiento.split("T")[0];
    document.getElementById("precio_venta_clp").value = venta.precio_venta_clp;
    document.getElementById("medio_pago").value =
      venta.medio_pago || "transferencia";
    document.getElementById("estado").value = venta.estado;
    document.getElementById("notas").value = venta.notas || "";
    document.getElementById("canal_venta").value =
      venta.canal_venta || "directo";
    document.getElementById("costo_clp").value =
      venta.costo_clp !== null && venta.costo_clp !== undefined
        ? venta.costo_clp
        : "";

    // Guardar precio catálogo para referencia
    const productoAsignado = catalogo.find((p) => p.id === venta.producto_id);
    if (productoAsignado) {
      document.getElementById("precio_venta_clp").dataset.precioCatalogo =
        productoAsignado.precio_venta_clp;
    }

    calcularMargenEnTiempo();
    onCanalChange();
    cambiarColorEstado();
    document.getElementById("modal-venta").classList.add("active");
  } catch (err) {
    console.error("Error cargando venta:", err);
    alert("❌ Error al cargar la venta para editar");
  }
}

function cerrarModalVenta() {
  document.getElementById("modal-venta").classList.remove("active");
}

function calcularMargenEnTiempo() {
  const precioVenta =
    Number(document.getElementById("precio_venta_clp").value) || 0;
  const productoId = document.getElementById("producto_id").value;
  const producto = catalogo.find((p) => String(p.id) === String(productoId));
  const costoManualStr = document.getElementById("costo_clp").value;
  const costoManual =
    costoManualStr !== "" && !isNaN(Number(costoManualStr))
      ? Number(costoManualStr)
      : null;

  if (!producto) {
    document.getElementById("margen-display").textContent = "$0";
    document.getElementById("margen-display").style.color = "#95a5a6";
    document.getElementById("info-producto").style.display = "none";
    return;
  }

  // Costo de referencia: manual > catálogo real > catálogo estimado
  const precioCompra = Number(
    costoManual !== null
      ? costoManual
      : producto.precio_compra_real ??
          producto.precio_compra_clp ??
          producto.precio_venta_clp * 0.5
  );
  const margen = precioVenta - precioCompra;
  const margenPorcentaje =
    precioVenta > 0 ? ((margen / precioVenta) * 100).toFixed(1) : 0;

  const margenDisplay = document.getElementById("margen-display");
  margenDisplay.textContent = `$${margen.toLocaleString(
    "es-CL"
  )} (${margenPorcentaje}%)`;

  // Cambiar color según el margen
  if (margen <= 0) {
    margenDisplay.style.color = "#e74c3c"; // Rojo si es negativo
  } else if (margen < precioCompra * 0.1) {
    margenDisplay.style.color = "#f39c12"; // Naranja si es bajo
  } else {
    margenDisplay.style.color = "#27ae60"; // Verde si es bueno
  }

  // Mostrar información del producto
  document.getElementById("info-producto-nombre").textContent = producto.nombre;
  document.getElementById("info-producto-duracion").textContent =
    producto.duracion;
  document.getElementById(
    "info-producto-precio"
  ).textContent = `$${producto.precio_venta_clp.toLocaleString("es-CL")}`;
  document.getElementById("info-producto").style.display = "block";
}

function onCanalChange() {
  const canal = document.getElementById("canal_venta").value;
  const precioInput = document.getElementById("precio_venta_clp");
  const precioCatalogo = Number(precioInput.dataset.precioCatalogo) || 0;

  if (canal === "lank") {
    // Si elige Lank, precio es siempre $1.375
    precioInput.value = COSTO_LANK_DEFAULT;
  } else if (canal === "directo") {
    // Si elige Directo, usa el precio del catálogo
    precioInput.value = precioCatalogo > 0 ? precioCatalogo : "";
  } else {
    // Para otros canales, usa precio catálogo también
    precioInput.value = precioCatalogo > 0 ? precioCatalogo : "";
  }

  calcularMargenEnTiempo();
}

async function onProductoChange() {
  const productoId = document.getElementById("producto_id").value;
  const producto = catalogo.find((p) => String(p.id) === String(productoId));

  if (producto) {
    // Guardar referencia de precio catálogo para luego usarlo en canal directo
    document.getElementById("precio_venta_clp").dataset.precioCatalogo =
      producto.precio_venta_clp;
    document.getElementById("fecha_vencimiento").value =
      calcularVencimientoAuto(producto.duracion);

    // Aplicar precio según canal actual
    const canalActual = document.getElementById("canal_venta").value;
    if (canalActual === "lank") {
      document.getElementById("precio_venta_clp").value = COSTO_LANK_DEFAULT;
    } else {
      document.getElementById("precio_venta_clp").value =
        producto.precio_venta_clp;
    }

    calcularMargenEnTiempo();
  }
}

async function cargarCuentasDisponibles(productoId) {
  // Esta función ya no es necesaria
  // Las cuentas se gestionan automáticamente en el backend
}

async function guardarVenta(event) {
  event.preventDefault();

  const ventaId = document.getElementById("venta-id").value;
  const esEdicion = ventaId && ventaId !== "";

  const productoId = Number(document.getElementById("producto_id").value);
  const producto = catalogo.find((p) => p.id === productoId);

  const payload = {
    cliente_id: Number(document.getElementById("cliente_id").value),
    producto_id: productoId,
    fecha_compra: document.getElementById("fecha_compra").value || hoyISO(),
    fecha_vencimiento: document.getElementById("fecha_vencimiento").value,
    precio_venta_clp: Number(document.getElementById("precio_venta_clp").value),
    medio_pago: document.getElementById("medio_pago").value,
    estado: document.getElementById("estado").value,
    notas: document.getElementById("notas").value || null,
    canal_venta: document.getElementById("canal_venta").value,
  };

  const costoValor = document.getElementById("costo_clp").value;
  if (costoValor !== "") {
    payload.costo_clp = Number(costoValor);
  }

  try {
    // Si es edición, usar PUT
    if (esEdicion) {
      const res = await fetch(`${API_VENTAS}/${ventaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg = data && data.error ? data.error : "No se pudo actualizar";
        alert(`❌ Error: ${msg}`);
        return;
      }

      alert("✅ Venta actualizada correctamente");
      cerrarModalVenta();
      await Promise.all([cargarVentas(), cargarStats()]);
      return;
    }

    // Si es creación nueva
    let endpoint = API_VENTAS;
    let intentarComoDirecta = false;

    const esCompartida = producto && producto.es_compartida !== false;

    if (esCompartida) {
      // Es una cuenta compartida (con slots)
      // Intenta con slots automáticos
      endpoint = `${API_VENTAS}/con-slot`;
      intentarComoDirecta = true; // Si falla, intentar como directa
    } else {
      // Es una cuenta directa (sin slots, resellida)
      endpoint = `${API_VENTAS}/directa`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    // Si falla con slots y es una cuenta compartida sin cuenta asignada,
    // intentar como cuenta directa
    if (
      !res.ok &&
      intentarComoDirecta &&
      data.error &&
      data.error.includes("No hay cuentas disponibles")
    ) {
      console.log("No hay slots disponibles, intentando como venta directa...");
      const resDirect = await fetch(`${API_VENTAS}/directa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const dataDirect = await resDirect.json();

      if (resDirect.ok && dataDirect.ok) {
        alert(
          `✅ Venta directa creada. Envía los datos de acceso por WhatsApp.\n\nℹ️ Nota: Este producto no tiene slots gestionados.`
        );
        cerrarModalVenta();
        await Promise.all([cargarVentas(), cargarStats()]);
        return;
      }

      alert("❌ Error: " + (dataDirect.error || "No se pudo guardar"));
      return;
    }

    if (!res.ok || !data.ok) {
      const msg = data && data.error ? data.error : "No se pudo guardar";
      alert(msg);
      return;
    }

    if (esCompartida && data.cuenta_id) {
      alert(
        `✅ Venta creada y slot asignado automáticamente en cuenta #${data.cuenta_id}`
      );
    } else if (!esCompartida) {
      alert(
        `✅ Venta directa creada correctamente. Envía los datos por WhatsApp.`
      );
    }

    cerrarModalVenta();
    await Promise.all([cargarVentas(), cargarStats()]);
  } catch (err) {
    console.error("Error guardando venta:", err);
    alert("Error al guardar la venta");
  }
}

// Enviar mensaje de pago por WhatsApp al cliente
async function enviarWhatsapp(ventaId) {
  if (!ventaId) return;
  try {
    console.log(`Enviando WhatsApp para venta ${ventaId}...`);
    const res = await fetch(`${API_VENTAS}/${ventaId}/notificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    console.log("Respuesta del servidor:", data);

    if (!res.ok) {
      const msg =
        data && data.error ? data.error : "No se pudo enviar el mensaje";
      alert(`❌ Error: ${msg}`);
      return;
    }

    if (data.ok) {
      alert(`✅ WhatsApp enviado a: ${data.telefono}`);
    } else {
      alert(`❌ ${data.error || "No se pudo enviar"}`);
    }
  } catch (err) {
    console.error("Error enviando WhatsApp:", err);
    alert(`❌ Error de conexión: ${err.message}`);
  }
}

// Cambiar estado de una venta
// NOTA: Esta función ya no se usa en la tabla, el estado solo se edita desde el modal
async function cambiarEstado(ventaId, nuevoEstado) {
  if (!ventaId || !nuevoEstado) return;

  try {
    const confirmacion = confirm(
      `¿Confirmar cambio de estado a "${nuevoEstado}"?`
    );

    if (!confirmacion) {
      // Recargar para restaurar el select al valor anterior
      await cargarVentas();
      return;
    }

    const res = await fetch(`${API_VENTAS}/${ventaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`❌ Error: ${data.error || "No se pudo actualizar el estado"}`);
      await cargarVentas();
      return;
    }

    // Recargar ventas y stats para reflejar los cambios
    await Promise.all([cargarVentas(), cargarStats()]);

    if (nuevoEstado === "pagado") {
      alert(
        "✅ Estado actualizado a PAGADO. Los ingresos y margen se han actualizado."
      );
    }
  } catch (err) {
    console.error("Error cambiando estado:", err);
    alert(`❌ Error de conexión: ${err.message}`);
    await cargarVentas();
  }
}

