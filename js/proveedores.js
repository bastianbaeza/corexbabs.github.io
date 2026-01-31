const API_URL = "http://127.0.0.1:3000/api";

let proveedores = [];
let catalogo = [];
let proveedorActual = null;
let proveedorAEliminar = null;

// Función para formatear tiempo de entrega
function formatearTiempoEntrega(horas) {
  const h = parseInt(horas);
  if (h === 0) return "⚡ Instantánea";
  if (h < 24) return `${h}h`;
  const dias = Math.floor(h / 24);
  return `${dias} día${dias > 1 ? "s" : ""}`;
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarEstadisticas();
  cargarProveedores();
  cargarCatalogo();
});

// Cargar estadísticas generales
async function cargarEstadisticas() {
  try {
    const res = await fetch(`${API_URL}/proveedores/stats/resumen`);
    const stats = await res.json();

    document.getElementById("stat-total").textContent =
      stats.total_proveedores || 0;
    document.getElementById("stat-activos").textContent =
      stats.proveedores_activos || 0;
    document.getElementById("stat-calificacion").textContent =
      stats.calificacion_promedio || "0.0";
    document.getElementById("stat-productos").textContent =
      stats.productos_disponibles || 0;
    document.getElementById("stat-precio").textContent = `$${parseFloat(
      stats.precio_promedio_usd || 0
    ).toFixed(2)}`;
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

// Cargar proveedores con filtros
async function cargarProveedores() {
  try {
    const plataforma = document.getElementById("filtro-plataforma").value;
    const estado = document.getElementById("filtro-estado").value;
    const busqueda = document.getElementById("filtro-busqueda").value;

    let url = `${API_URL}/proveedores?`;
    if (plataforma) url += `plataforma=${plataforma}&`;
    if (estado) url += `estado=${estado}&`;
    if (busqueda) url += `busqueda=${encodeURIComponent(busqueda)}&`;

    const res = await fetch(url);
    proveedores = await res.json();

    renderizarProveedores();
  } catch (error) {
    console.error("Error al cargar proveedores:", error);
  }
}

// Renderizar tabla de proveedores
function renderizarProveedores() {
  const tbody = document.getElementById("tabla-proveedores");
  const emptyState = document.getElementById("empty-state");

  if (proveedores.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tbody.innerHTML = proveedores
    .map(
      (p) => `
    <tr>
      <td>
        <strong>${p.nombre}</strong>
        ${
          p.url_perfil
            ? `<br><a href="${p.url_perfil}" target="_blank" class="link-externo">🔗 Ver perfil</a>`
            : ""
        }
      </td>
      <td>
        <span class="badge badge-plataforma">${p.plataforma}</span>
      </td>
      <td>
        <div class="calificacion ${getClaseCalificacion(p.calificacion)}">
          ⭐ ${parseFloat(p.calificacion).toFixed(1)}
        </div>
      </td>
      <td>${formatearTiempoEntrega(p.tiempo_entrega_promedio_horas)}</td>
      <td>${p.total_productos || 0} productos</td>
      <td>${p.total_compras || 0} compras</td>
      <td>
        ${
          p.tasa_problemas > 0
            ? `<span style="color: #e74c3c">${parseFloat(
                p.tasa_problemas
              ).toFixed(1)}%</span>`
            : '<span style="color: #27ae60">0%</span>'
        }
      </td>
      <td>
        <span class="badge badge-${p.estado}">${p.estado}</span>
      </td>
      <td>
        <div class="acciones">
          <button class="btn-accion btn-ver" onclick="verDetalles(${
            p.id
          })" title="Ver detalles">
            👁️
          </button>
          <button class="btn-accion btn-editar" onclick="editarProveedor(${
            p.id
          })" title="Editar">
            ✏️
          </button>
          <button class="btn-accion btn-productos" onclick="abrirModalAgregarProducto(${
            p.id
          })" title="Agregar producto">
            ➕
          </button>
          <button class="btn-accion btn-eliminar" onclick="confirmarEliminarProveedor(${
            p.id
          }, '${p.nombre.replace(/'/g, "\\'")}');" title="Eliminar proveedor">
            🗑️
          </button>
      </td>
    </tr>
  `
    )
    .join("");
}

function getClaseCalificacion(cal) {
  const calificacion = parseFloat(cal);
  if (calificacion >= 4.5) return "alta";
  if (calificacion >= 3.5) return "media";
  return "baja";
}

// Aplicar filtros
function aplicarFiltros() {
  cargarProveedores();
}

// Abrir modal para nuevo proveedor
function abrirModalNuevo() {
  document.getElementById("modal-title").textContent = "Nuevo Proveedor";
  document.getElementById("form-proveedor").reset();
  document.getElementById("proveedor-id").value = "";
  document.getElementById("modal-proveedor").classList.add("active");
}

// Editar proveedor
async function editarProveedor(id) {
  try {
    const res = await fetch(`${API_URL}/proveedores/${id}`);
    const data = await res.json();
    const p = data.proveedor;

    document.getElementById("modal-title").textContent = "Editar Proveedor";
    document.getElementById("proveedor-id").value = p.id;
    document.getElementById("nombre").value = p.nombre;
    document.getElementById("plataforma").value = p.plataforma;
    document.getElementById("url_perfil").value = p.url_perfil || "";
    document.getElementById("calificacion").value = p.calificacion;
    document.getElementById("tiempo_entrega_promedio_horas").value =
      p.tiempo_entrega_promedio_horas;
    document.getElementById("estado").value = p.estado;
    document.getElementById("notas").value = p.notas || "";

    document.getElementById("modal-proveedor").classList.add("active");
  } catch (error) {
    console.error("Error al cargar proveedor:", error);
    alert("Error al cargar datos del proveedor");
  }
}

// Guardar proveedor (crear o actualizar)
async function guardarProveedor(e) {
  e.preventDefault();

  const id = document.getElementById("proveedor-id").value;
  const data = {
    nombre: document.getElementById("nombre").value,
    plataforma: document.getElementById("plataforma").value,
    url_perfil: document.getElementById("url_perfil").value || null,
    calificacion: parseFloat(document.getElementById("calificacion").value),
    tiempo_entrega_promedio_horas: parseInt(
      document.getElementById("tiempo_entrega_promedio_horas").value
    ),
    estado: document.getElementById("estado").value,
    notas: document.getElementById("notas").value || null,
  };

  try {
    const url = id ? `${API_URL}/proveedores/${id}` : `${API_URL}/proveedores`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert(id ? "Proveedor actualizado" : "Proveedor creado");
      cerrarModal();
      cargarEstadisticas();
      cargarProveedores();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    alert("Error al guardar proveedor");
  }
}

// Ver detalles del proveedor con sus productos
async function verDetalles(id) {
  try {
    const res = await fetch(`${API_URL}/proveedores/${id}`);
    const data = await res.json();
    const p = data.proveedor;
    const productos = data.productos;

    let html = `
      <div style="margin-bottom: 20px">
        <h3 style="margin: 0 0 10px 0">${p.nombre}</h3>
        <p style="margin: 5px 0"><strong>Plataforma:</strong> <span class="badge badge-plataforma">${
          p.plataforma
        }</span></p>
        ${
          p.url_perfil
            ? `<p style="margin: 5px 0"><strong>Perfil:</strong> <a href="${p.url_perfil}" target="_blank" class="link-externo">🔗 Abrir perfil en ${p.plataforma}</a></p>`
            : ""
        }
        <p style="margin: 5px 0"><strong>Calificación:</strong> ⭐ ${parseFloat(
          p.calificacion
        ).toFixed(1)}/5.0</p>
        <p style="margin: 5px 0"><strong>Tiempo de entrega:</strong> ${formatearTiempoEntrega(
          p.tiempo_entrega_promedio_horas
        )}</p>
        <p style="margin: 5px 0"><strong>Compras realizadas:</strong> ${
          p.total_compras
        }</p>
        <p style="margin: 5px 0"><strong>Problemas:</strong> ${
          p.total_problemas
        } (${parseFloat(p.tasa_problemas || 0).toFixed(1)}%)</p>
        <p style="margin: 5px 0"><strong>Estado:</strong> <span class="badge badge-${
          p.estado
        }">${p.estado}</span></p>
        ${
          p.notas
            ? `<p style="margin: 10px 0"><strong>Notas:</strong><br>${p.notas}</p>`
            : ""
        }
      </div>

      <div class="productos-proveedor">
        <h3 style="margin: 20px 0 15px 0">Productos que vende (${
          productos.length
        })</h3>
        ${
          productos.length > 0
            ? productos
                .map(
                  (prod) => `
          <div class="producto-item">
            <div class="producto-info">
              <h4>${prod.producto_nombre} - ${prod.producto_duracion}</h4>
              <p>
                💰 Precio proveedor: <strong>$${parseFloat(
                  prod.precio_proveedor_usd
                ).toFixed(2)} USD</strong> 
                → Costo real: <strong>$${parseFloat(
                  prod.costo_real_usd
                ).toFixed(2)} USD</strong> 
                → <strong>$${parseInt(prod.costo_real_clp).toLocaleString(
                  "es-CL"
                )} CLP</strong>
              </p>
              <p>
                📈 Margen estimado: <strong style="color: #27ae60">$${parseInt(
                  prod.margen_estimado_clp
                ).toLocaleString("es-CL")} CLP</strong>
              </p>
              ${
                prod.url_compra
                  ? `<p><a href="${prod.url_compra}" target="_blank" class="link-externo">🛒 Comprar ahora</a></p>`
                  : ""
              }
              ${
                prod.notas
                  ? `<p style="font-size: 12px; color: #7f8c8d">${prod.notas}</p>`
                  : ""
              }
            </div>
            <button class="btn-accion btn-editar" onclick="eliminarProductoProveedor(${
              prod.id
            })" title="Eliminar">
              🗑️
            </button>
          </div>
        `
                )
                .join("")
            : '<p style="color: #95a5a6; text-align: center">No hay productos asignados</p>'
        }
        <button class="btn-add-producto" onclick="abrirModalAgregarProducto(${
          p.id
        })">
          ➕ Agregar Producto
        </button>
      </div>
    `;

    document.getElementById("detalles-content").innerHTML = html;
    document.getElementById("modal-detalles").classList.add("active");
  } catch (error) {
    console.error("Error al cargar detalles:", error);
    alert("Error al cargar detalles del proveedor");
  }
}

// Cerrar modales
function cerrarModal() {
  document.getElementById("modal-proveedor").classList.remove("active");
}

function cerrarModalDetalles() {
  document.getElementById("modal-detalles").classList.remove("active");
}

function cerrarModalProductos() {
  document.getElementById("modal-productos").classList.remove("active");
}

// Cargar catálogo de productos
async function cargarCatalogo() {
  try {
    const res = await fetch(`${API_URL}/catalogo`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    catalogo = await res.json();

    const select = document.getElementById("producto-id");
    if (catalogo.length === 0) {
      select.innerHTML =
        '<option value="">No hay productos en el catálogo</option>';
      console.warn(
        "⚠️ No hay productos en el catálogo. Ejecuta seed-catalogo-v2.js"
      );
      return;
    }

    select.innerHTML =
      '<option value="">Seleccione un producto...</option>' +
      catalogo
        .map(
          (p) => `<option value="${p.id}">${p.nombre} - ${p.duracion}</option>`
        )
        .join("");

    console.log(`✅ Catálogo cargado: ${catalogo.length} productos`);
  } catch (error) {
    console.error("❌ Error al cargar catálogo:", error);
    const select = document.getElementById("producto-id");
    select.innerHTML = '<option value="">Error al cargar productos</option>';
  }
}

// Abrir modal para agregar producto
async function abrirModalAgregarProducto(proveedorId) {
  // Asegurar que el catálogo esté cargado
  if (catalogo.length === 0) {
    await cargarCatalogo();
  }

  proveedorActual = proveedorId;
  document.getElementById("form-agregar-producto").reset();
  document.getElementById("producto-proveedor-id").value = proveedorId;
  cerrarModalDetalles(); // Cerrar modal de detalles si está abierto
  document.getElementById("modal-productos").classList.add("active");
}

// Agregar producto al proveedor
async function agregarProducto(e) {
  e.preventDefault();

  const proveedorId = document.getElementById("producto-proveedor-id").value;
  const data = {
    producto_id: parseInt(document.getElementById("producto-id").value),
    precio_proveedor_usd: parseFloat(
      document.getElementById("precio-proveedor-usd").value
    ),
    url_compra: document.getElementById("url-compra").value || null,
    notas: document.getElementById("notas-producto").value || null,
  };

  try {
    const res = await fetch(`${API_URL}/proveedores/${proveedorId}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Producto agregado al proveedor");
      cerrarModalProductos();
      cargarEstadisticas();
      cargarProveedores();
      // Si venimos del modal de detalles, reabrir
      if (proveedorActual) {
        verDetalles(proveedorActual);
      }
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    console.error("Error al agregar producto:", error);
    alert("Error al agregar producto");
  }
}

// Eliminar producto del proveedor
async function eliminarProductoProveedor(productoProveedorId) {
  if (!confirm("¿Eliminar este producto del proveedor?")) return;

  try {
    const res = await fetch(
      `${API_URL}/proveedores/productos/${productoProveedorId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("Producto eliminado");
      cargarEstadisticas();
      cargarProveedores();
      // Recargar detalles si está abierto
      if (proveedorActual) {
        verDetalles(proveedorActual);
      }
    } else {
      alert("Error al eliminar producto");
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert("Error al eliminar producto");
  }
}

// Confirmar eliminación de proveedor
function confirmarEliminarProveedor(id, nombre) {
  proveedorAEliminar = id;
  document.getElementById("nombre-proveedor-confirmar").textContent = nombre;
  document.getElementById("modal-confirmar-eliminar").classList.add("active");
}

// Cancelar eliminación
function cancelarEliminar() {
  proveedorAEliminar = null;
  document
    .getElementById("modal-confirmar-eliminar")
    .classList.remove("active");
}

// Eliminar proveedor confirmado
async function eliminarProveedorConfirmado() {
  if (!proveedorAEliminar) return;

  try {
    const res = await fetch(
      `${API_URL}/proveedores/${proveedorAEliminar}?permanente=true`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("✅ Proveedor eliminado correctamente de la base de datos");
      cancelarEliminar();
      cargarEstadisticas();
      cargarProveedores();
    } else {
      const error = await res.json();
      alert(`❌ Error al eliminar: ${error.error || "Error desconocido"}`);
    }
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    alert("Error al eliminar proveedor");
  }
}

