// frontend/js/estadisticas.js
// Módulo de visualización de estadísticas con Chart.js

const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:3000";
const BACKEND_ORIGIN =
  window.location.port === "3000" ? window.location.origin : DEFAULT_BACKEND_ORIGIN;
const API_STATS = `${BACKEND_ORIGIN}/api/stats/ventas`;
const API_STATS_COMPRAS = `${BACKEND_ORIGIN}/api/stats/compras`;
const charts = {
  line: null,
  comprasLine: null,
  topProductos: null,
  topClientes: null,
  topProveedoresMonto: null,
  topProveedoresCantidad: null,
  pie: null,
};

function fmtCLP(n) {
  const value = Number(n || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return "$" + formatted;
}

async function fetchJson(url) {
  const resp = await fetch(url);
  const contentType = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    let detail = "";
    if (contentType.includes("application/json")) {
      try {
        const data = await resp.json();
        detail = data && data.error ? data.error : JSON.stringify(data);
      } catch (_) {}
    } else {
      try {
        detail = await resp.text();
      } catch (_) {}
    }
    const msg = detail ? String(detail).slice(0, 200) : `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  if (!contentType.includes("application/json")) {
    const text = await resp.text();
    throw new Error(`Respuesta no JSON: ${text.slice(0, 80)}`);
  }
  return resp.json();
}

function destruir(chartKey) {
  if (charts[chartKey]) {
    charts[chartKey].destroy();
    charts[chartKey] = null;
  }
}

function obtenerQuery() {
  const desde = document.getElementById("f-desde").value;
  const hasta = document.getElementById("f-hasta").value;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  return params.length ? `?${params.join("&")}` : "";
}

function rangoDias() {
  const val = parseInt(document.getElementById("f-dias").value || "30", 10);
  return Math.min(Math.max(val, 1), 365);
}

function completarSerie(serie, dias) {
  const map = new Map();
  serie.forEach((p) => map.set(p.fecha, p));
  const res = [];
  const hoy = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    res.push(map.get(iso) || { fecha: iso, ventas: 0, ingresos: 0, margen: 0 });
  }
  return res;
}

function completarSerieCompras(serie, dias) {
  const map = new Map();
  serie.forEach((p) => map.set(p.fecha, p));
  const res = [];
  const hoy = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    res.push(map.get(iso) || { fecha: iso, compras: 0, gasto: 0 });
  }
  return res;
}

async function cargarResumen() {
  const qs = obtenerQuery();
  const data = await fetchJson(`${API_STATS}/resumen${qs}`);
  if (!data.ok) throw new Error(data.error || "Error en resumen");
  const r = data.resumen;
  document.getElementById("card-ventas").textContent = r.total_ventas;
  document.getElementById("card-ingresos").textContent = fmtCLP(
    r.ingresos_totales
  );
  document.getElementById("card-margen").textContent = fmtCLP(r.margen_total);
  document.getElementById("card-ticket").textContent = fmtCLP(
    r.ticket_promedio
  );
  document.getElementById("card-clientes").textContent = r.clientes_unicos;
}

async function cargarResumenCompras() {
  const qs = obtenerQuery();
  const data = await fetchJson(`${API_STATS_COMPRAS}/resumen${qs}`);
  if (!data.ok) throw new Error(data.error || "Error en resumen compras");
  const r = data.resumen;
  document.getElementById("card-compras").textContent = r.total_compras;
  document.getElementById("card-gasto").textContent = fmtCLP(r.gasto_total);
  document.getElementById("card-compra-promedio").textContent = fmtCLP(
    r.compra_promedio
  );
  document.getElementById("card-proveedores").textContent =
    r.proveedores_unicos;
}

async function cargarSerie() {
  const qsBase = obtenerQuery();
  const dias = rangoDias();
  const separador = qsBase ? "&" : "?";
  const data = await fetchJson(
    `${API_STATS}/serie${qsBase}${separador}dias=${dias}`
  );
  if (!data.ok) throw new Error(data.error || "Error en serie");
  const serie = completarSerie(data.serie || [], dias);

  const labels = serie.map((p) => p.fecha);
  const ingresos = serie.map((p) => p.ingresos);
  const margen = serie.map((p) => p.margen);

  destruir("line");
  const ctx = document.getElementById("chart-line").getContext("2d");
  charts.line = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ingresos (CLP)",
          data: ingresos,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          tension: 0.25,
          fill: true,
        },
        {
          label: "Margen (CLP)",
          data: margen,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          tension: 0.25,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
      },
    },
  });
}

async function cargarSerieCompras() {
  const qsBase = obtenerQuery();
  const dias = rangoDias();
  const separador = qsBase ? "&" : "?";
  const data = await fetchJson(
    `${API_STATS_COMPRAS}/serie${qsBase}${separador}dias=${dias}`
  );
  if (!data.ok) throw new Error(data.error || "Error en serie compras");
  const serie = completarSerieCompras(data.serie || [], dias);

  const labels = serie.map((p) => p.fecha);
  const gastos = serie.map((p) => p.gasto);
  const compras = serie.map((p) => p.compras);

  destruir("comprasLine");
  const ctx = document.getElementById("chart-compras-line").getContext("2d");
  charts.comprasLine = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Gasto (CLP)",
          data: gastos,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          tension: 0.25,
          fill: true,
        },
        {
          label: "Compras",
          data: compras,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          tension: 0.25,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
      },
    },
  });
}

function renderLista(
  elementId,
  items,
  labelKey,
  valueKey,
  valueLabel,
  amountKey
) {
  const cont = document.getElementById(elementId);
  if (!items || items.length === 0) {
    cont.innerHTML = "<em>No hay datos en el rango.</em>";
    return;
  }
  const label = valueLabel || "ventas";
  const amountField = amountKey || "ingresos";
  cont.innerHTML = items
    .map(
      (i, idx) =>
        `#${idx + 1} ${i[labelKey]} - ${i[valueKey]} ${label} - ${fmtCLP(
          i[amountField] || 0
        )}`
    )
    .join("<br>");
}

async function cargarTop() {
  const qs = obtenerQuery();
  const data = await fetchJson(`${API_STATS}/top${qs}`);
  if (!data.ok) throw new Error(data.error || "Error en top");

  const topProd = data.topProductos || [];
  const topCli = data.topClientes || [];
  const canales = data.canales || [];
  const medios = data.medios_pago || [];

  renderLista("lista-top-productos", topProd, "nombre", "ventas", "ventas");
  renderLista("lista-top-clientes", topCli, "nombre", "compras", "compras");

  // Top Productos chart
  destruir("topProductos");
  charts.topProductos = new Chart(
    document.getElementById("chart-top-productos").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: topProd.map((p) => p.nombre),
        datasets: [
          {
            label: "Ventas",
            data: topProd.map((p) => p.ventas),
            backgroundColor: "#22c55e",
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        },
      },
    }
  );

  // Top Clientes chart
  destruir("topClientes");
  charts.topClientes = new Chart(
    document.getElementById("chart-top-clientes").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: topCli.map((c) => c.nombre),
        datasets: [
          {
            label: "Compras",
            data: topCli.map((c) => c.compras),
            backgroundColor: "#3b82f6",
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        },
      },
    }
  );

  // Pie (canales + medios)
  const labels = [
    ...canales.map((c) => `${c.canal || "Sin canal"} (canal)`),
    ...medios.map((m) => `${m.medio || "Sin medio"} (pago)`),
  ];
  const dataPie = [
    ...canales.map((c) => Number(c.total || 0)),
    ...medios.map((m) => Number(m.total || 0)),
  ];
  const palette = [
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
  ];

  destruir("pie");
  charts.pie = new Chart(
    document.getElementById("chart-pie").getContext("2d"),
    {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataPie,
            backgroundColor: labels.map(
              (_, idx) => palette[idx % palette.length]
            ),
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom", labels: { color: "#e5e7eb" } },
        },
      },
    }
  );
}


async function cargarTopCompras() {
  const qs = obtenerQuery();
  const data = await fetchJson(`${API_STATS_COMPRAS}/top${qs}`);
  if (!data.ok) throw new Error(data.error || "Error en top compras");

  const topMonto = data.topProveedoresMonto || [];
  const topCantidad = data.topProveedoresCantidad || [];

  renderLista(
    "lista-top-proveedores-monto",
    topMonto,
    "proveedor",
    "compras",
    "compras",
    "monto"
  );
  renderLista(
    "lista-top-proveedores-cantidad",
    topCantidad,
    "proveedor",
    "compras",
    "compras",
    "monto"
  );

  destruir("topProveedoresMonto");
  charts.topProveedoresMonto = new Chart(
    document.getElementById("chart-top-proveedores-monto").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: topMonto.map((p) => p.proveedor),
        datasets: [
          {
            label: "Monto (CLP)",
            data: topMonto.map((p) => p.monto),
            backgroundColor: "#f59e0b",
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        },
      },
    }
  );

  destruir("topProveedoresCantidad");
  charts.topProveedoresCantidad = new Chart(
    document.getElementById("chart-top-proveedores-cantidad").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: topCantidad.map((p) => p.proveedor),
        datasets: [
          {
            label: "Compras",
            data: topCantidad.map((p) => p.compras),
            backgroundColor: "#ef4444",
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1f2937" } },
        },
      },
    }
  );
}

async function cargarTodo() {
  try {
    await Promise.all([
      cargarResumen(),
      cargarResumenCompras(),
      cargarSerie(),
      cargarSerieCompras(),
      cargarTop(),
      cargarTopCompras(),
    ]);
  } catch (err) {
    console.error(err);
    alert("Error cargando estadísticas: " + err.message);
  }
}

function aplicarFiltros() {
  cargarTodo();
}

document.addEventListener("DOMContentLoaded", () => {
  // Prefijar rango de 30 días
  const hoy = new Date();
  const desde = new Date();
  desde.setDate(hoy.getDate() - 29);
  document.getElementById("f-desde").value = desde.toISOString().split("T")[0];
  document.getElementById("f-hasta").value = hoy.toISOString().split("T")[0];
  cargarTodo();
});

