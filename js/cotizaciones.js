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
let cotizacionActual = null;
let productosLista = [];
let clientesLista = [];
let cotizacionEnCreacion = null; // Para manejar cotización en progreso
let itemsEnAgregiacion = []; // Array temporal de items siendo agregados

// Función para formatear dinero en pesos chilenos sin decimales
function formatMoney(amount) {
  const value = Number(amount || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${formatted}`;
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCotizaciones();
  cargarProductos();
  cargarClientes();

  // Si viene desde catálogo con producto preseleccionado
  const productoId = sessionStorage.getItem("productoIdPreseleccionado");
  if (productoId) {
    setTimeout(() => {
      document.getElementById("productoId").value = productoId;
      actualizarPrecioProducto();
      abrirModalNuevaCotizacion();

      // Limpiar sessionStorage
      sessionStorage.removeItem("productoIdPreseleccionado");
      sessionStorage.removeItem("productoNombrePreseleccionado");
      sessionStorage.removeItem("productoPrecioPreseleccionado");
    }, 500);
  }
}); // ============================================================================
// CARGAR DATOS
// ============================================================================

function cargarCotizaciones() {
  fetch(`${API_URL}/cotizaciones`)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("tablaCotizaciones");
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.cotizaciones)
        ? data.cotizaciones
        : Array.isArray(data?.value)
        ? data.value
        : [];

      if (lista.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay cotizaciones</td></tr>';
        return;
      }

      tbody.innerHTML = lista
        .map(
          (cot) => `
                <tr>
                    <td>${cot.cliente_nombre}</td>
                    <td>${cot.cliente_telefono}</td>
                    <td>${cot.productos || "Sin productos"}</td>
                    <td>${cot.cantidad_items || 0}</td>
                    <td>${formatMoney(parseInt(cot.precio_total))}</td>
                    <td>
                        <span class="estado-badge ${cot.estado}">
                            ${
                              cot.estado === "pendiente"
                                ? "Pendiente"
                                : cot.estado === "enviada"
                                ? "Enviada"
                                : cot.estado === "confirmada"
                                ? "Confirmada"
                                : "Rechazada"
                            }
                        </span>
                    </td>
                    <td>${cot.canal_envio || "—"}</td>
                    <td>${new Date(cot.fecha_creacion).toLocaleDateString(
                      "es-CL"
                    )}</td>
                    <td>
                        <button onclick="abrirDetalleCotizacion(${
                          cot.id
                        })" class="btn btn-small">Ver</button>
                        <button onclick="eliminarCotizacionConfirm(${
                          cot.id
                        })" class="btn btn-small btn-danger">Eliminar</button>
                    </td>
                </tr>
            `
        )
        .join("");
    })
    .catch((err) => {
      console.error("Error cargando cotizaciones:", err);
      const tbody = document.getElementById("tablaCotizaciones");
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="9" style="text-align:center;padding:20px;color:#ef4444;">Error cargando cotizaciones. Revisa conexi&oacute;n con el backend.</td></tr>';
      }
    });
}

function cargarProductos() {
  fetch(`${API_URL}/catalogo`)
    .then((res) => res.json())
    .then((data) => {
      productosLista = data;
      const options =
        '<option value="">Selecciona un producto...</option>' +
        data
          .map(
            (prod) =>
              `<option value="${prod.id}" data-precio="${
                prod.precio_venta_clp
              }">${prod.nombre} - ${formatMoney(
                parseInt(prod.precio_venta_clp)
              )}</option>`
          )
          .join("");

      // Llenar ambos selects
      const selectViejo = document.getElementById("productoId");
      if (selectViejo) selectViejo.innerHTML = options;

      const selectNuevo = document.getElementById("productoSelect");
      if (selectNuevo) {
        selectNuevo.innerHTML = options;
        // Agregar evento para auto-completar precio
        selectNuevo.addEventListener("change", function () {
          const productoId = parseInt(this.value);
          if (productoId) {
            const prod = data.find((p) => p.id == productoId);
            if (prod) {
              document.getElementById("precioUnitarioItem").value =
                prod.precio_venta_clp;
            }
          }
        });
      }
    })
    .catch((err) => console.error("Error cargando productos:", err));

}

function cargarClientes() {
  fetch(`${API_URL}/clientes`)
    .then((res) => res.json())
    .then((data) => {
      clientesLista = Array.isArray(data) ? data : data?.clientes || [];
      const select = document.getElementById("clienteSelect");
      if (!select) return;

      const options =
        '<option value="">Selecciona un cliente...</option>' +
        clientesLista
          .map((cliente) => {
            const nombre = String(cliente.nombre || "").trim();
            return `<option value="${cliente.id}"
              data-nombre="${escaparHtmlAttr(nombre)}"
              data-email="${escaparHtmlAttr(cliente.email || "")}"
              data-telefono="${escaparHtmlAttr(cliente.telefono || "")}"
              data-instagram="${escaparHtmlAttr(cliente.instagram || "")}"
            >${nombre || `Cliente #${cliente.id}`}</option>`;
          })
          .join("");

      select.innerHTML = options;
      select.addEventListener("change", aplicarClienteSeleccionado);
    })
    .catch((err) => console.error("Error cargando clientes:", err));
}

function setClienteInputsDisabled(disabled) {
  ["clienteNombre", "clienteEmail", "clienteTelefono", "clienteInstagram"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.readOnly = disabled;
    }
  );
}

function aplicarClienteSeleccionado() {
  const select = document.getElementById("clienteSelect");
  if (!select) return;
  const option = select.selectedOptions[0];
  if (!option || !select.value) {
    setClienteInputsDisabled(false);
    return;
  }

  document.getElementById("clienteNombre").value =
    option.dataset.nombre || option.textContent || "";
  document.getElementById("clienteEmail").value = option.dataset.email || "";
  document.getElementById("clienteTelefono").value =
    option.dataset.telefono || "";
  document.getElementById("clienteInstagram").value =
    option.dataset.instagram || "";

  setClienteInputsDisabled(true);
}

function limpiarClienteSeleccionado() {
  const select = document.getElementById("clienteSelect");
  if (select) select.value = "";
  setClienteInputsDisabled(false);
}

// ============================================================================
// MODALES - NUEVA COTIZACIÓN
// ============================================================================

function abrirModalNuevaCotizacion() {
  document.getElementById("modalNuevaCotizacion").style.display = "block";
  document.getElementById("clienteNombre").focus();
}

function cerrarModalNuevaCotizacion() {
  document.getElementById("modalNuevaCotizacion").style.display = "none";
  limpiarFormulario();
}

function limpiarFormulario() {
  const clienteSelect = document.getElementById("clienteSelect");
  if (clienteSelect) clienteSelect.value = "";
  document.getElementById("clienteNombre").value = "";
  document.getElementById("clienteEmail").value = "";
  document.getElementById("clienteTelefono").value = "";
  document.getElementById("clienteInstagram").value = "";
  setClienteInputsDisabled(false);
  document.getElementById("productoSelect").value = "";
  document.getElementById("cantidadItem").value = "1";
  document.getElementById("precioUnitarioItem").value = "";
  itemsEnAgregiacion = [];
  actualizarTablaItems();
}

function actualizarPrecioProducto() {
  const select = document.getElementById("productoId");
  const productoId = select.value;

  if (!productoId) {
    document.getElementById("precioTotal").value = "";
    document.getElementById("mensajePreview").value = "";
    return;
  }

  // Buscar el producto en la lista
  const producto = productosLista.find((p) => p.id == productoId);
  if (!producto) return;

  const precio = producto.precio_venta_clp || 0;
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
  const precioTotal = parseInt(precio) * cantidad;

  document.getElementById("precioTotal").value = precioTotal;

  // Actualizar preview del mensaje
  actualizarMensajePreview();
}

function actualizarMensajePreview() {
  const nombre =
    document.getElementById("clienteNombre").value || "[Nombre Cliente]";
  const productoId = document.getElementById("productoId").value;
  const cantidad = document.getElementById("cantidad").value || "1";
  const precio = document.getElementById("precioTotal").value || "0";

  if (!productoId) {
    document.getElementById("mensajePreview").value = "";
    return;
  }

  const producto = productosLista.find((p) => p.id == productoId);
  if (!producto) return;

  const duracion = producto.duracion || "1 mes";
  const mensaje = generarMensajeWhatsapp(
    nombre,
    producto.nombre,
    duracion,
    precio
  );
  document.getElementById("mensajePreview").value = mensaje;
}

function generarMensajeWhatsapp(nombre, producto, duracion, precio) {
  return `Hola ${nombre},

