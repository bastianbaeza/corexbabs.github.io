(function () {
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
  if (!BASE) return;

  const listEl = document.getElementById("tareas-list");
  const form = document.getElementById("tarea-form");
  const toggleBtn = document.getElementById("btn-nueva-tarea");
  const cancelBtn = document.getElementById("btn-cancelar-tarea");

  if (!listEl) return;

  let tareas = [];

  function formatFechaHora(fecha, hora) {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    const fechaTxt = Number.isNaN(d.getTime())
      ? String(fecha)
      : d.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    const horaTxt = hora ? String(hora).slice(0, 5) : "sin hora";
    return `${fechaTxt} ${horaTxt}`;
  }

  async function fetchJson(url, opts) {
    try {
      const r = await fetch(url, opts);
      if (!r.ok) return null;
      return await r.json();
    } catch (_) {
      return null;
    }
  }

  async function loadTareas() {
    const data = await fetchJson(`${BASE}/api/tareas?limit=10`);
    tareas = data && data.tareas ? data.tareas : [];
    render();
  }

  function render() {
    listEl.innerHTML = "";
    if (!tareas.length) {
      const empty = document.createElement("div");
      empty.className = "tarea-meta";
      empty.textContent = "Sin tareas pendientes.";
      listEl.appendChild(empty);
      return;
    }

    tareas.forEach((tarea) => {
      const item = document.createElement("div");
      item.className = "tarea-item";

      const header = document.createElement("div");
      header.className = "tarea-item-header";

      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "tarea-title";
      title.textContent = tarea.titulo || "Sin titulo";
      const meta = document.createElement("div");
      meta.className = "tarea-meta";
      meta.textContent = formatFechaHora(tarea.fecha, tarea.hora);
      left.appendChild(title);
      left.appendChild(meta);
      if (tarea.descripcion) {
        const desc = document.createElement("div");
        desc.className = "tarea-desc";
        desc.textContent = tarea.descripcion;
        left.appendChild(desc);
      }

      const right = document.createElement("div");
      right.className = "tarea-tags";

      const tagTipo = document.createElement("span");
      tagTipo.className = "tarea-tag";
      tagTipo.textContent = tarea.tipo || "mixto";
      right.appendChild(tagTipo);

      const tagEstado = document.createElement("span");
      tagEstado.className = "tarea-tag";
      tagEstado.textContent = tarea.estado || "pendiente";
      right.appendChild(tagEstado);

      if (tarea.recordatorio) {
        const tagRec = document.createElement("span");
        tagRec.className = "tarea-tag";
        tagRec.textContent = "recordatorio";
        right.appendChild(tagRec);
      }

      const estadoToggle = document.createElement("label");
      estadoToggle.style.display = "flex";
      estadoToggle.style.alignItems = "center";
      estadoToggle.style.gap = "6px";
      const estadoCb = document.createElement("input");
      estadoCb.type = "checkbox";
      estadoCb.checked = tarea.estado === "completada";
      estadoCb.addEventListener("change", () => {
        const nuevoEstado = estadoCb.checked ? "completada" : "pendiente";
        updateTarea(tarea.id, { estado: nuevoEstado });
      });
      const estadoTxt = document.createElement("span");
      estadoTxt.className = "tarea-meta";
      estadoTxt.textContent = "hecha";
      estadoToggle.appendChild(estadoCb);
      estadoToggle.appendChild(estadoTxt);
      right.appendChild(estadoToggle);

      header.appendChild(left);
      header.appendChild(right);
      item.appendChild(header);

      const checklist = Array.isArray(tarea.checklist) ? tarea.checklist : [];
      if (checklist.length > 0) {
        const list = document.createElement("div");
        list.className = "tarea-checklist";
        checklist.forEach((c, idx) => {
          const row = document.createElement("label");
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.checked = Boolean(c.done);
          cb.addEventListener("change", () => {
            const next = checklist.map((item, i) =>
              i === idx ? { ...item, done: cb.checked } : item
            );
            updateTarea(tarea.id, { checklist: next });
          });
          const txt = document.createElement("span");
          txt.textContent = c.text || "";
          row.appendChild(cb);
          row.appendChild(txt);
          list.appendChild(row);
        });
        item.appendChild(list);
      }

      const noteSection = document.createElement("div");
      noteSection.className = "tarea-note";

      const noteText = document.createElement("div");
      noteText.className = "tarea-desc";
      if (tarea.descripcion) {
        noteText.textContent = tarea.descripcion;
      } else {
        noteText.textContent = "Sin nota.";
        noteText.classList.add("is-empty");
      }

      const noteActions = document.createElement("div");
      noteActions.className = "tarea-note-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-link";
      editBtn.textContent = tarea.descripcion ? "Editar nota" : "Agregar nota";

      const noteForm = document.createElement("div");
      noteForm.className = "tarea-note-form is-hidden";

      const noteInput = document.createElement("textarea");
      noteInput.rows = 2;
      noteInput.value = tarea.descripcion || "";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn-primary btn-small";
      saveBtn.textContent = "Guardar nota";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn-secondary btn-small";
      cancelBtn.textContent = "Cancelar";

      editBtn.addEventListener("click", () => {
        noteText.style.display = "none";
        noteForm.classList.remove("is-hidden");
        noteInput.focus();
      });

      cancelBtn.addEventListener("click", () => {
        noteInput.value = tarea.descripcion || "";
        noteForm.classList.add("is-hidden");
        noteText.style.display = "";
      });

      saveBtn.addEventListener("click", async () => {
        const next = noteInput.value.trim();
        noteForm.classList.add("is-hidden");
        noteText.style.display = "";
        noteText.textContent = next || "Sin nota.";
        noteText.classList.toggle("is-empty", !next);
        editBtn.textContent = next ? "Editar nota" : "Agregar nota";
        await updateTarea(tarea.id, { descripcion: next || null });
      });

      noteActions.appendChild(editBtn);
      noteForm.appendChild(noteInput);
      noteForm.appendChild(saveBtn);
      noteForm.appendChild(cancelBtn);
      noteSection.appendChild(noteText);
      noteSection.appendChild(noteActions);
      noteSection.appendChild(noteForm);
      item.appendChild(noteSection);

      listEl.appendChild(item);
    });
  }

  async function updateTarea(id, payload) {
    const data = await fetchJson(`${BASE}/api/tareas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (data && data.tarea) {
      const idx = tareas.findIndex((t) => t.id === id);
      if (idx >= 0) {
        tareas[idx] = data.tarea;
        render();
      } else {
        loadTareas();
      }
    }
  }

  function readFormValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const titulo = readFormValue("tarea-titulo").trim();
      if (!titulo) return;
      const checklistRaw = readFormValue("tarea-checklist");
      const descripcion = readFormValue("tarea-descripcion").trim();
      const checklist = String(checklistRaw || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ text, done: false }));

      const payload = {
        titulo,
        descripcion: descripcion || null,
        tipo: readFormValue("tarea-tipo") || "mixto",
        fecha: readFormValue("tarea-fecha") || null,
        hora: readFormValue("tarea-hora") || null,
        recordatorio: Boolean(
          document.getElementById("tarea-recordatorio")?.checked
        ),
        checklist,
      };

      const data = await fetchJson(`${BASE}/api/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (data && data.tarea) {
        form.reset();
        form.classList.add("is-hidden");
        loadTareas();
      }
    });
  }

  if (toggleBtn && form) {
    toggleBtn.addEventListener("click", () => {
      form.classList.toggle("is-hidden");
    });
  }

  if (cancelBtn && form) {
    cancelBtn.addEventListener("click", () => {
      form.classList.add("is-hidden");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTareas);
  } else {
    loadTareas();
  }
  setInterval(loadTareas, 60000);
})();
