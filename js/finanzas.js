// frontend/js/finanzas.js
// Módulo de Finanzas y Control

const API_FIN = "http://127.0.0.1:3000/api/finanzas";
const API_VENTAS = "http://127.0.0.1:3000/api/ventas";
let movimientos = [];
let categorias = [];
let centros = [];
let chartFlujo = null;
let editId = null;

function fmtCLP(n) {
  const value = Number(n || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return "$" + formatted;
}

function fmtFecha(fechaISO) {
  if (!fechaISO) return "-";
  const [year, month, day] = fechaISO.split("T")[0].split("-");
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${parseInt(day)} ${meses[parseInt(month) - 1]} ${year}`;
}

function setRangeDefault() {
  const hoy = new Date();
  const desde = new Date();
  desde.setDate(hoy.getDate() - 29);
  document.getElementById("f-desde").value = desde.toISOString().split("T")[0];
  document.getElementById("f-hasta").value = hoy.toISOString().split("T")[0];
}

function queryParams(base = true) {
  const p = [];
  const tipo = document.getElementById("f-tipo").value;
  const estado = document.getElementById("f-estado").value;
  const cat = document.getElementById("f-categoria")?.value;
  const centro = document.getElementById("f-centro")?.value;
  const desde = document.getElementById("f-desde").value;
  const hasta = document.getElementById("f-hasta").value;
  const buscar = document.getElementById("f-buscar")?.value?.trim();

  if (tipo) p.push(`tipo=${tipo}`);
  if (estado) p.push(`estado=${estado}`);
  if (cat) p.push(`categoria_id=${cat}`);
  if (centro) p.push(`centro_id=${centro}`);
  if (desde) p.push(`desde=${desde}`);
  if (hasta) p.push(`hasta=${hasta}`);
  if (buscar) p.push(`buscar=${encodeURIComponent(buscar)}`);

  if (!base) return p.join("&");
  return p.length ? `?${p.join("&")}` : "";
}

async function cargarCategorias() {
  const resp = await fetch(`${API_FIN}/categorias`);
  const data = await resp.json();
  if (!data.ok) throw new Error(data.error || "Error categorias");
  categorias = data.categorias || [];
  const sel = document.getElementById("mov-categoria");
  const filt = document.getElementById("f-categoria");
  sel.innerHTML = '<option value="">(sin categoría)</option>';
  filt.innerHTML = '<option value="">Categoría</option>';
  categorias.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.tipo === "gasto" ? "🔴" : "🟢"} ${c.nombre}`;
    sel.appendChild(opt);
    const opt2 = opt.cloneNode(true);
    filt.appendChild(opt2);
  });
}

async function cargarCentros() {
  const resp = await fetch(`${API_FIN}/centros`);
  const data = await resp.json();
  if (!data.ok) throw new Error(data.error || "Error centros");
  centros = data.centros || [];
  const sel = document.getElementById("mov-centro");
  const filt = document.getElementById("f-centro");
  sel.innerHTML = '<option value="">(sin centro)</option>';
  filt.innerHTML = '<option value="">Centro de costo</option>';
  centros.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    sel.appendChild(opt);
    const opt2 = opt.cloneNode(true);
    filt.appendChild(opt2);
  });
}

function renderResumen() {
  let ingresos = 0;
  let gastos = 0;
  let pendientes = 0;
  movimientos.forEach((m) => {
    const monto = Number(m.monto || 0);
    if (m.tipo === "ingreso") ingresos += monto;
    else gastos += monto;
    if ((m.estado || "") === "pendiente") pendientes += monto;
  });

  // Calcular efectivo disponible (Ingresos - Gastos - Pendientes)
  const efectivo = ingresos - gastos;

  document.getElementById("card-ingresos").textContent = fmtCLP(ingresos);
  document.getElementById("card-gastos").textContent = fmtCLP(gastos);
  document.getElementById("card-neto").textContent = fmtCLP(ingresos - gastos);
  document.getElementById("card-pendientes").textContent = fmtCLP(pendientes);
  document.getElementById("card-efectivo").textContent = fmtCLP(efectivo);
}

