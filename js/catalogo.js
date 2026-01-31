// frontend/js/catalogo.js
// Lógica del frontend para gestión del catálogo de productos

const API_URL = "http://127.0.0.1:3000/api/catalogo";
const PLACEHOLDER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#f0f0f0"/><rect x="10" y="10" width="130" height="130" fill="#ffffff" stroke="#c9c9c9"/><text x="75" y="85" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666">IMG</text></svg>';
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," + encodeURIComponent(PLACEHOLDER_SVG);
let productos = [];
let productoEditando = null;
let filtroCategoria = ""; // Variable para almacenar categoría seleccionada
let filtroBusqueda = ""; // Variable para almacenar texto de búsqueda

function getCompraUrl(rawUrl) {
  if (!rawUrl) return "";
  const trimmed = String(rawUrl).trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

// Función para formatear dinero en pesos chilenos sin decimales
function formatMoney(amount) {
  const value = Number(amount || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${formatted}`;
}

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarEstadisticas();

  // Agregar event listeners a botones de categoría
  const botonesCategoria = document.querySelectorAll(".btn-categoria");
  botonesCategoria.forEach((boton) => {
    boton.addEventListener("click", function () {
      // Remover clase active de todos los botones
      botonesCategoria.forEach((btn) => btn.classList.remove("active"));
      // Agregar clase active al botón clickeado
      this.classList.add("active");
      // Establecer el filtro de categoría
      filtroCategoria = this.getAttribute("data-categoria");
      // Re-renderizar tabla con el nuevo filtro
      renderizarTabla();
    });
  });

  // Marcar el primer botón (Todos) como activo por defecto
  if (botonesCategoria.length > 0) {
    botonesCategoria[0].classList.add("active");
  }
});

// Cargar todos los productos
async function cargarProductos() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // El backend ahora retorna directamente un array
    if (Array.isArray(data)) {
      productos = data;
      renderizarTabla();
      console.log(`✅ Catálogo cargado: ${productos.length} productos`);
    } else {
      console.error("Formato de respuesta inesperado:", data);
      alert("Error: Formato de respuesta inválido del servidor");
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
    alert("Error al cargar productos. Revisa la consola.");
  }
}

// Cargar estadísticas
async function cargarEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/stats/resumen`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // El backend retorna { ok: true, stats: {...} }
    if (data.ok && data.stats) {
      const stats = data.stats;
      document.getElementById("stat-total").textContent =
        stats.total_productos || 0;
      document.getElementById("stat-activos").textContent =
        stats.productos_activos || 0;

      const margenPromedio = parseFloat(stats.margen_promedio || 0);
      document.getElementById("stat-margen").textContent =
        margenPromedio.toFixed(1) + "%";
    } else {
      console.error("Formato de estadísticas inválido:", data);
    }
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
}

// Renderizar tabla de productos
function renderizarTabla() {
  const tbody = document.getElementById("tabla-productos");
  const emptyState = document.getElementById("empty-state");

  // Filtrar productos por categoría y búsqueda
  let productosFiltrados = productos;

  // Filtro por categoría
  if (filtroCategoria && filtroCategoria !== "") {
    productosFiltrados = productosFiltrados.filter(
      (p) => (p.categoria || "general") === filtroCategoria
    );
  }

  // Filtro por búsqueda de texto
  if (filtroBusqueda && filtroBusqueda.trim() !== "") {
    const busquedaLower = filtroBusqueda.toLowerCase();
    productosFiltrados = productosFiltrados.filter((p) =>
      p.nombre.toLowerCase().includes(busquedaLower)
    );
  }

  if (productosFiltrados.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tbody.innerHTML = productosFiltrados
    .map((producto) => {
      const margenClp = parseFloat(producto.margen_clp || 0);
      const margenPorcentaje = parseFloat(producto.margen_porcentaje || 0);
      const precioCompraUsd = parseFloat(producto.precio_venta_clp_compra_usd || 0);
      const precioCompraRealUsd = parseFloat(
        producto.precio_venta_clp_compra_real_usd || 0
      );
      const precioCompraClp = parseFloat(producto.precio_venta_clp_compra_clp || 0);
      const precioVentaClp = parseFloat(producto.precio_venta_clp_venta_clp || 0);
      const precioOficialClp = parseFloat(producto.precio_venta_clp_oficial_clp || 0);
      const compraUrl = getCompraUrl(producto.url_compra);
      const imagenOriginal = producto.imagen || "";
      const imagen =
        !imagenOriginal || /via\.placeholder\.com/i.test(imagenOriginal)
          ? PLACEHOLDER_IMAGE
          : imagenOriginal;
      const nombreHtml = compraUrl
        ? `<a href="${compraUrl}" target="_blank" rel="noopener noreferrer" style="color:#2c3e50; text-decoration:underline;">${producto.nombre}</a>`
        : producto.nombre;

      return `
      <tr>
        <td>
          <div style="display:flex; gap:10px; align-items:center;">
            <img 
              src="${imagen}" 
              alt="${producto.nombre}" 
              onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'; this.style.borderRadius='4px';"
              style="width:50px; height:50px; border-radius:6px; object-fit:contain; background:#f0f0f0; padding:2px;">
            <div>
              <strong>${nombreHtml}</strong>
              <br>
              <small style="color:#7f8c8d;">${
                producto.es_servicio ? "Servicio" : "Producto"
              }</small>
            </div>
          </div>
        </td>
        <td>${producto.duracion}</td>
        <td class="precio-cell">
          ${formatMoney(Math.round(precioCompraClp))} CLP
        </td>
        <td class="precio-cell">$${Math.round(precioVentaClp).toLocaleString(
          "es-CL"
        )} CLP
          ${
            precioOficialClp > 0
              ? `<br><small style="color:#7f8c8d">Oficial: $${Math.round(
                  precioOficialClp
                )}CLP</small>`
              : ""
          }
        </td>
        <td>
          <div class="margen-positivo">
            +${formatMoney(Math.round(margenClp))} CLP
            <br>
            <small>(${margenPorcentaje.toFixed(1)}%)</small>
          </div>
        </td>
        <td>
          <span class="badge ${
            producto.activo ? "badge-activo" : "badge-inactivo"
          }">
            ${producto.activo ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td>
          <div class="acciones">
            <button class="btn-accion btn-editar" onclick="editarProducto(${
              producto.id
            })">✏️ Editar</button>
            <button class="btn-accion" onclick="cotizarProducto(${
              producto.id
            }, '${producto.nombre.replace(/'/g, "\\'")}', ${
        producto.precio_venta_clp
      })" style="background: #3498db; color: white;">🗒️ Cotizar</button>
            <button class="btn-accion btn-eliminar" onclick="eliminarProducto(${
              producto.id
            })">🗑️</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

// Función para filtrar productos por búsqueda de texto
function filtrarProductos() {
  const inputBusqueda = document.getElementById("buscar-producto");
  filtroBusqueda = inputBusqueda ? inputBusqueda.value : "";
  renderizarTabla();
}

// Abrir modal para nuevo producto
function abrirModalNuevo() {
  productoEditando = null;
  document.getElementById("modal-title").textContent = "Nuevo Producto";
  document.getElementById("form-producto").reset();
  document.getElementById("margen-preview").style.display = "none";
  document.getElementById("es_servicio").checked = false;
  toggleServicio();
  cargarProveedoresSelect();
  abrirModal("modal-producto");
}

// Editar producto existente
async function editarProducto(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();

    if (data.ok) {
      productoEditando = data.producto;
      document.getElementById("modal-title").textContent = "Editar Producto";

      // Llenar formulario
      document.getElementById("nombre").value = productoEditando.nombre;
      document.getElementById("duracion").value = productoEditando.duracion;
      document.getElementById("categoria").value =
        productoEditando.categoria || "servicios";
      document.getElementById("url_compra").value =
        productoEditando.url_compra || "";

      // Determinar tipo de proveedor
      const tipoProveedor =
        productoEditando.tipo_proveedor ||
        (productoEditando.precio_compra_usd > 0 ? "z2u" : "manual");
      document.getElementById("tipo_proveedor").value = tipoProveedor;
      document.getElementById("es_servicio").checked =
        productoEditando.es_servicio === true;
      toggleServicio();
      toggleCamposProveedor();

      // Llenar campos según tipo
      if (tipoProveedor === "z2u") {
        document.getElementById("precio_compra_usd").value =
          productoEditando.precio_compra_usd;
        document.getElementById("tipo_cambio_usd_clp").value =
          productoEditando.tipo_cambio_usd_clp;
        document.getElementById("impuesto_z2u_porcentaje").value =
          productoEditando.impuesto_z2u_porcentaje;
        document.getElementById("impuesto_z2u_fijo_usd").value =
          productoEditando.impuesto_z2u_fijo_usd;
      } else {
        document.getElementById("precio_compra_clp").value =
          productoEditando.precio_compra_clp || 0;
      }

      document.getElementById("precio_venta_clp").value =
        productoEditando.precio_venta_clp;
      // Precio oficial (si existe)
      const oficial = productoEditando.precio_oficial_clp;
      if (typeof oficial !== "undefined") {
        document.getElementById("precio_oficial_clp").value = oficial || "";
      }
      document.getElementById("stock_minimo").value =
        productoEditando.stock_minimo;
      document.getElementById("es_compartida").checked =
        productoEditando.es_compartida !== false;

      calcularMargen();
      await cargarProveedoresSelect(productoEditando.proveedor_id);
      abrirModal("modal-producto");
    }
  } catch (error) {
    console.error("Error cargando producto:", error);
    alert("Error al cargar el producto");
  }
}

// Cerrar modal (mejorado para soportar múltiples modales)
function cerrarModal(modalId = "modal-producto") {
  document.getElementById(modalId).classList.remove("active");
  if (modalId === "modal-producto") {
    productoEditando = null;
  }
}

// Abrir modal (mejorado)
function abrirModal(modalId = "modal-producto") {
  document.getElementById(modalId).classList.add("active");
}

// Alternar campos según tipo de proveedor
function toggleCamposProveedor() {
  const tipoProveedor = document.getElementById("tipo_proveedor").value;

  const grupoZ2U = document.getElementById("grupo_precio_z2u");
  const grupoManual = document.getElementById("grupo_precio_manual");
  const grupoTipoCambio = document.getElementById("grupo_tipo_cambio");
  const grupoImpuesto = document.getElementById("grupo_impuesto_z2u");

  // Si es servicio, ocultamos todo y salimos
  const esServicio = document.getElementById("es_servicio").checked;
  if (esServicio) {
    grupoZ2U.style.display = "none";
    grupoManual.style.display = "none";
    grupoTipoCambio.style.display = "none";
    grupoImpuesto.style.display = "none";
    return;
  }

  if (tipoProveedor === "z2u") {
    grupoZ2U.style.display = "block";
    grupoManual.style.display = "none";
    grupoTipoCambio.style.display = "block";
    grupoImpuesto.style.display = "block";

    // Limpiar campo manual
    document.getElementById("precio_compra_clp").value = "";
  } else {
    // Productos manuales/propios: mostrar campo manual pero puede ser $0
    grupoZ2U.style.display = "none";
    grupoManual.style.display = "block";
    grupoTipoCambio.style.display = "none";
    grupoImpuesto.style.display = "none";

    // Limpiar campos Z2U y sugerir 0 para propios
    document.getElementById("precio_compra_usd").value = "";
    if (!document.getElementById("precio_compra_clp").value) {
      document.getElementById("precio_compra_clp").value = "0";
    }
  }

  calcularMargen();
} // Calcular y mostrar margen en tiempo real
function calcularMargen() {
  const tipoProveedor = document.getElementById("tipo_proveedor").value;
  const precioVentaClp =
    parseFloat(document.getElementById("precio_venta_clp").value) || 0;

  let costoRealClp = 0;
  let costoRealUsd = 0;

  if (tipoProveedor === "z2u") {
    // Cálculo para productos Z2U
    const precioCompraUsd =
      parseFloat(document.getElementById("precio_compra_usd").value) || 0;
    const tipoCambio =
      parseFloat(document.getElementById("tipo_cambio_usd_clp").value) || 950;
    const impuestoPorcentaje =
      parseFloat(document.getElementById("impuesto_z2u_porcentaje").value) ||
      4.5;
    const impuestoFijo =
      parseFloat(document.getElementById("impuesto_z2u_fijo_usd").value) || 0.4;

    if (precioCompraUsd > 0 && tipoCambio > 0) {
      // Calcular costo real en USD (con impuestos Z2U)
      costoRealUsd =
        precioCompraUsd +
        (precioCompraUsd * impuestoPorcentaje) / 100 +
        impuestoFijo;

      // Convertir a CLP
      costoRealClp = costoRealUsd * tipoCambio;
    }
  } else if (tipoProveedor === "manual") {
    // Cálculo para productos manuales
    costoRealClp =
      parseFloat(document.getElementById("precio_compra_clp").value) || 0;
  } else if (tipoProveedor === "propio") {
    // Productos propios: leer el costo CLP (puede ser 0)
    costoRealClp =
      parseFloat(document.getElementById("precio_compra_clp").value) || 0;
  }

  if (precioVentaClp > 0) {
    // Calcular margen
    const margenClp = precioVentaClp - costoRealClp;
    const margenPorcentaje =
      costoRealClp > 0 ? (margenClp / costoRealClp) * 100 : 100;

    document.getElementById("preview-margen-pesos").textContent =
      formatMoney(Math.round(margenClp)) + " CLP";
    document.getElementById("preview-margen-porcentaje").textContent =
      margenPorcentaje.toFixed(1) + "%";

    // Mostrar costo real
    const previewDiv = document.getElementById("margen-preview");
    if (!document.getElementById("costo-real-info")) {
      const costoInfo = document.createElement("p");
      costoInfo.id = "costo-real-info";
      costoInfo.style.fontSize = "12px";
      costoInfo.style.color = "#7f8c8d";
      costoInfo.style.marginTop = "8px";
      previewDiv.insertBefore(costoInfo, previewDiv.firstChild);
    }

    // Mostrar costo según tipo de proveedor
    let costoHtml = "<strong>Costo real:</strong> ";
    if (tipoProveedor === "z2u" && costoRealUsd > 0) {
      costoHtml += `$${costoRealUsd.toFixed(2)} USD = $${Math.round(
        costoRealClp
      )} CLP`;
    } else {
      costoHtml += formatMoney(Math.round(costoRealClp)) + " CLP";
    }
    document.getElementById("costo-real-info").innerHTML = costoHtml;

    // Cambiar color según margen
    const previewPorcentaje = document.getElementById(
      "preview-margen-porcentaje"
    );
    if (margenPorcentaje < 30) {
      previewPorcentaje.style.color = "#e74c3c";
    } else if (margenPorcentaje < 60) {
      previewPorcentaje.style.color = "#f39c12";
    } else {
      previewPorcentaje.style.color = "#27ae60";
    }

    document.getElementById("margen-preview").style.display = "block";
  } else {
    document.getElementById("margen-preview").style.display = "none";
  }
}

// Alternar modo servicio (oculta costos y stock, fuerza proveedor servicio)
function toggleServicio() {
  const esServicio = document.getElementById("es_servicio").checked;
  const tipoProveedorSelect = document.getElementById("tipo_proveedor");
  const stockInput = document.getElementById("stock_minimo");
  const esCompartida = document.getElementById("es_compartida");

  if (esServicio) {
    tipoProveedorSelect.value = "propio";
    stockInput.value = 0;
    esCompartida.checked = false;
    esCompartida.disabled = true;
    document.getElementById("grupo_precio_z2u").style.display = "none";
    document.getElementById("grupo_precio_manual").style.display = "none";
    document.getElementById("grupo_tipo_cambio").style.display = "none";
    document.getElementById("grupo_impuesto_z2u").style.display = "none";
  } else {
    esCompartida.disabled = false;
    toggleCamposProveedor();
  }
}

// Guardar producto (crear o actualizar)
async function guardarProducto(event) {
  event.preventDefault();

  const tipoProveedor = document.getElementById("tipo_proveedor").value;
  const esServicio = document.getElementById("es_servicio").checked;
  const proveedorId = document.getElementById("proveedor_producto").value;
  const urlCompraInput = document.getElementById("url_compra");
  const urlCompra = urlCompraInput ? urlCompraInput.value.trim() : "";

  const formData = {
    nombre: document.getElementById("nombre").value,
    duracion: document.getElementById("duracion").value,
    categoria: document.getElementById("categoria").value,
    precio_venta_clp: parseFloat(
      document.getElementById("precio_venta_clp").value
    ),
    precio_oficial_clp: parseFloat(
      document.getElementById("precio_oficial_clp").value || 0
    ),
    stock_minimo: esServicio
      ? 0
      : parseInt(document.getElementById("stock_minimo").value) || 5,
    es_compartida: esServicio
      ? false
      : document.getElementById("es_compartida").checked,
    activo: true,
    tipo_proveedor: esServicio ? "servicio" : tipoProveedor,
    es_servicio: esServicio,
  };

  // Agregar campos según tipo de proveedor
  if (!esServicio && tipoProveedor === "z2u") {
    formData.precio_compra_usd =
      parseFloat(document.getElementById("precio_compra_usd").value) || 0;
    formData.tipo_cambio_usd_clp =
      parseFloat(document.getElementById("tipo_cambio_usd_clp").value) || 950;
    formData.impuesto_z2u_porcentaje =
      parseFloat(document.getElementById("impuesto_z2u_porcentaje").value) ||
      4.5;
    formData.impuesto_z2u_fijo_usd =
      parseFloat(document.getElementById("impuesto_z2u_fijo_usd").value) || 0.4;

    // Calcular precio_compra_clp para BD
    const costoRealUsd =
      formData.precio_compra_usd +
      (formData.precio_compra_usd * formData.impuesto_z2u_porcentaje) / 100 +
      formData.impuesto_z2u_fijo_usd;
    formData.precio_compra_clp = Math.round(
      costoRealUsd * formData.tipo_cambio_usd_clp
    );
  } else if (!esServicio) {
    formData.precio_compra_clp =
      parseFloat(document.getElementById("precio_compra_clp").value) || 0;
    formData.precio_compra_usd = 0;
    formData.tipo_cambio_usd_clp = 950;
    formData.impuesto_z2u_porcentaje = 0;
    formData.impuesto_z2u_fijo_usd = 0;
  } else {
    // Servicio: sin costo de compra
    formData.precio_compra_clp = 0;
    formData.precio_compra_usd = 0;
    formData.tipo_cambio_usd_clp = 0;
    formData.impuesto_z2u_porcentaje = 0;
    formData.impuesto_z2u_fijo_usd = 0;
  }

  // Validación
  if (formData.precio_venta_clp <= 0) {
    alert("⚠️ El precio de venta debe ser mayor a cero");
    return;
  }

  if (formData.precio_oficial_clp < 0) {
    alert("⚠️ El precio oficial no puede ser negativo");
    return;
  }

  if (
    !esServicio &&
    tipoProveedor === "z2u" &&
    formData.precio_compra_usd <= 0
  ) {
    alert("⚠️ El precio base Z2U debe ser mayor a cero");
    return;
  }

  if (
    !esServicio &&
    tipoProveedor === "manual" &&
    formData.precio_compra_clp <= 0
  ) {
    alert("�s���? El precio de compra debe ser mayor a cero");
    return;
  }

  if (urlCompra && !proveedorId) {
    alert("Selecciona un proveedor para guardar la URL de compra.");
    return;
  }

  // Productos propios no requieren validación de costo (es 0)

  try {
    const url = productoEditando
      ? `${API_URL}/${productoEditando.id}`
      : API_URL;

    const method = productoEditando ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.ok) {
      // Asociar o actualizar proveedor-producto tanto en creación como edición
      if (proveedorId) {
        let precioProveedorUSD = 0;
        if (tipoProveedor === "z2u") {
          precioProveedorUSD =
            parseFloat(document.getElementById("precio_compra_usd").value) || 0;
        } else if (tipoProveedor === "manual") {
          const clp =
            parseFloat(document.getElementById("precio_compra_clp").value) || 0;
          const tc =
            parseFloat(document.getElementById("tipo_cambio_usd_clp").value) ||
            950;
          precioProveedorUSD = clp > 0 && tc > 0 ? clp / tc : 0;
        }
        await fetch(
          `http://127.0.0.1:3000/api/proveedores/${proveedorId}/productos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              producto_id: data.producto?.id || data.id,
              precio_proveedor_usd: precioProveedorUSD,
              url_compra: urlCompra || null,
              notas: null,
            }),
          }
        );
      }
      alert(
        productoEditando ? "✅ Producto actualizado" : "✅ Producto creado"
      );
      cerrarModal();
      cargarProductos();
      cargarEstadisticas();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (error) {
    console.error("Error guardando producto:", error);
    alert("Error al guardar. Revisa la consola.");
  }
}

