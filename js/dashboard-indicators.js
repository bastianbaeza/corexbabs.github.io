(function () {
  // Base del backend: usar override/manual -> resuelto por detector -> defaults 3000/3001
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
      .map((b) => b.replace(/\/$/, ""));
    return [...new Set(candidates)][0];
  }

  const BASE = getBackendBase();
  if (!BASE) {
    return;
  }

  const el = document.getElementById("dashboard-alerts");
  if (!el) {
    return;
  }
  const elSummary = document.getElementById("dashboard-summary");

  const styles = document.createElement("style");
  styles.textContent = `
    .alert-card{display:flex;align-items:center;gap:10px;background:var(--card, #0b1220);border:1px solid #1f2937;border-radius:8px;padding:12px 14px;}
    .alert-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 2px rgba(0,0,0,.2)}
    .alert-dot.warn{background:#f59e0b}
    .alert-dot.ok{background:#22c55e}
    .alert-body{flex:1}
    .alert-title{margin:0;color:#e5e7eb;font-weight:700;font-size:14px}
    .alert-sub{margin:0;color:#94a3b8;font-size:12px}
    .alert-link{white-space:nowrap;background:var(--accent,#22c55e);color:#fff;border:none;border-radius:6px;padding:8px 12px;text-decoration:none;font-weight:600}

    /* KPIs estilo tarjetas más visuales */
    .summary-card{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12)), var(--card,#0b1220);border:1px solid #1f2937;border-radius:14px;padding:14px 16px;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,0.25)}
    .summary-card:hover{border-color:var(--accent,#22c55e); transform: translateY(-2px); transition: all .2s ease}
    .summary-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff}
    .summary-body{display:flex;flex-direction:column}
    .summary-label{color:#cbd5e1;font-size:12px;letter-spacing:.3px;text-transform:uppercase}
    .summary-value{color:#e5e7eb;font-size:24px;font-weight:800;line-height:1;margin-top:4px}
    .tone-ok{background:linear-gradient(135deg,#16a34a,#22c55e)}
    .tone-warn{background:linear-gradient(135deg,#d97706,#f59e0b)}
    .tone-danger{background:linear-gradient(135deg,#b91c1c,#ef4444)}
    .tone-neutral{background:linear-gradient(135deg,#334155,#64748b)}

    /* Últimas ventas */
    .latest-sales-card{grid-column:1/-1;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.12)),var(--card,#0b1220);border:1px solid #1f2937;border-radius:14px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,0.25)}
    .latest-sales-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .latest-sales-title{margin:0;color:#e5e7eb;font-weight:800;font-size:16px}
    .latest-sales-count{color:#94a3b8;font-size:12px}
    .latest-sales-list{display:grid;gap:10px}
    .latest-sales-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid #1f2937}
    .latest-sales-main{display:flex;flex-direction:column;gap:4px}
    .latest-sales-product{color:#e2e8f0;font-weight:700;font-size:14px}
    .latest-sales-meta{color:#94a3b8;font-size:12px}
    .latest-sales-amount{color:#f8fafc;font-weight:800;font-size:15px;white-space:nowrap}
    .latest-sales-status{padding:4px 8px;border-radius:999px;font-size:11px;text-transform:capitalize;border:1px solid #1f2937;color:#cbd5e1;background:rgba(255,255,255,0.03)}
    .status-pagado{border-color:#16a34a;color:#bbf7d0;background:rgba(22,163,74,0.1)}
    .status-pendiente{border-color:#d97706;color:#fed7aa;background:rgba(217,119,6,0.1)}
    .status-cancelado,.status-anulada{border-color:#ef4444;color:#fecdd3;background:rgba(239,68,68,0.08)}
    .latest-sales-empty{color:#94a3b8;font-size:13px;padding:8px 2px}
  `;
  document.head.appendChild(styles);

  function card({ level = "warn", title, sub, href }) {
    const dotClass = level === "danger" ? "" : level === "ok" ? "ok" : "warn";
    const dotStyle = level === "danger" ? "" : "";
    const wrap = document.createElement("div");
    wrap.className = "alert-card";
    const dot = document.createElement("span");
    dot.className = "alert-dot " + (level === "danger" ? "" : dotClass);
    if (level === "danger") dot.style.background = "#ef4444";
    const body = document.createElement("div");
    body.className = "alert-body";
    const h = document.createElement("p");
    h.className = "alert-title";
    h.textContent = title;
    const p = document.createElement("p");
    p.className = "alert-sub";
    p.textContent = sub || "";
    body.appendChild(h);
    body.appendChild(p);
    const a = document.createElement("a");
    a.className = "alert-link";
    a.href = href;
    a.textContent = "Revisar";
    wrap.appendChild(dot);
    wrap.appendChild(body);
    wrap.appendChild(a);
    return wrap;
  }

  async function fetchJson(url) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return null;
      return await r.json();
    } catch (_) {
      return null;
    }
  }

  async function load() {
    const [
      ren,
      sop,
      slotsLiberar,
      rec,
      cli,
      ultimasVentas,
      solicitudesStats,
    ] = await Promise.all([
      fetchJson(BASE + "/api/renovaciones/stats/resumen"),
      fetchJson(BASE + "/api/soporte/dashboard"),
      fetchJson(BASE + "/api/cuentas/slots-liberar"),
      fetchJson(BASE + "/api/recordatorios/stats/resumen"),
      fetchJson(BASE + "/api/clientes/stats/resumen"),
      fetchJson(BASE + "/api/ventas/ultimas"),
      fetchJson(BASE + "/api/solicitudes/stats"),
    ]);

    const items = [];

    // Renovaciones
    if (ren && ren.ok !== false) {
      const r = ren.resumen || ren;
      const venceHoy = parseInt(r.vence_hoy || 0, 10);
      const proximas = parseInt(r.proximas_vencer || 0, 10);
      const vencidas = parseInt(r.vencidas || 0, 10);
      if (venceHoy > 0) {
        items.push(
          card({
            level: "danger",
            title: `${venceHoy} vencen hoy`,
            sub: "Renovaciones urgentes",
            href: "renovaciones.html",
          })
        );
      }
      if (proximas > 0) {
        items.push(
          card({
            level: "warn",
            title: `${proximas} próximas (7d)`,
            sub: "Renovaciones próximas a vencer",
            href: "renovaciones.html",
          })
        );
      }
      if (vencidas > 0) {
        items.push(
          card({
            level: "danger",
            title: `${vencidas} vencidas`,
            sub: "Clientes con servicio vencido",
            href: "renovaciones.html",
          })
        );
      }
    }

    // Soporte
    if (sop && sop.ok !== false) {
      const s = sop.stats || sop;
      const abiertos = parseInt(s.tickets_abiertos || 0, 10);
      const alta = parseInt(s.tickets_alta_prioridad || 0, 10);
      const sla = parseInt(s.tickets_sla_hoy || 0, 10);
      if (alta > 0) {
        items.push(
          card({
            level: "danger",
            title: `${alta} tickets alta prioridad`,
            sub: "Atender cuanto antes",
            href: "soporte.html",
          })
        );
      }
      if (sla > 0) {
        items.push(
          card({
            level: "warn",
            title: `${sla} SLA vencen hoy`,
            sub: "Evita incumplimientos",
            href: "soporte.html",
          })
        );
      }
      if (abiertos > 0 && alta === 0) {
        items.push(
          card({
            level: "warn",
            title: `${abiertos} tickets abiertos`,
            sub: "Pendientes por gestionar",
            href: "soporte.html",
          })
        );
      }
    }

    // Cuentas / Slots a liberar
    if (Array.isArray(slotsLiberar)) {
      const count = slotsLiberar.length;
      if (count > 0) {
        items.push(
          card({
            level: "danger",
            title: `${count} slots a liberar`,
            sub: "Clientes que no renovaron",
            href: "cuentas.html",
          })
        );
      }
    }

    // Recordatorios
    if (rec && rec.ok !== false) {
      const a = parseInt(
        (rec.stats && rec.stats.activos) || rec.activos || 0,
        10
      );
      if (a > 0) {
        items.push(
          card({
            level: "ok",
            title: `${a} recordatorios activos`,
            sub: "Envíos automáticos configurados",
            href: "recordatorios.html",
          })
        );
      }
    }

    // Render
    el.innerHTML = "";
    if (items.length === 0) {
      // mostrar algo amable pero silencioso
      const w = document.createElement("div");
      w.style.gridColumn = "1 / -1";
      w.style.color = "var(--muted,#94a3b8)";
      w.style.fontSize = "12px";
      w.textContent = "Todo en orden. No hay pendientes urgentes.";
      el.appendChild(w);
    } else {
      items.forEach((i) => el.appendChild(i));
    }

    // Resumen rápido
    if (elSummary) {
      elSummary.innerHTML = "";

      function tile({ label, value, href, tone = "neutral", icon = "•" }) {
        const a = document.createElement("a");
        a.href = href || "#";
        a.className = "summary-card";
        const ic = document.createElement("div");
        ic.className = "summary-icon tone-" + tone;
        ic.textContent = icon;
        const body = document.createElement("div");
        body.className = "summary-body";
        const lbl = document.createElement("span");
        lbl.className = "summary-label";
        lbl.textContent = label;
        const val = document.createElement("span");
        val.className = "summary-value";
        val.textContent = String(value ?? 0);
        body.appendChild(lbl);
        body.appendChild(val);
        a.appendChild(ic);
        a.appendChild(body);
        return a;
      }

      const r = (ren && (ren.resumen || ren)) || {};
      const s = (sop && (sop.stats || sop)) || {};
      const venceHoy = parseInt(r.vence_hoy || 0, 10);
      const proximas = parseInt(r.proximas_vencer || 0, 10);
      const vencidas = parseInt(r.vencidas || 0, 10);
      const abiertos = parseInt(s.tickets_abiertos || 0, 10);
      const alta = parseInt(s.tickets_alta_prioridad || 0, 10);
      const sla = parseInt(s.tickets_sla_hoy || 0, 10);
      const slots = Array.isArray(slotsLiberar) ? slotsLiberar.length : 0;
      const recActivos = parseInt(
        (rec && ((rec.stats && rec.stats.activos) || rec.activos)) || 0,
        10
      );
      const sol = solicitudesStats && (solicitudesStats.stats || solicitudesStats);
      const solicitudesPendientes = parseInt(
        (sol && sol.pendientes) || 0,
        10
      );

      // Renovaciones (solo "Vencen hoy")
      elSummary.appendChild(
        tile({
          label: "Renovaciones: Vencen hoy",
          value: venceHoy,
          href: "renovaciones.html",
          tone: venceHoy > 0 ? "danger" : "neutral",
          icon: "🔄",
        })
      );

      // Soporte (solo "Alta prioridad")
      elSummary.appendChild(
        tile({
          label: "Soporte: Alta prioridad",
          value: alta,
          href: "soporte.html",
          tone: alta > 0 ? "danger" : "neutral",
          icon: "🚨",
        })
      );

      // Cuentas
      elSummary.appendChild(
        tile({
          label: "Cuentas: Slots a liberar",
          value: slots,
          href: "cuentas.html",
          tone: slots > 0 ? "danger" : "neutral",
          icon: "🔐",
        })
      );

      // Recordatorios
      elSummary.appendChild(
        tile({
          label: "Recordatorios: Activos",
          value: recActivos,
          href: "recordatorios.html",
          tone: recActivos > 0 ? "ok" : "neutral",
          icon: "🔔",
        })
      );
      // Solicitudes
      elSummary.appendChild(
        tile({
          label: "Solicitudes: Pendientes",
          value: solicitudesPendientes,
          href: "solicitudes.html",
          tone: solicitudesPendientes > 0 ? "warn" : "neutral",
          icon: "\u{1F4DD}",
        })
      );

      // Total Clientes
      const totalClientes = cli && cli.ok ? parseInt(cli.total || 0, 10) : 0;
      elSummary.appendChild(
        tile({
          label: "Total: Clientes",
          value: totalClientes,
          href: "clientes_v2.html",
          tone: "neutral",
          icon: "👥",
        })
      );
    }

    // Últimas ventas
    const latestContainer = document.getElementById("dashboard-latest-sales");
    const formatCLP = (val) => {
      const num = Number(val || 0);
      try {
        return num.toLocaleString("es-CL", {
          style: "currency",
          currency: "CLP",
          maximumFractionDigits: 0,
        });
      } catch (e) {
        return `$${num.toFixed(0)}`;
      }
    };
    const formatFecha = (iso) => {
      if (!iso) return "Fecha sin registrar";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    if (latestContainer) {
      latestContainer.innerHTML = "";
      const dataRaw =
        (ultimasVentas && Array.isArray(ultimasVentas.ventas)
          ? ultimasVentas.ventas
          : Array.isArray(ultimasVentas)
          ? ultimasVentas
          : []) || [];
      const data = dataRaw.slice(0, 5);

      if (data.length === 0) {
        const empty = document.createElement("div");
        empty.className = "latest-sales-empty";
        empty.textContent = "Sin ventas recientes.";
        latestContainer.appendChild(empty);
        return;
      }

      const cardWrap = document.createElement("div");
      cardWrap.className = "latest-sales-card";

      const header = document.createElement("div");
      header.className = "latest-sales-header";
      const title = document.createElement("h3");
      title.className = "latest-sales-title";
      title.textContent = "\u{1F9FE} Últimas ventas";
      const count = document.createElement("span");
      count.className = "latest-sales-count";
      count.textContent = `${data.length} recientes`;
      header.appendChild(title);
      header.appendChild(count);

      const list = document.createElement("div");
      list.className = "latest-sales-list";

      data.forEach((v) => {
        const item = document.createElement("div");
        item.className = "latest-sales-item";

        const main = document.createElement("div");
        main.className = "latest-sales-main";
        const prod = document.createElement("div");
        prod.className = "latest-sales-product";
        prod.textContent = v.producto_nombre || "Producto";
        const meta = document.createElement("div");
        meta.className = "latest-sales-meta";
        const cliente = v.cliente_nombre || "Cliente no registrado";
        meta.textContent = `${cliente} · ${formatFecha(v.fecha_compra)}`;
        main.appendChild(prod);
        main.appendChild(meta);

        const right = document.createElement("div");
        right.style.display = "flex";
        right.style.gap = "8px";
        right.style.alignItems = "center";

        const status = document.createElement("span");
        const estado = (v.estado || "").toLowerCase();
        status.className =
          "latest-sales-status" + (estado ? ` status-${estado}` : "");
        status.textContent = estado || "--";

        const amount = document.createElement("div");
        amount.className = "latest-sales-amount";
        amount.textContent = formatCLP(v.precio_venta_clp);

        right.appendChild(amount);
        right.appendChild(status);

        item.appendChild(main);
        item.appendChild(right);
        list.appendChild(item);
      });

      cardWrap.appendChild(header);
      cardWrap.appendChild(list);
      latestContainer.appendChild(cardWrap);
    }
  }

  // cargar al iniciar y refrescar cada 60s
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
  setInterval(load, 60000);
})();