function renderSerie() {
  const grupos = new Map();
  movimientos.forEach((m) => {
    // Extraer solo la fecha (YYYY-MM-DD) sin la hora
    const fecha = m.fecha ? m.fecha.split("T")[0] : "";
    if (!fecha) return;
    const acc = grupos.get(fecha) || { ingresos: 0, gastos: 0 };
    if (m.tipo === "ingreso") acc.ingresos += Number(m.monto || 0);
    else acc.gastos += Number(m.monto || 0);
    grupos.set(fecha, acc);
  });

  const dias = parseInt(document.getElementById("f-dias").value || "30", 10);
  const hoy = new Date();
  const fechas = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    fechas.push(d.toISOString().split("T")[0]);
  }

  const labels = [];
  const ingresos = [];
  const gastos = [];
  const neto = [];
  fechas.forEach((f) => {
    const acc = grupos.get(f) || { ingresos: 0, gastos: 0 };
    labels.push(fmtFecha(f));
    ingresos.push(acc.ingresos);
    gastos.push(acc.gastos);
    neto.push(acc.ingresos - acc.gastos);
  });

  if (chartFlujo) chartFlujo.destroy();
  const ctx = document.getElementById("chart-flujo").getContext("2d");
  chartFlujo = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ingresos",
          data: ingresos,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          tension: 0.2,
          fill: true,
        },
        {
          label: "Gastos",
          data: gastos,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.15)",
          tension: 0.2,
          fill: true,
        },
        {
          label: "Neto",
          data: neto,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.1)",
          tension: 0.2,
          fill: true,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
      },
    },
  });
}

function renderResumenCategorias() {
  if (!movimientos.length) {
    document.getElementById("resumen-categorias").innerHTML = "Sin datos";
    return;
  }
  const agg = new Map();
  movimientos.forEach((m) => {
    const key = m.categoria_nombre || "Sin categoría";
    const prev = agg.get(key) || { ingresos: 0, gastos: 0 };
    if (m.tipo === "ingreso") prev.ingresos += Number(m.monto || 0);
    else prev.gastos += Number(m.monto || 0);
    agg.set(key, prev);
  });
  const lines = Array.from(agg.entries()).map(([k, v]) => {
    const neto = v.ingresos - v.gastos;
    return `${k}: ${fmtCLP(v.ingresos)} / ${fmtCLP(v.gastos)} (neto ${fmtCLP(
      neto
    )})`;
  });
  document.getElementById("resumen-categorias").innerHTML = lines.join("<br>");
}