// Cargar proveedores activos en el select del formulario de producto
async function cargarProveedoresSelect(selectedId = null) {
  try {
    const res = await fetch(
      "http://127.0.0.1:3000/api/proveedores?estado=activo"
    );
    const proveedores = await res.json();
    const select = document.getElementById("proveedor_producto");
    select.innerHTML =
      '<option value="">-- Sin asignar --</option>' +
      proveedores
        .map(
          (p) =>
            `<option value="${p.id}"${
              selectedId && Number(selectedId) === p.id ? " selected" : ""
            }>${p.nombre} (${p.plataforma})</option>`
        )
        .join("");
  } catch (e) {
    console.error("No se pudieron cargar proveedores", e);
  }
}

// Confirmar eliminación
function confirmarEliminar(id, nombre) {
  if (
    confirm(
      `¿Estás seguro de eliminar "${nombre}"?\n\nEsto desactivará el producto.`
    )
  ) {
    eliminarProducto(id);
  }
}

// Eliminar (desactivar) producto
// Formatear números como moneda chilena
function formatearPrecio(numero) {
  return formatMoney(parseFloat(numero));
}

// ==================== ELIMINACIÓN DE PRODUCTOS ====================

let productoAEliminar = null;

function eliminarProducto(id) {
  // Buscar el producto en el array
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    alert("❌ Producto no encontrado");
    return;
  }

  // Guardar el ID y nombre del producto
  productoAEliminar = id;
  document.getElementById(
    "producto-eliminar-nombre"
  ).textContent = `${producto.nombre} - ${producto.duracion}`;

  // Abrir modal de confirmación
  abrirModal("modal-confirmar-eliminar");
}