Te envío la cotización de tu producto solicitado:

${producto}
Duración: ${duracion}
Precio: ${formatMoney(parseInt(precio))}

*Datos para transferencia:*
Cuenta Vista Tenpo
Titular: Bastián Andres Baeza Sanchez
RUT: 19.092.162-K
N° Cuenta: 111119092162

Una vez confirmado el pago, te envío acceso inmediatamente.

¿Confirmas tu compra?`;
}

// ============================================================================
// GUARDAR COTIZACIÓN
// ============================================================================

async function guardarCotizacion() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  const email = document.getElementById("clienteEmail").value.trim();
  const telefono = document.getElementById("clienteTelefono").value.trim();
  const instagram = document.getElementById("clienteInstagram").value.trim();

  // Validación
  if (!nombre) {
    alert("Por favor ingresa el nombre del cliente");
    return;
  }
  if (!telefono) {
    alert("Por favor ingresa el teléfono del cliente");
    return;
  }

  // Si no hay items agregados, alertar
  if (!itemsEnAgregiacion || itemsEnAgregiacion.length === 0) {
    alert("Por favor agrega al menos un producto a la cotización");
    return;
  }

  try {
    // Paso 1: Crear cotización con datos del cliente
    const cotizacionRes = await fetch(`${API_URL}/cotizaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_nombre: nombre,
        cliente_email: email || null,
        cliente_telefono: telefono,
        cliente_instagram: instagram || null,
      }),
    });

    if (!cotizacionRes.ok) {
      const error = await cotizacionRes.json();
      throw new Error(error.error || "Error al crear cotización");
    }

    const cotizacion = await cotizacionRes.json();

    // Paso 2: Agregar todos los items a la cotización
    for (const item of itemsEnAgregiacion) {
      await fetch(`${API_URL}/cotizaciones/${cotizacion.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_id: item.producto_id,
          producto_nombre: item.producto_nombre,
          duracion: item.duracion,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        }),
      });
    }
    alert("? Cotización creada exitosamente");
    cerrarModalNuevaCotizacion();
    itemsEnAgregiacion = []; // Limpiar array
    cargarCotizaciones();
  } catch (err) {
    console.error("Error:", err);
    alert("Error: " + err.message);
  }
}

function agregarItemACotizacion() {
  const productoSelect = document.getElementById("productoSelect");
  const productoId = parseInt(productoSelect.value);
  const cantidad = parseInt(document.getElementById("cantidadItem").value) || 1;
  const precioUnitario =
    parseInt(document.getElementById("precioUnitarioItem").value) || 0;

  if (!productoId) {
    alert("Por favor selecciona un producto");
    return;
  }

  if (precioUnitario <= 0) {
    alert("Por favor ingresa un precio válido");
    return;
  }

  // Buscar el producto en la lista
  const producto = productosLista.find((p) => p.id == productoId);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  // Agregar item al array
  itemsEnAgregiacion.push({
    producto_id: productoId,
    producto_nombre: producto.nombre,
    duracion: producto.duracion,
    cantidad: cantidad,
    precio_unitario: precioUnitario,
  });

  // Limpiar campos
  productoSelect.value = "";
  document.getElementById("cantidadItem").value = "1";
  document.getElementById("precioUnitarioItem").value = "";

  // Actualizar tabla de items
  actualizarTablaItems();
}

function actualizarTablaItems() {
  if (itemsEnAgregiacion.length === 0) {
    document.getElementById("tablaItems").style.display = "none";
    document.getElementById("totalCotizacionDiv").style.display = "none";
    return;
  }

  document.getElementById("tablaItems").style.display = "table";
  document.getElementById("totalCotizacionDiv").style.display = "block";

  const bodyTabla = document.getElementById("bodyTablaItems");
  let totalGeneral = 0;

  bodyTabla.innerHTML = itemsEnAgregiacion
    .map((item, idx) => {
      const subtotal = item.cantidad * item.precio_unitario;
      totalGeneral += subtotal;
      return `
        <tr style="border-bottom: 1px solid #ecf0f1;">
          <td style="padding: 10px;">${item.producto_nombre}</td>
          <td style="padding: 10px; text-align: center;">${item.cantidad}</td>
          <td style="padding: 10px; text-align: right;">$${parseInt(
            item.precio_unitario
          ).toLocaleString("es-CL")}</td>
          <td style="padding: 10px; text-align: right; font-weight: 600;">$${parseInt(
            subtotal
          ).toLocaleString("es-CL")}</td>
          <td style="padding: 10px; text-align: center;">
            <button onclick="eliminarItemTemporal(${idx})" class="btn btn-small btn-danger">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("totalCotizacion").textContent =
    parseInt(totalGeneral).toLocaleString("es-CL");
}

function eliminarItemTemporal(index) {
  itemsEnAgregiacion.splice(index, 1);
  actualizarTablaItems();
}

// ============================================================================
// MODALES - DETALLE COTIZACIÓN
// ============================================================================

async function abrirDetalleCotizacion(id) {
  try {
    const response = await fetch(`${API_URL}/cotizaciones/${id}`);
    const cot = await response.json();
    cotizacionActual = cot;

    console.log("Cotización cargada:", cot); // DEBUG

    // Llenar detalles
    document.getElementById("detalleCiente").textContent =
      cot.cliente_nombre || "—";
    document.getElementById("detalleTeléfono").textContent =
      cot.cliente_telefono || "—";
    document.getElementById("detalleEmail").textContent =
      cot.cliente_email || "—";

    // Mostrar Instagram si existe
    if (cot.cliente_instagram) {
      document.getElementById("detalleInstagramDiv").style.display = "block";
      document.getElementById("detalleInstagram").textContent =
        cot.cliente_instagram;
    } else {
      document.getElementById("detalleInstagramDiv").style.display = "none";
    }

    // Mostrar tabla de items
    const bodyTabla = document.getElementById("bodyDetalleTablaItems");
    let totalGeneral = 0;

    if (cot.items && cot.items.length > 0) {
      bodyTabla.innerHTML = cot.items
        .map((item) => {
          const subtotal = item.cantidad * item.precio_unitario;
          totalGeneral += subtotal;
          return `
            <tr style="border-bottom: 1px solid #ecf0f1;">
              <td style="padding: 10px;">${item.producto_nombre}</td>
              <td style="padding: 10px; text-align: center;">${
                item.cantidad
              }</td>
              <td style="padding: 10px; text-align: right;">$${parseInt(
                item.precio_unitario
              ).toLocaleString("es-CL")}</td>
              <td style="padding: 10px; text-align: right; font-weight: 600;">$${parseInt(
                subtotal
              ).toLocaleString("es-CL")}</td>
            </tr>
          `;
        })
        .join("");
    } else {
      bodyTabla.innerHTML =
        '<tr><td colspan="4" style="padding: 10px; text-align: center; color: #7f8c8d;">Sin items</td></tr>';
    }

    document.getElementById("detalleTotal").textContent =
      parseInt(totalGeneral);

    document.getElementById("detalleEstado").textContent =
      cot.estado === "pendiente"
        ? "Pendiente"
        : cot.estado === "enviada"
        ? "Enviada"
        : cot.estado === "confirmada"
        ? "Confirmada"
        : "Rechazada";
    document.getElementById("detalleFechaCreacion").textContent = new Date(
      cot.fecha_creacion
    ).toLocaleDateString("es-CL");

    // Manejo del mensaje WhatsApp
    const mensajeWhatsapp = cot.mensaje_whatsapp || "Mensaje no disponible";
    document.getElementById("detalleMessageWhatsapp").value = mensajeWhatsapp;

    // Mostrar info de envío si ya fue enviada
    const envioInfo = document.getElementById("detalleEnvioInfo");
    if (cot.fecha_envio) {
      envioInfo.style.display = "block";
      document.getElementById("detalleFechaEnvio").textContent = new Date(
        cot.fecha_envio
      ).toLocaleDateString("es-CL");
      document.getElementById("detalleCanal").textContent =
        cot.canal_envio || "—";
    } else {
      envioInfo.style.display = "none";
    }

    // Mostrar botones según estado
    const btnMarcarEnviada = document.getElementById("btnMarcarEnviada");
    const btnMarcarConfirmada = document.getElementById("btnMarcarConfirmada");
    const btnEliminar = document.getElementById("btnEliminarCotizacion");
    const detalleAcciones = document.getElementById("detalleAccionesDiv");

    if (cot.estado === "pendiente") {
      btnMarcarEnviada.style.display = "inline-block";
      btnMarcarConfirmada.style.display = "none";
      btnEliminar.style.display = "inline-block";
      detalleAcciones.style.display = "block";
    } else if (cot.estado === "enviada") {
      btnMarcarEnviada.style.display = "none";
      btnMarcarConfirmada.style.display = "inline-block";
      btnEliminar.style.display = "inline-block";
      detalleAcciones.style.display = "none";
    } else if (cot.estado === "confirmada") {
      btnMarcarEnviada.style.display = "none";
      btnMarcarConfirmada.style.display = "none";
      btnEliminar.style.display = "inline-block";
      detalleAcciones.style.display = "none";
    } else {
      btnMarcarEnviada.style.display = "none";
      btnMarcarConfirmada.style.display = "none";
      btnEliminar.style.display = "inline-block";
      detalleAcciones.style.display = "none";
    }

    document.getElementById("modalDetalleCotizacion").style.display = "block";
  } catch (err) {
    console.error("Error:", err);
    alert("Error al cargar cotización");
  }
}

function cerrarModalDetalleCotizacion() {
  document.getElementById("modalDetalleCotizacion").style.display = "none";
  cotizacionActual = null;
}

// ============================================================================
// COMPARTIR POR WHATSAPP
// ============================================================================

async function compartirPorWhatsapp() {
  if (!cotizacionActual) return;

  const mensaje = cotizacionActual.mensaje_whatsapp;
  const telefono = cotizacionActual.cliente_telefono.replace(/\D/g, ""); // Remover caracteres no numéricos

  // Agregar código de país si no lo tiene
  let numeroFormato = telefono;
  if (!telefono.startsWith("56")) {
    numeroFormato =
      "56" + (telefono.startsWith("9") ? telefono : "9" + telefono);
  }

  const urlWhatsapp = `https://wa.me/${numeroFormato}?text=${encodeURIComponent(
    mensaje
  )}`;

  // Abrir WhatsApp primero
  window.open(urlWhatsapp, "_blank");

  // Luego marcar como enviada
  await marcarEnviadoPor("whatsapp");
}

// ============================================================================
// COPIAR PARA INSTAGRAM
// ============================================================================

function copiarAlPortapapeles() {
  if (!cotizacionActual) return;

  const mensaje = cotizacionActual.mensaje_whatsapp;

  navigator.clipboard
    .writeText(mensaje)
    .then(() => {
      alert(
        "? Mensaje copiado al portapapeles.\n\nPuedes pegarlo en Instagram Direct Message"
      );
      marcarEnviadoPor("instagram");
    })
    .catch((err) => {
      console.error("Error al copiar:", err);
      alert("Error al copiar al portapapeles");
    });
}

// ============================================================================
// MARCAR COMO ENVIADA/CONFIRMADA
// ============================================================================

async function marcarEnviadoPor(canal) {
  if (!cotizacionActual) return;

  try {
    const response = await fetch(
      `${API_URL}/cotizaciones/${cotizacionActual.id}/enviar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal_envio: canal }),
      }
    );

    if (!response.ok) throw new Error("Error al marcar como enviada");

    cotizacionActual.estado = "enviada";
    cotizacionActual.canal_envio = canal;
    alert(`? Cotización marcada como enviada por ${canal}`);
    cerrarModalDetalleCotizacion();
    cargarCotizaciones();
  } catch (err) {
    console.error("Error:", err);
    alert("Error al actualizar cotización");
  }
}

async function marcarEnviada() {
  // Esta función se llama desde el botón en el modal
  await marcarEnviadoPor("manual");
}

async function marcarConfirmada() {
  if (!cotizacionActual) return;

  try {
    const response = await fetch(
      `${API_URL}/cotizaciones/${cotizacionActual.id}/confirmar`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Error al confirmar");

    alert("? Cotización confirmada. El cliente realizará el pago.");
    cerrarModalDetalleCotizacion();
    cargarCotizaciones();
  } catch (err) {
    console.error("Error:", err);
    alert("Error al confirmar cotización");
  }
}

// ============================================================================
// ELIMINAR COTIZACIÓN
// ============================================================================

function eliminarCotizacionConfirm(id) {
  if (confirm("¿Estás seguro que deseas eliminar esta cotización?")) {
    eliminarCotizacion(id);
  }
}

async function eliminarCotizacion(id = null) {
  const cotId = id || cotizacionActual?.id;
  if (!cotId) return;

  try {
    const response = await fetch(`${API_URL}/cotizaciones/${cotId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar");

    alert("? Cotización eliminada");
    cerrarModalDetalleCotizacion();
    cargarCotizaciones();
  } catch (err) {
    console.error("Error:", err);
    alert("Error al eliminar cotización");
  }
}

// ============================================================================
// CERRAR MODALES AL HACER CLICK AFUERA
// ============================================================================

window.onclick = (event) => {
  const modal1 = document.getElementById("modalNuevaCotizacion");
  const modal2 = document.getElementById("modalDetalleCotizacion");

  if (event.target === modal1) {
    cerrarModalNuevaCotizacion();
  }
  if (event.target === modal2) {
    cerrarModalDetalleCotizacion();
  }
};

// ============================================================================
// PREFILL: SOLICITUDES -> COTIZACIONES + EDITOR DE ITEMS
// ============================================================================

function normalizarTextoParaBusqueda(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buscarProductoPorNombre(nombre) {
  const n = normalizarTextoParaBusqueda(nombre);
  if (!n) return null;
  const list = Array.isArray(productosLista) ? productosLista : [];
  const exact = list.find((p) => normalizarTextoParaBusqueda(p.nombre) === n);
  if (exact) return exact;
  const partial = list.find((p) =>
    normalizarTextoParaBusqueda(p.nombre).includes(n)
  );
  if (partial) return partial;
  const reverse = list.find((p) =>
    n.includes(normalizarTextoParaBusqueda(p.nombre))
  );
  return reverse || null;
}

function escaparHtmlAttr(texto) {
  return String(texto || "").replace(/\"/g, "&quot;");
}

function actualizarCantidadItem(index, value) {
  if (!itemsEnAgregiacion[index]) return;
  const v = Math.max(1, parseInt(value, 10) || 1);
  itemsEnAgregiacion[index].cantidad = v;
  actualizarTablaItems();
}

function actualizarPrecioItem(index, value) {
  if (!itemsEnAgregiacion[index]) return;
  const v = parseInt(value, 10);
  itemsEnAgregiacion[index].precio_unitario = Number.isFinite(v) ? v : 0;
  actualizarTablaItems();
}

function actualizarNombreItem(index, value) {
  if (!itemsEnAgregiacion[index]) return;
  itemsEnAgregiacion[index].producto_nombre = String(value || "").trim();
  actualizarTablaItems();
}

// Sobrescribir render de items para permitir editar cantidad/precio/nombre
actualizarTablaItems = function actualizarTablaItemsOverride() {
  if (!itemsEnAgregiacion || itemsEnAgregiacion.length === 0) {
    document.getElementById("tablaItems").style.display = "none";
    document.getElementById("totalCotizacionDiv").style.display = "none";
    return;
  }

  document.getElementById("tablaItems").style.display = "table";
  document.getElementById("totalCotizacionDiv").style.display = "block";

  const bodyTabla = document.getElementById("bodyTablaItems");
  let totalGeneral = 0;

  bodyTabla.innerHTML = itemsEnAgregiacion
    .map((item, idx) => {
      const cantidad = Math.max(1, parseInt(item.cantidad, 10) || 1);
      const precio = parseInt(item.precio_unitario, 10) || 0;
      const subtotal = cantidad * precio;
      totalGeneral += subtotal;

      const editableNombre = !item.producto_id;
      const needsPrice = !precio || precio <= 0;

      const productoCell = editableNombre
        ? `<input type="text" value="${escaparHtmlAttr(
            item.producto_nombre
          )}" onchange="actualizarNombreItem(${idx}, this.value)" style="width:100%; padding:6px; border-radius:6px; border:1px solid #cbd5e1;" />`
        : `${item.producto_nombre}`;

      return `
        <tr style="border-bottom: 1px solid #ecf0f1;">
          <td style="padding: 10px;">${productoCell}</td>
          <td style="padding: 10px; text-align: center;">
            <input type="number" min="1" value="${cantidad}" onchange="actualizarCantidadItem(${idx}, this.value)" style="width:70px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; text-align:center;" />
          </td>
          <td style="padding: 10px; text-align: right;">
            <input type="number" min="0" value="${
              precio || ""
            }" placeholder="0" onchange="actualizarPrecioItem(${idx}, this.value)" style="width:110px; padding:6px; border-radius:6px; border:1px solid ${
        needsPrice ? "#ef4444" : "#cbd5e1"
      }; text-align:right;" />
          </td>
          <td style="padding: 10px; text-align: right; font-weight: 600;">$${parseInt(
            subtotal,
            10
          ).toLocaleString("es-CL")}</td>
          <td style="padding: 10px; text-align: center;">
            <button onclick="eliminarItemTemporal(${idx})" class="btn btn-small btn-danger">&#128465;&#65039;</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("totalCotizacion").textContent = parseInt(
    totalGeneral,
    10
  ).toLocaleString("es-CL");
};

// Validar items antes de guardar (precio > 0, nombre, cantidad)
if (typeof guardarCotizacion === "function") {
  const guardarCotizacionOriginal = guardarCotizacion;
  guardarCotizacion = async function guardarCotizacionOverride() {
    const invalid = (itemsEnAgregiacion || []).filter((it) => {
      const nombre = String(it && it.producto_nombre).trim();
      const cantidad = parseInt(it && it.cantidad, 10) || 0;
      const precio = parseInt(it && it.precio_unitario, 10) || 0;
      return !nombre || cantidad < 1 || precio < 1;
    });

    if (invalid.length > 0) {
      alert(
        "Hay items incompletos. Verifica nombre, cantidad y precio unitario (> 0) antes de crear la cotizacion."
      );
      return;
    }

    return guardarCotizacionOriginal();
  };
}

// Cargar prefill desde Solicitudes y abrir modal
document.addEventListener("DOMContentLoaded", () => {
  const prefillRaw = sessionStorage.getItem("cotizacionPrefill");
  if (!prefillRaw) return;

  let pre = null;
  try {
    pre = JSON.parse(prefillRaw);
  } catch (e) {
    console.error("Prefill cotizacion invalido:", e);
  }

  sessionStorage.removeItem("cotizacionPrefill");

  if (!pre) return;

  setTimeout(() => {
    try {
      if (pre.cliente) {
        document.getElementById("clienteNombre").value = pre.cliente.nombre || "";
        document.getElementById("clienteTelefono").value = pre.cliente.telefono || "";
      }

      abrirModalNuevaCotizacion();

      if (Array.isArray(pre.items) && pre.items.length > 0) {
        itemsEnAgregiacion = pre.items
          .map((it) => {
            const nombre = String((it && it.nombre) || "").trim();
            const cantidad = Math.max(1, parseInt(it && it.cantidad, 10) || 1);
            if (!nombre) return null;

            const match = buscarProductoPorNombre(nombre);
            if (match) {
              return {
                producto_id: match.id,
                producto_nombre: match.nombre,
                duracion: match.duracion,
                cantidad,
                precio_unitario: parseInt(match.precio_venta_clp, 10) || 0,
              };
            }

            return {
              producto_id: null,
              producto_nombre: nombre,
              duracion: null,
              cantidad,
              precio_unitario: 0,
            };
          })
          .filter(Boolean);

        actualizarTablaItems();
        alert(
          "Se cargaron " +
            pre.items.length +
            " item(s) desde Solicitudes. Revisa precios antes de crear la cotizacion."
        );
      }
    } catch (e) {
      console.error("Error aplicando prefill cotizacion:", e);
    }
  }, 500);
});