function renderTabla() {
  const tbody = document.getElementById("tabla-movimientos");
  const empty = document.getElementById("mov-empty");
  if (!movimientos.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  tbody.innerHTML = movimientos
    .map((m) => {
      const badgeTipo =
        m.tipo === "ingreso"
          ? '<span class="badge badge-ok">Ingreso</span>'
          : '<span class="badge badge-danger">Gasto</span>';
      const estado = m.estado || "-";
      const origen = m.origen || "manual";
      let acciones = "";
      if (origen === "manual") {
        acciones = `<button class="btn-link" onclick="editarMovimiento(${m.id})">Editar</button>
                    <button class="btn-link" onclick="eliminarMovimiento(${m.id})" style="color:#ef4444;">Borrar</button>`;
      } else if (origen === "venta" || origen === "slot") {
        acciones = `<button class="btn-link" onclick="eliminarVenta(${m.id}, '${origen}')" style="color:#ef4444;">Anular</button>`;
      } else {
        acciones = '<span style="color: var(--muted);">Auto</span>';
      }
      return `<tr>
        <td>${fmtFecha(m.fecha)}</td>
        <td>${badgeTipo}</td>
        <td>${fmtCLP(m.monto)}</td>
        <td>${m.categoria_nombre || "-"}</td>
        <td>${m.centro_nombre || "-"}</td>
        <td>${estado}</td>
        <td>${m.medio_pago || "-"}</td>
        <td>${m.referencia || "-"}</td>
        <td>${m.contraparte || "-"}</td>
        <td>${m.notas || ""}</td>
        <td>${origen}</td>
        <td>${acciones}</td>
      </tr>`;
    })
    .join("");
}

async function cargarMovimientos() {
  const qs = queryParams();
  const resp = await fetch(`${API_FIN}/movimientos${qs}`);
  const data = await resp.json();
  if (!data.ok) throw new Error(data.error || "Error movimientos");
  movimientos = data.movimientos || [];
  renderResumen();
  renderSerie();
  renderTabla();
  renderResumenCategorias();
}

function aplicarFiltros() {
  cargarMovimientos().catch((err) => {
    console.error(err);
    alert("Error cargando finanzas: " + err.message);
  });
}

function limpiarFiltros() {
  document.getElementById("f-tipo").value = "";
  document.getElementById("f-estado").value = "";
  document.getElementById("f-categoria").value = "";
  document.getElementById("f-centro").value = "";
  document.getElementById("f-buscar").value = "";
  setRangeDefault();
  aplicarFiltros();
}

function abrirModalMovimiento() {
  editId = null;
  document.getElementById("mov-title").textContent = "Nuevo movimiento";
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("mov-fecha").value = hoy;
  document.getElementById("mov-tipo").value = "ingreso";
  document.getElementById("mov-monto").value = "";
  document.getElementById("mov-estado").value = "pagado";
  document.getElementById("mov-categoria").value = "";
  document.getElementById("mov-centro").value = "";
  document.getElementById("mov-medio").value = "";
  document.getElementById("mov-ref").value = "";
  document.getElementById("mov-contra").value = "";
  document.getElementById("mov-notas").value = "";
  document.getElementById("modal-mov").classList.add("active");
}

function cerrarModalMov() {
  document.getElementById("modal-mov").classList.remove("active");
  editId = null;
}

function editarMovimiento(id) {
  const m = movimientos.find((x) => x.id === id);
  if (!m) return;
  editId = id;
  document.getElementById("mov-title").textContent = "Editar movimiento";
  document.getElementById("mov-fecha").value = m.fecha;
  document.getElementById("mov-tipo").value = m.tipo;
  document.getElementById("mov-monto").value = m.monto;
  document.getElementById("mov-estado").value = m.estado || "pagado";
  document.getElementById("mov-categoria").value = m.categoria_id || "";
  document.getElementById("mov-centro").value = m.centro_id || "";
  document.getElementById("mov-medio").value = m.medio_pago || "";
  document.getElementById("mov-ref").value = m.referencia || "";
  document.getElementById("mov-contra").value = m.contraparte || "";
  document.getElementById("mov-notas").value = m.notas || "";
  document.getElementById("modal-mov").classList.add("active");
}

async function guardarMovimiento(ev) {
  ev.preventDefault();
  const payload = {
    fecha: document.getElementById("mov-fecha").value,
    tipo: document.getElementById("mov-tipo").value,
    monto: Number(document.getElementById("mov-monto").value || 0),
    estado: document.getElementById("mov-estado").value,
    categoria_id: document.getElementById("mov-categoria").value || null,
    centro_id: document.getElementById("mov-centro").value || null,
    medio_pago: document.getElementById("mov-medio").value,
    referencia: document.getElementById("mov-ref").value,
    contraparte: document.getElementById("mov-contra").value,
    notas: document.getElementById("mov-notas").value,
  };

  if (payload.monto <= 0) {
    alert("El monto debe ser mayor a 0");
    return;
  }

  const url = editId
    ? `${API_FIN}/movimientos/${editId}`
    : `${API_FIN}/movimientos`;
  const method = editId ? "PUT" : "POST";

  const resp = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await resp.json();
  if (!data.ok) {
    alert("Error: " + (data.error || "No se pudo guardar"));
    return;
  }
  cerrarModalMov();
  await aplicarFiltros();
}

async function eliminarMovimiento(id) {
  if (!confirm("¿Eliminar movimiento?")) return;
  const resp = await fetch(`${API_FIN}/movimientos/${id}`, {
    method: "DELETE",
  });
  const data = await resp.json();
  if (!data.ok) {
    alert("Error: " + (data.error || "No se pudo eliminar"));
    return;
  }
  await aplicarFiltros();
}

async function eliminarVenta(id, origen) {
  if (!confirm(`¿Anular esta ${origen === "slot" ? "suscripción" : "venta"}?`))
    return;
  // Los IDs de ventas en movimientos son negativos, extraer el ID real
  const ventaId = Math.abs(parseInt(id));
  const resp = await fetch(`${API_VENTAS}/${ventaId}`, {
    method: "DELETE",
  });
  const data = await resp.json();
  if (!data.ok) {
    alert("Error: " + (data.error || "No se pudo anular"));
    return;
  }
  await aplicarFiltros();
}

async function crearCategoriaRapida() {
  const nombre = prompt("Nombre de categoría:");
  if (!nombre) return;
  const tipo = prompt("Tipo (ingreso/gasto):", "gasto");
  if (!tipo || !["ingreso", "gasto"].includes(tipo)) {
    alert("Tipo inválido");
    return;
  }
  const resp = await fetch(`${API_FIN}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, tipo }),
  });
  const data = await resp.json();
  if (!data.ok) {
    alert("Error: " + (data.error || "No se pudo crear"));
    return;
  }
  await cargarCategorias();
}

async function crearCentroRapido() {
  const nombre = prompt("Nombre del centro de costo:");
  if (!nombre) return;
  const resp = await fetch(`${API_FIN}/centros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  const data = await resp.json();
  if (!data.ok) {
    alert("Error: " + (data.error || "No se pudo crear"));
    return;
  }
  await cargarCentros();
}

document.addEventListener("DOMContentLoaded", () => {
  setRangeDefault();
  Promise.all([cargarCategorias(), cargarCentros()])
    .then(() => aplicarFiltros())
    .catch((err) => {
      console.error(err);
      alert("Error inicializando finanzas: " + err.message);
    });
});