function cerrarModalConfirmar() {
  cerrarModal("modal-confirmar-eliminar");
  productoAEliminar = null;
}

async function confirmarEliminacion() {
  if (!productoAEliminar) {
    alert("❌ Error: No hay producto seleccionado");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/${productoAEliminar}?permanente=true`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (data.ok) {
      alert("✅ Producto eliminado permanentemente");
      cerrarModalConfirmar();
      cargarProductos();
      cargarEstadisticas();
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (error) {
    console.error("Error eliminando producto:", error);
    alert("❌ Error al eliminar. Revisa la consola.");
  }
}

// ==================== CUENTAS COMPARTIDAS ====================

function abrirModalCuentaCompartida() {
  document.getElementById("modal-cuenta-titulo").textContent =
    "Nueva Cuenta Compartida";
  document.getElementById("form-cuenta-compartida").reset();
  document.getElementById("cc-slots").value = 4;
  document.getElementById("preview-cuenta").style.display = "none";
  abrirModal("modal-cuenta-compartida");
}

function cerrarModalCuentaCompartida() {
  cerrarModal("modal-cuenta-compartida");
}

function calcularMargenCuenta() {
  const precioMensualClp =
    parseFloat(document.getElementById("cc-precio-mensual").value) || 0;
  const slots = parseInt(document.getElementById("cc-slots").value) || 1;
  const precioPorSlotClp =
    parseFloat(document.getElementById("cc-precio-slot").value) || 0;

  if (precioMensualClp > 0 && precioPorSlotClp > 0 && slots > 0) {
    const costoEnClp = precioMensualClp;
    const ingresosTotales = precioPorSlotClp * slots;
    const ganancia = ingresosTotales - costoEnClp;
    const margenPct =
      ingresosTotales > 0 ? ((ganancia / ingresosTotales) * 100).toFixed(1) : 0;

    document.getElementById("preview-costo").textContent =
      formatMoney(Math.round(precioMensualClp)) + " CLP";
    document.getElementById("preview-ingresos").textContent =
      formatearPrecio(ingresosTotales);
    document.getElementById("preview-ganancia-total").textContent =
      formatearPrecio(ganancia);
    document.getElementById("preview-margen-pct").textContent = margenPct + "%";

    document.getElementById("preview-cuenta").style.display = "block";
  } else {
    document.getElementById("preview-cuenta").style.display = "none";
  }
}

async function guardarCuentaCompartida(event) {
  event.preventDefault();

  const nombre = document.getElementById("cc-nombre").value.trim();
  const duracion = document.getElementById("cc-duracion").value;
  const email = document.getElementById("cc-email").value.trim();
  const password = document.getElementById("cc-password").value.trim();
  const precioMensualClp =
    parseFloat(document.getElementById("cc-precio-mensual").value) || 0;
  const slots = parseInt(document.getElementById("cc-slots").value) || 1;
  const precioPorSlotClp =
    parseFloat(document.getElementById("cc-precio-slot").value) || 0;

  // Validaciones
  if (
    !nombre ||
    !email ||
    !password ||
    precioMensualClp <= 0 ||
    precioPorSlotClp <= 0 ||
    slots < 1
  ) {
    alert("Por favor completa todos los campos correctamente");
    return;
  }

  // Validación adicional de longitud
  if (email.length > 255) {
    alert("❌ El email es demasiado largo (máximo 255 caracteres)");
    return;
  }

  if (password.length > 255) {
    alert("❌ La contraseña es demasiado larga (máximo 255 caracteres)");
    return;
  }

  try {
    // 1. Crear producto en catálogo
    const productoData = {
      nombre: nombre,
      duracion: duracion,
      precio_compra_usd: precioMensualClp / 950, // Convertir de CLP a USD para mantener consistencia BD
      precio_venta_clp: precioPorSlotClp,
      tipo_cambio_usd_clp: 950,
      impuesto_z2u_porcentaje: 0,
      impuesto_z2u_fijo_usd: 0,
      stock_minimo: 1,
      activo: true,
    };

    const productoRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoData),
    });

    const productoResult = await productoRes.json();

    if (!productoRes.ok || !productoResult.ok) {
      alert(
        "❌ Error al crear producto: " +
          (productoResult.error || "Error desconocido")
      );
      return;
    }

    // Obtener ID del producto desde la respuesta
    const productoId = productoResult.producto?.id;
    if (!productoId) {
      alert("❌ Error: No se pudo obtener el ID del producto creado");
      return;
    }

    // 2. Crear cuenta en gestión de cuentas
    const cuentaData = {
      producto_id: productoId,
      usuario: email,
      contrasena: password,
      slots_totales: slots,
      proveedor: "Manual",
      precio_compra_real: precioMensualClp, // Ya está en CLP
      fecha_compra: new Date().toISOString().split("T")[0],
      fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notas: "Cuenta compartida creada desde catálogo",
    };

    console.log("Enviando datos de cuenta:", cuentaData);

    const cuentaRes = await fetch("http://127.0.0.1:3000/api/cuentas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuentaData),
    });

    const cuentaResult = await cuentaRes.json();
    console.log("Respuesta de crear cuenta:", cuentaResult);

    if (!cuentaRes.ok) {
      alert(
        "⚠️ Producto creado pero error al crear cuenta: " +
          (cuentaResult.error || "Error desconocido")
      );
      return;
    }

    alert(
      "✅ Cuenta compartida creada exitosamente!\n\n" +
        "Producto: " +
        nombre +
        "\n" +
        "Slots: " +
        slots +
        "\n" +
        "Precio/Slot: $" +
        formatMoney(precioPorSlotClp).slice(1) +
        " CLP\n\n" +
        "La cuenta está lista en Gestión de Cuentas"
    );

    cerrarModalCuentaCompartida();
    cargarProductos();
    cargarEstadisticas();
  } catch (error) {
    console.error("Error creando cuenta compartida:", error);
    alert("Error al crear la cuenta compartida. Revisa la consola.");
  }
}

// ============================================================================
// COTIZAR PRODUCTO - Redirect a cotizaciones con preselección
// ============================================================================

function cotizarProducto(productoId, nombreProducto, precioProducto) {
  // Guardar datos en sessionStorage para que la página de cotizaciones pueda usarlos
  sessionStorage.setItem("productoIdPreseleccionado", productoId);
  sessionStorage.setItem("productoNombrePreseleccionado", nombreProducto);
  sessionStorage.setItem("productoPrecioPreseleccionado", precioProducto);

  // Redirigir a cotizaciones
  window.location.href = "cotizaciones.html";
}

// Sincronizar precio de venta con el oficial
function sincronizarConOficial() {
  const check = document.getElementById("sincronizar_precio_oficial").checked;
  const oficial = parseFloat(
    document.getElementById("precio_oficial_clp").value || 0
  );
  if (check && oficial > 0) {
    document.getElementById("precio_venta_clp").value = oficial;
    calcularMargen();
  }
}


