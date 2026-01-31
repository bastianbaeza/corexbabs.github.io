// Covey Planner Pro - standalone widget for Planificación tab
// Modern vanilla JS (no build) with localStorage persistence.

(function () {
  const STORAGE_KEY = "covey_planner_week";
  const undoStack = [];
  const redoStack = [];

  const weekTemplate = () => {
    const today = new Date();
    const start = startOfWeek(today);
    const weekNumber = getISOWeekNumber(start);
    const startDate = formatISO(start);
    return {
      id: crypto.randomUUID(),
      startDate,
      weekNumber,
      mission:
        "Vivir con intención, priorizando lo importante sobre lo urgente, protegiendo tiempo de enfoque y bienestar.",
      roles: [
        role("Líder"),
        role("Salud"),
        role("Familia"),
        role("Aprendizaje"),
      ],
      weeklyPriorities: [
        priority("Entregar propuesta de proyecto", 1, true, false),
        priority("Bloquear 3 bloques de deep work", 2, true, false),
        priority("Cerrar pendientes administrativos", 3, false, true),
      ],
      days: buildDays(startDate),
      sharpenTheSaw: [
        { area: "Física", items: [sawItem("Entrenar 3x"), sawItem("Dormir 7h")] },
        {
          area: "Social/Emocional",
          items: [sawItem("Llamar a familia"), sawItem("Salir con amigos")],
        },
        {
          area: "Mental",
          items: [sawItem("Leer 2 capítulos"), sawItem("Curso online 1h")],
        },
        {
          area: "Espiritual",
          items: [sawItem("Meditación 10min"), sawItem("Journaling")],
        },
      ],
      unforeseen: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  function role(name = "Rol") {
    return { id: crypto.randomUUID(), name, order: Date.now(), goals: [] };
  }
  function goal(title) {
    return {
      id: crypto.randomUUID(),
      roleId: "",
      title,
      done: false,
      notes: "",
    };
  }
  function priority(title, order = 1, important = true, urgent = false) {
    return {
      id: crypto.randomUUID(),
      title,
      order,
      important,
      urgent,
      linkedGoalId: undefined,
    };
  }
  function task(title) {
    return {
      id: crypto.randomUUID(),
      title,
      notes: "",
      scheduledAt: null,
      durationMin: 30,
      done: false,
      priorityId: undefined,
    };
  }
  function block(title, start, end, color = "#f59e0b") {
    return {
      id: crypto.randomUUID(),
      title,
      start,
      end,
      color,
      priorityId: undefined,
    };
  }
  function sawItem(title) {
    return { id: crypto.randomUUID(), title, done: false };
  }
  function unforeseen(title) {
    return { id: crypto.randomUUID(), title, createdAt: new Date().toISOString() };
  }

  function buildDays(startDate) {
    const start = new Date(startDate + "T00:00:00");
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        id: crypto.randomUUID(),
        dow: i + 1,
        mit: [],
        blocks: [],
        tasks: [],
        travel: [],
      });
    }
    return days;
  }

  function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay() || 7;
    if (day !== 1) d.setHours(-24 * (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getISOWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  }

  function formatISO(date) {
    return date.toISOString().split("T")[0];
  }

  function loadWeek() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return weekTemplate();
      const parsed = JSON.parse(raw);
      return parsed || weekTemplate();
    } catch (e) {
      console.warn("Fallo al leer Covey Pro, usando template", e);
      return weekTemplate();
    }
  }

  function saveWeek(week) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(week));
  }

  let week = loadWeek();

  function pushUndo() {
    undoStack.push(JSON.stringify(week));
    if (undoStack.length > 30) undoStack.shift();
    redoStack.length = 0;
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(week));
    week = JSON.parse(undoStack.pop());
    renderAll();
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(week));
    week = JSON.parse(redoStack.pop());
    renderAll();
  }

  function renderAll() {
    renderHeader();
    renderMissionRoles();
    renderPriorities();
    renderWeek();
    renderSaw();
    renderUnforeseen();
    renderStats();
    saveWeek(week);
  }

  function renderHeader() {
    const weekInput = document.getElementById("covey-week-input");
    if (weekInput && !weekInput.value) {
      const d = new Date(week.startDate);
      const year = d.getFullYear();
      const weekNum = String(week.weekNumber).padStart(2, "0");
      weekInput.value = `${year}-W${weekNum}`;
      weekInput.onchange = (e) => {
        pushUndo();
        const [yr, w] = e.target.value.split("-W");
        const start = weekStartFromISO(Number(yr), Number(w));
        week.startDate = formatISO(start);
        week.weekNumber = Number(w);
        week.days = buildDays(week.startDate);
        week.updatedAt = new Date().toISOString();
        renderAll();
      };
    }
    const label = document.getElementById("covey-week-label");
    if (label) {
      const start = new Date(week.startDate + "T00:00:00");
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const format = (d) =>
        d.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
      label.textContent = `${format(start)} – ${format(end)} · Semana ${week.weekNumber}`;
    }
  }

  function weekStartFromISO(year, weekNo) {
    const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  function renderMissionRoles() {
    const mission = document.getElementById("covey-mission");
    if (mission) {
      mission.value = week.mission || "";
      mission.oninput = (e) => {
        pushUndo();
        week.mission = e.target.value;
        week.updatedAt = new Date().toISOString();
      };
    }

    const rolesEl = document.getElementById("covey-roles");
    if (!rolesEl) return;
    rolesEl.innerHTML = "";
    week.roles
      .sort((a, b) => a.order - b.order)
      .slice(0, 7)
      .forEach((role) => {
        const wrapper = document.createElement("div");
        wrapper.className = "covey-role";
        wrapper.innerHTML = `
          <div class="covey-role-header">
            <input class="covey-pro-input" value="${role.name}" />
            <button class="btn-secondary" aria-label="Eliminar rol">Eliminar</button>
          </div>
          <div class="covey-role-goals" id="goals-${role.id}"></div>
          <button class="btn-secondary" data-role="${role.id}">+ Meta</button>
        `;
        const input = wrapper.querySelector("input");
        input.oninput = (e) => {
          pushUndo();
          role.name = e.target.value;
          role.updatedAt = new Date().toISOString();
          saveWeek(week);
        };
        const btnDel = wrapper.querySelector("button.btn-secondary");
        btnDel.onclick = () => {
          pushUndo();
          week.roles = week.roles.filter((r) => r.id !== role.id);
          renderAll();
        };
        const btnAddGoal = wrapper.querySelector(`[data-role="${role.id}"]`);
        btnAddGoal.onclick = () => {
          pushUndo();
          const g = goal("Meta");
          g.roleId = role.id;
          role.goals = role.goals || [];
          role.goals.push(g);
          renderAll();
        };
        rolesEl.appendChild(wrapper);
        renderGoals(role);
      });

    const addRoleBtn = document.getElementById("covey-add-role");
    if (addRoleBtn && !addRoleBtn.dataset.bound) {
      addRoleBtn.dataset.bound = "true";
      addRoleBtn.onclick = () => {
        if (week.roles.length >= 7) {
          alert("Máximo 7 roles");
          return;
        }
        pushUndo();
        week.roles.push(role("Nuevo rol"));
        renderAll();
      };
    }
  }

  function renderGoals(role) {
    const container = document.getElementById(`goals-${role.id}`);
    if (!container) return;
    container.innerHTML = "";
    (role.goals || []).slice(0, 4).forEach((g) => {
      const row = document.createElement("div");
      row.className = "covey-goal";
      row.innerHTML = `
        <input type="checkbox" ${g.done ? "checked" : ""} aria-label="Completar meta" />
        <input class="covey-pro-input" value="${g.title}" />
        <button class="btn-secondary" aria-label="Eliminar meta">✕</button>
      `;
      const check = row.querySelector("input[type='checkbox']");
      const title = row.querySelector("input[type='text'], input[type='text'] + input");
      const remove = row.querySelector("button");
      check.onchange = (e) => {
        pushUndo();
        g.done = e.target.checked;
        renderStats();
        saveWeek(week);
      };
      title.oninput = (e) => {
        pushUndo();
        g.title = e.target.value;
        saveWeek(week);
      };
      remove.onclick = () => {
        pushUndo();
        role.goals = role.goals.filter((x) => x.id !== g.id);
        renderAll();
      };
      container.appendChild(row);
    });
  }

  function renderPriorities() {
    const list = document.getElementById("covey-weekly-priorities");
    if (!list) return;
    list.innerHTML = "";
    week.weeklyPriorities
      .sort((a, b) => a.order - b.order)
      .forEach((p) => {
        const row = document.createElement("div");
        row.className = "covey-priority";
        row.innerHTML = `
          <input type="number" class="covey-pro-input" value="${p.order}" min="1" />
          <input class="covey-pro-input" value="${p.title}" />
          <label class="covey-pill"><input type="checkbox" ${p.important ? "checked" : ""}/> Importante</label>
          <label class="covey-pill"><input type="checkbox" ${p.urgent ? "checked" : ""}/> Urgente</label>
          <button class="btn-secondary">✕</button>
        `;
        const order = row.querySelector("input[type='number']");
        const title = row.querySelector("input[type='text']");
        const imp = row.querySelectorAll("input[type='checkbox']")[0];
        const urg = row.querySelectorAll("input[type='checkbox']")[1];
        const del = row.querySelector("button");
        order.oninput = (e) => {
          pushUndo();
          p.order = Number(e.target.value || 1);
          renderPriorities();
          saveWeek(week);
        };
        title.oninput = (e) => {
          pushUndo();
          p.title = e.target.value;
          saveWeek(week);
        };
        imp.onchange = (e) => {
          pushUndo();
          p.important = e.target.checked;
          saveWeek(week);
        };
        urg.onchange = (e) => {
          pushUndo();
          p.urgent = e.target.checked;
          saveWeek(week);
        };
        del.onclick = () => {
          pushUndo();
          week.weeklyPriorities = week.weeklyPriorities.filter((x) => x.id !== p.id);
          renderPriorities();
          renderStats();
        };
        list.appendChild(row);
      });

    const add = document.getElementById("covey-add-priority");
    if (add && !add.dataset.bound) {
      add.dataset.bound = "true";
      add.onclick = () => {
        pushUndo();
        week.weeklyPriorities.push(priority("Nueva prioridad", week.weeklyPriorities.length + 1, true, false));
        renderPriorities();
      };
    }
  }

  function renderWeek() {
    const grid = document.getElementById("covey-week-grid");
    if (!grid) return;
    const query = (document.getElementById("covey-search") || { value: "" }).value?.toLowerCase() || "";
    grid.innerHTML = "";
    week.days.forEach((day) => {
      const dayName = dayNameFromDow(day.dow);
      const dayDate = dateFromDow(day.dow);
      const column = document.createElement("div");
      column.className = "covey-day";
      column.innerHTML = `
        <div class="covey-day-header">
          <div><strong>${dayName}</strong><br/><small>${dayDate}</small></div>
          <span class="covey-chip">${day.mit.length}/3 MITs</span>
        </div>
        <div class="covey-mits" id="mits-${day.id}"></div>
        <div class="covey-task-list" id="tasks-${day.id}"></div>
        <div class="covey-agenda" id="agenda-${day.id}"></div>
        <button class="btn-secondary" data-day="${day.id}" data-action="add-mit">+ MIT</button>
        <button class="btn-secondary" data-day="${day.id}" data-action="add-task">+ Tarea</button>
        <button class="btn-secondary" data-day="${day.id}" data-action="add-block">+ Bloque</button>
      `;
      grid.appendChild(column);
      renderMits(day);
      renderTasks(day, query);
      renderAgenda(day);
      column.querySelectorAll("button[data-day]").forEach((btn) => {
        const action = btn.getAttribute("data-action");
        if (action === "add-mit") btn.onclick = () => addMit(day.id);
        if (action === "add-task") btn.onclick = () => addTask(day.id);
        if (action === "add-block") btn.onclick = () => addBlock(day.id);
      });
    });
  }

  function dayNameFromDow(dow) {
    const map = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return map[dow - 1] || "";
  }
  function dateFromDow(dow) {
    const start = new Date(week.startDate + "T00:00:00");
    const d = new Date(start);
    d.setDate(start.getDate() + (dow - 1));
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  function renderMits(day) {
    const container = document.getElementById(`mits-${day.id}`);
    if (!container) return;
    container.innerHTML = "";
    day.mit.slice(0, 3).forEach((title, idx) => {
      const row = document.createElement("div");
      row.innerHTML = `
        <input class="covey-mit-input" value="${title}" />
        <button class="btn-secondary">✕</button>
      `;
      const input = row.querySelector("input");
      const del = row.querySelector("button");
      input.oninput = (e) => {
        pushUndo();
        day.mit[idx] = e.target.value;
        saveWeek(week);
      };
      del.onclick = () => {
        pushUndo();
        day.mit.splice(idx, 1);
        renderMits(day);
        renderStats();
      };
      container.appendChild(row);
    });
  }

  function renderTasks(day, query = "") {
    const container = document.getElementById(`tasks-${day.id}`);
    if (!container) return;
    container.innerHTML = "";
    (day.tasks || [])
      .filter((t) => t.title.toLowerCase().includes(query))
      .forEach((t) => {
        const row = document.createElement("div");
        row.className = "covey-task";
        row.draggable = true;
        row.dataset.taskId = t.id;
        row.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <label style="display:flex; gap:6px; align-items:center; width:100%;">
              <input type="checkbox" ${t.done ? "checked" : ""} aria-label="Completar tarea"/>
              <input class="covey-pro-input" value="${t.title}" />
            </label>
            <button class="btn-secondary">✕</button>
          </div>
          <small style="color:#94a3b8;">${t.durationMin || 30} min${t.notes ? " · " + t.notes : ""}</small>
        `;
        row.addEventListener("dragstart", (e) => handleTaskDragStart(e, day.id, t.id));
        row.addEventListener("dragover", (e) => handleTaskDragOver(e));
        row.addEventListener("drop", (e) => handleTaskDrop(e, day.id));
        row.addEventListener("dragend", handleTaskDragEnd);

        const check = row.querySelector("input[type='checkbox']");
        const title = row.querySelector("input[type='text']");
        const del = row.querySelector("button");
        check.onchange = (e) => {
          pushUndo();
          t.done = e.target.checked;
          renderStats();
          saveWeek(week);
        };
        title.oninput = (e) => {
          pushUndo();
          t.title = e.target.value;
          saveWeek(week);
        };
        del.onclick = () => {
          pushUndo();
          day.tasks = day.tasks.filter((x) => x.id !== t.id);
          renderTasks(day, query);
        };
        container.appendChild(row);
      });
    container.addEventListener("dragover", (e) => handleTaskDragOver(e));
    container.addEventListener("drop", (e) => handleTaskDrop(e, day.id));
  }

  let draggingTask = null;
  function handleTaskDragStart(e, dayId, taskId) {
    draggingTask = { dayId, taskId };
    e.dataTransfer.effectAllowed = "move";
  }
  function handleTaskDragOver(e) {
    e.preventDefault();
  }
  function handleTaskDrop(e, targetDayId) {
    e.preventDefault();
    if (!draggingTask) return;
    const { dayId, taskId } = draggingTask;
    if (dayId === targetDayId) return;
    const sourceDay = week.days.find((d) => d.id === dayId);
    const targetDay = week.days.find((d) => d.id === targetDayId);
    if (!sourceDay || !targetDay) return;
    const t = sourceDay.tasks.find((x) => x.id === taskId);
    if (!t) return;
    pushUndo();
    sourceDay.tasks = sourceDay.tasks.filter((x) => x.id !== taskId);
    targetDay.tasks.push(t);
    renderWeek();
  }
  function handleTaskDragEnd() {
    draggingTask = null;
  }

  function renderAgenda(day) {
    const container = document.getElementById(`agenda-${day.id}`);
    if (!container) return;
    container.innerHTML = "";
    (day.blocks || []).forEach((b) => {
      const row = document.createElement("div");
      row.className = "covey-agenda-slot";
      row.style.borderLeft = `4px solid ${b.color || "#f59e0b"}`;
      row.innerHTML = `
        <div style="color:#cbd5e1; font-weight:700;">${b.start} – ${b.end}</div>
        <div>${b.title}</div>
        <button class="btn-secondary">✕</button>
      `;
      row.querySelector("button").onclick = () => {
        pushUndo();
        day.blocks = day.blocks.filter((x) => x.id !== b.id);
        renderAgenda(day);
      };
      container.appendChild(row);
    });
  }

  function addMit(dayId) {
    const day = week.days.find((d) => d.id === dayId);
    if (!day) return;
    if (day.mit.length >= 3) {
      alert("Máximo 3 MITs por día");
      return;
    }
    const title = prompt("MIT:");
    if (!title) return;
    pushUndo();
    day.mit.push(title);
    renderWeek();
  }

  function addTask(dayId) {
    const day = week.days.find((d) => d.id === dayId);
    if (!day) return;
    const title = prompt("Tarea:");
    if (!title) return;
    pushUndo();
    day.tasks.push(task(title));
    renderWeek();
  }

  function addBlock(dayId) {
    const day = week.days.find((d) => d.id === dayId);
    if (!day) return;
    const title = prompt("Bloque (título):", "Deep Work");
    const start = prompt("Inicio (HH:mm):", "09:00");
    const end = prompt("Fin (HH:mm):", "10:00");
    if (!title || !start || !end) return;
    pushUndo();
    day.blocks.push(block(title, start, end));
    renderWeek();
  }

  function renderSaw() {
    const container = document.getElementById("covey-saw");
    if (!container) return;
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "covey-saw-grid";
    week.sharpenTheSaw.forEach((area) => {
      const card = document.createElement("div");
      card.className = "covey-saw-card";
      card.innerHTML = `<strong>${area.area}</strong>`;
      const list = document.createElement("div");
      list.style.display = "grid";
      list.style.gap = "6px";
      (area.items || []).forEach((item) => {
        const row = document.createElement("div");
        row.className = "covey-goal";
        row.innerHTML = `
          <input type="checkbox" ${item.done ? "checked" : ""}/>
          <input class="covey-pro-input" value="${item.title}"/>
          <button class="btn-secondary">✕</button>
        `;
        row.querySelector("input[type='checkbox']").onchange = (e) => {
          pushUndo();
          item.done = e.target.checked;
          renderSaw();
          renderStats();
        };
        row.querySelector("input[type='text'], input[type='text'] + input").oninput = (e) => {
          pushUndo();
          item.title = e.target.value;
          saveWeek(week);
        };
        row.querySelector("button").onclick = () => {
          pushUndo();
          area.items = area.items.filter((x) => x.id !== item.id);
          renderSaw();
          renderStats();
        };
        list.appendChild(row);
      });
      const addBtn = document.createElement("button");
      addBtn.className = "btn-secondary";
      addBtn.textContent = "+ Añadir";
      addBtn.onclick = () => {
        pushUndo();
        area.items.push(sawItem("Actividad"));
        renderSaw();
      };
      card.appendChild(list);
      card.appendChild(addBtn);
      grid.appendChild(card);
    });
    container.appendChild(grid);

    const add = document.getElementById("covey-add-saw-item");
    if (add && !add.dataset.bound) {
      add.dataset.bound = "true";
      add.onclick = () => {
        pushUndo();
        week.sharpenTheSaw[0].items.push(sawItem("Nueva actividad"));
        renderSaw();
      };
    }
  }

  function renderUnforeseen() {
    const list = document.getElementById("covey-unforeseen");
    if (!list) return;
    list.innerHTML = "";
    (week.unforeseen || []).forEach((item) => {
      const row = document.createElement("div");
      row.className = "covey-unforeseen-item";
      row.innerHTML = `
        <div>
          <div>${item.title}</div>
          <small style="color:#94a3b8;">${new Date(item.createdAt).toLocaleString("es-CL")}</small>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary">Convertir a tarea</button>
          <button class="btn-secondary">✕</button>
        </div>
      `;
      const convert = row.querySelectorAll("button")[0];
      const del = row.querySelectorAll("button")[1];
      convert.onclick = () => {
        pushUndo();
        const day = week.days[0];
        day.tasks.push(task(item.title));
        item.convertedTaskId = day.tasks[day.tasks.length - 1].id;
        renderWeek();
        renderUnforeseen();
      };
      del.onclick = () => {
        pushUndo();
        week.unforeseen = week.unforeseen.filter((x) => x.id !== item.id);
        renderUnforeseen();
      };
      list.appendChild(row);
    });
    const addBtn = document.getElementById("covey-add-unforeseen");
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = "true";
      addBtn.onclick = () => {
        const title = prompt("Imprevisto:");
        if (!title) return;
        pushUndo();
        week.unforeseen.push(unforeseen(title));
        renderUnforeseen();
      };
    }
  }

  function renderStats() {
    const container = document.getElementById("covey-stats");
    if (!container) return;
    const totalGoals = week.roles.reduce((s, r) => s + (r.goals?.length || 0), 0);
    const doneGoals = week.roles.reduce(
      (s, r) => s + (r.goals || []).filter((g) => g.done).length,
      0,
    );
    const totalMits = week.days.reduce((s, d) => s + d.mit.length, 0);
    const doneTasks = week.days.reduce((s, d) => s + (d.tasks || []).filter((t) => t.done).length, 0);
    const totalTasks = week.days.reduce((s, d) => s + (d.tasks || []).length, 0);
    const blockedMinutes = week.days.reduce(
      (s, d) =>
        s +
        (d.blocks || []).reduce((acc, b) => acc + durationMinutes(b.start, b.end), 0),
      0,
    );
    container.innerHTML = `
      <div class="covey-stat"><div>Metas</div><strong>${doneGoals}/${totalGoals}</strong></div>
      <div class="covey-stat"><div>MITs</div><strong>${totalMits}</strong></div>
      <div class="covey-stat"><div>Tareas</div><strong>${doneTasks}/${totalTasks}</strong></div>
      <div class="covey-stat"><div>Tiempo bloqueado</div><strong>${Math.round(
        blockedMinutes / 60,
      )}h</strong></div>
    `;
  }

  function durationMinutes(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  }

  function bindToolbar() {
    const exportBtn = document.getElementById("covey-export-btn");
    if (exportBtn && !exportBtn.dataset.bound) {
      exportBtn.dataset.bound = "true";
      exportBtn.onclick = () => {
        const blob = new Blob([JSON.stringify(week, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `covey-week-${week.weekNumber}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }
    const importBtn = document.getElementById("covey-import-btn");
    if (importBtn && !importBtn.dataset.bound) {
      importBtn.dataset.bound = "true";
      importBtn.onclick = async () => {
        const file = await pickFile();
        if (!file) return;
        const text = await file.text();
        try {
          const parsed = JSON.parse(text);
          pushUndo();
          week = parsed;
          renderAll();
        } catch (e) {
          alert("JSON inválido");
        }
      };
    }
    const dupBtn = document.getElementById("covey-duplicate-week");
    if (dupBtn && !dupBtn.dataset.bound) {
      dupBtn.dataset.bound = "true";
      dupBtn.onclick = () => {
        pushUndo();
        const newStart = new Date(week.startDate + "T00:00:00");
        newStart.setDate(newStart.getDate() + 7);
        const newWeekNo = getISOWeekNumber(newStart);
        const clone = structuredClone(week);
        clone.id = crypto.randomUUID();
        clone.startDate = formatISO(newStart);
        clone.weekNumber = newWeekNo;
        clone.days = buildDays(clone.startDate);
        clone.createdAt = new Date().toISOString();
        clone.updatedAt = new Date().toISOString();
        week = clone;
        renderAll();
      };
    }
    const undoBtn = document.getElementById("covey-undo");
    const redoBtn = document.getElementById("covey-redo");
    if (undoBtn && !undoBtn.dataset.bound) {
      undoBtn.dataset.bound = "true";
      undoBtn.onclick = undo;
    }
    if (redoBtn && !redoBtn.dataset.bound) {
      redoBtn.dataset.bound = "true";
      redoBtn.onclick = redo;
    }
    const search = document.getElementById("covey-search");
    if (search && !search.dataset.bound) {
      search.dataset.bound = "true";
      search.oninput = () => renderWeek();
    }
    const themeBtn = document.getElementById("covey-toggle-theme");
    if (themeBtn && !themeBtn.dataset.bound) {
      themeBtn.dataset.bound = "true";
      themeBtn.onclick = () => {
        document.body.classList.toggle("dark-theme");
      };
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "N" || e.key === "n") {
        e.preventDefault();
        const firstDay = week.days[0];
        addTask(firstDay.id);
      }
      if (e.key === "Delete") {
        // noop: could hook selected task if tracked
      }
    });
  }

  function pickFile() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = () => resolve(input.files?.[0]);
      input.click();
    });
  }

  function inicializarCoveyPro() {
    const anchor = document.getElementById("covey-week-grid");
    if (!anchor) return;
    bindToolbar();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", inicializarCoveyPro);
})();
