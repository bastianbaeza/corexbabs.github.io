(function () {
  function normalizeBase(input) {
    if (!input) return null;
    if (typeof input === "object" && input.base) input = input.base;
    const str = String(input || "").trim();
    if (!str || str === "[object Object]") return null;
    return str.replace(/\/$/, "").replace(/\/api$/, "");
  }

  // Resolver base del backend con estrategia: override (localStorage) -> runtime -> same-origin
  const rawBase = localStorage.getItem("backendBase");
  const rawResolved = localStorage.getItem("backendBaseResolved");
  if (rawResolved === "[object Object]") localStorage.removeItem("backendBaseResolved");
  if (rawBase === "[object Object]") localStorage.removeItem("backendBase");
  const lsBase = normalizeBase(rawBase);
  const lsResolved = normalizeBase(rawResolved);
  const runtimeResolved = normalizeBase(
    typeof window !== "undefined" && window.__backendBaseResolved
      ? window.__backendBaseResolved
      : null
  );
  const origin = (window.location && window.location.origin) || "";
  const isLocalOrigin =
    origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://localhost:");
  const candidatesOrdered = [];
  if (lsBase) candidatesOrdered.push(lsBase);
  if (runtimeResolved) candidatesOrdered.push(runtimeResolved);
  if (lsResolved) candidatesOrdered.push(lsResolved);
  if (isLocalOrigin) candidatesOrdered.push(origin);

  // Si no hay backend configurado explícitamente, no golpeamos puertos locales para evitar errores en consola.
  if (!candidatesOrdered.length) {
    console.warn("Backend status deshabilitado: sin backend configurado.");
    return;
  }

  const candidates = [...new Set(candidatesOrdered)]
    .filter(Boolean)
    .map((b) => normalizeBase(b))
    .filter(Boolean);

  let CURRENT_BASE = null;
  function setResolvedBase(b) {
    const normalized = normalizeBase(b);
    if (!normalized) return;
    CURRENT_BASE = normalized;
    try {
      localStorage.setItem("backendBaseResolved", normalized);
      window.__backendBaseResolved = normalized; // útil para otros scripts
    } catch (_) {}
  }

  async function pingUrl(base, controller) {
    // Usar /api/health (tiene CORS habilitado en el backend). /test no env?a headers CORS.
    const url = base.replace(/\/$/, "") + "/api/health";
    try {
      const res = await fetch(url, {
        signal: controller?.signal,
        cache: "no-store",
      });
      const ct = res.headers.get("content-type") || "";
      let healthy = res.ok;
      if (ct.includes("application/json")) {
        const j = await res.json().catch(() => ({}));
        if (typeof j?.ok === "boolean") {
          healthy = healthy || j.ok;
        } else if (j && j.status === "ok") {
          healthy = true;
        }
      }
      return { reachable: true, healthy };
    } catch (_) {
      return { reachable: false, healthy: false };
    }
  }

  async function detectBase(timeoutMs = 2500) {
    const acList = [];
    const promises = candidates.map((base) => {
      const ac = "AbortController" in window ? new AbortController() : null;
      if (ac) acList.push(ac);
      const to = setTimeout(() => ac && ac.abort(), timeoutMs);
      return pingUrl(base, ac)
        .then((result) => {
          clearTimeout(to);
          return { base, ...result };
        })
        .catch(() => ({ base, reachable: false, healthy: false }));
    });
    const results = await Promise.all(promises);
    // Elegir el primer candidato en orden original que est? alcanzable
    for (const c of candidates) {
      const r = results.find((x) => x.base.replace(/\/$/, "") === c);
      if (r && r.reachable) return { base: c, healthy: r.healthy };
    }
    return null;
  }

  function createStyles() {
    const css = `
      .service-status-container{position:fixed;top:12px;right:12px;z-index:2000;display:flex;flex-direction:column;gap:6px;}
      .service-status-indicator{display:flex;align-items:center;gap:8px;background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:999px;padding:6px 10px;backdrop-filter: blur(2px);}
      .service-status-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 2px rgba(0,0,0,.2);}
      .service-status-dot.online{background:#22c55e;}
      .service-status-dot.warn{background:#f59e0b;}
      .service-status-label{color:#cbd5e1;font-size:12px;user-select:none}
      @media (max-width:600px){.service-status-label{display:none}}
    `;
    const style = document.createElement("style");
    style.setAttribute("data-backend-status", "");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createContainer() {
    const wrap = document.createElement("div");
    wrap.className = "service-status-container";
    document.body.appendChild(wrap);
    return wrap;
  }

  function createIndicator(container, labelText, titleText) {
    const wrap = document.createElement("div");
    wrap.className = "service-status-indicator";
    wrap.title = titleText;

    const dot = document.createElement("span");
    dot.className = "service-status-dot";
    dot.setAttribute("aria-label", labelText + " desconectado");
    dot.setAttribute("role", "status");

    const label = document.createElement("span");
    label.className = "service-status-label";
    label.textContent = labelText;

    wrap.appendChild(dot);
    wrap.appendChild(label);
    container.appendChild(wrap);
    return { wrap, dot, label };
  }

  async function pingCurrent(controller) {
    if (!CURRENT_BASE) return { reachable: false, healthy: false };
    return pingUrl(CURRENT_BASE, controller);
  }

  function start() {
    if (document.querySelector("style[data-backend-status]") == null) {
      createStyles();
    }
    const container = createContainer();
    const backendUi = createIndicator(
      container,
      "Backend",
      "Estado del backend"
    );
    const whatsappUi = createIndicator(
      container,
      "WhatsApp",
      "Estado de WhatsApp"
    );

    async function update() {
      // timeout after 2500ms
      const ac = "AbortController" in window ? new AbortController() : null;
      const to = setTimeout(() => ac && ac.abort(), 2500);
      let reachable = false;
      let healthy = false;
      if (!CURRENT_BASE) {
        const detected = await detectBase(2000);
        if (detected) {
          setResolvedBase(detected.base || detected);
          reachable = true;
          healthy = !!detected.healthy;
        }
      }
      if (CURRENT_BASE) {
        const status = await pingCurrent(ac);
        reachable = status.reachable;
        healthy = status.healthy;
        // Si falla, intentar redetectar r?pidamente
        if (!reachable) {
          const detected = await detectBase(1500);
          if (detected) {
            setResolvedBase(detected.base || detected);
            reachable = true; // Considerar OK tras detectar
            healthy = !!detected.healthy;
          }
        }
      }
      clearTimeout(to);
      if (reachable) {
        backendUi.dot.classList.add("online");
        backendUi.dot.classList.toggle("warn", !healthy);
        backendUi.dot.setAttribute("aria-label", "Backend conectado");
        backendUi.wrap.title = healthy
          ? "Backend: conectado (" + CURRENT_BASE + ")"
          : "Backend: conectado (DB/servicios pendientes) (" + CURRENT_BASE + ")";
      } else {
        backendUi.dot.classList.remove("online");
        backendUi.dot.classList.remove("warn");
        backendUi.dot.setAttribute("aria-label", "Backend desconectado");
        backendUi.wrap.title =
          "Backend: desconectado" +
          (CURRENT_BASE ? " (" + CURRENT_BASE + ")" : "");
      }

      let whatsappOk = false;
      if (reachable && CURRENT_BASE) {
        try {
          const res = await fetch(CURRENT_BASE + "/api/whatsapp/status", {
            signal: ac?.signal,
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            whatsappOk = !!(data && data.ok && data.conectado);
          }
        } catch (_) {
          whatsappOk = false;
        }
      }

      if (whatsappOk) {
        whatsappUi.dot.classList.add("online");
        whatsappUi.dot.setAttribute("aria-label", "WhatsApp conectado");
        whatsappUi.wrap.title = "WhatsApp: conectado";
      } else {
        whatsappUi.dot.classList.remove("online");
        whatsappUi.dot.setAttribute("aria-label", "WhatsApp desconectado");
        whatsappUi.wrap.title = reachable
          ? "WhatsApp: desconectado"
          : "WhatsApp: sin backend";
      }
    }

    update();
    setInterval(update, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

