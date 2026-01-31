// frontend/js/desarrollo-personal.js
// L├│gica del m├│dulo de Desarrollo Personal

// API URL - Siempre apunta al backend en puerto 3000
const API_URL = "http://127.0.0.1:3000";

// Frases Millonarias del D├¡a
const FRASES_MILLONARIAS = [
  "Tus ingresos solo crecen hasta donde creces tu.",
  "Si quieres otros frutos, cuida primero las raices.",
  "Lo visible cambia cuando transformas lo invisible.",
  "El dinero es efecto: causa tu mentalidad y tus actos.",
  "El subconsciente elige emociones profundas antes que la logica.",
  "Si la motivacion viene del miedo, el dinero no da felicidad.",
  "Reprograma tu termostato financiero si quieres otro resultado.",
  "Ser consciente es elegir, no vivir con el piloto del pasado.",
  "Puedes adoptar actitudes que sumen felicidad y prosperidad.",
  "El dinero importa donde funciona y sobra donde no hace falta.",
  "Quejarte te convierte en iman de desgracias.",
  "No hay victima rica: deja la queja y toma responsabilidad.",
  "Si buscas comodidad, no te haras rico. Si buscas riqueza, llegara la comodidad.",
  "La mayoria no logra lo que quiere porque no sabe que quiere.",
  "Si no estas totalmente comprometido a crear riqueza, es dificil que llegue.",
  "Se te paga en proporcion al valor que entregas al mercado.",
  "Bendice lo que quieres atraer.",
  "Los lideres ganan mas que los seguidores porque asumen mas valor.",
  "Hazte mas grande que tus problemas; no los esquives.",
  "Vives dentro de la historia que te cuentas: hazla valer.",
  "El dinero potencia tu caracter: si eres generoso, mas; si no, tambien.",
  "La forma en que haces algo es la forma en que lo haces todo.",
  "No pongas techo a tus ingresos: limita ideas, no resultados.",
  "Piensa en tener el pastel y tambien comerlo.",
  "No te centres en el agujero: mereces el pastel completo.",
  "La verdadera riqueza es el patrimonio neto, no el sueldo.",
  "Donde va la atencion, fluye la energia y aparecen resultados.",
  "Si no manejas bien lo que tienes, no llegara mas.",
  "Administrar dinero importa mas que la cantidad inicial.",
  "Controla el dinero o el dinero te controla.",
  "Cada dolar es una semilla que puede multiplicarse.",
  "La accion es el puente entre tu mundo interno y el externo.",
  "No necesitas eliminar el miedo para avanzar.",
  "Si solo haces lo facil, la vida sera dura; haz lo dificil y se hara facil.",
  "Creces de verdad cuando te sientes incomodo.",
  "Entrenar la mente es la habilidad clave para exito y felicidad.",
  "Puedes ir tirando o puedes ser rico, no ambas.",
  "Todo maestro fue aprendiz: empieza y mejora.",
  "Para cobrar la mejor paga, conviertete en el mejor."
];

const DECLARACIONES_RIQUEZA = [
  "Mi mundo interior crea mi mundo exterior.",
  "Lo que oi del dinero no tiene por que ser cierto; elijo creencias que me empoderen.",
  "Yo decido mi modelo de dinero, no repito el de otros.",
  "Suelto experiencias pasadas con el dinero y creo un futuro prospero.",
  "Observo mis pensamientos y conservo solo los que me dan poder.",
  "Yo diseno el nivel de mi prosperidad economica.",
  "Mi meta es convertirme en millonario, y mas.",
  "Me comprometo a ser rico.",
  "Pienso en grande y ayudo a miles de personas.",
  "Me enfoco en oportunidades, no en obstaculos: preparo, ejecuto, ajusto.",
  "Bendigo y admiro a la gente rica; yo tambien sere una de esas personas.",
  "Me rodeo de gente prospera: si ellos pueden, yo puedo.",
  "Promociono mi valor con pasion y entusiasmo.",
  "Soy mas grande que cualquier problema y puedo manejarlo.",
  "Soy un gran receptor: estoy dispuesto a recibir mucho dinero en mi vida.",
  "Elijo que se me pague segun mis resultados.",
  "Pienso en las dos opciones y analizo antes de tomar riesgos.",
  "Me centro en construir una fortuna neta.",
  "Soy un administrador excelente del dinero.",
  "Mi dinero trabaja para mi y cada vez produce mas.",
  "Me comprometo a aprender y crecer constantemente."
];

// Estado global
let state = {
  habitos: [],
  finanzas: [],
  finanzasFiltroMetodo: "",
  categoriasFinanzas: [],
  objetivos: [],
  entretenimiento: [],
  eventosPersonales: [],
  agendaMes: null,
  agendaAnio: null,
  agendaFechaSeleccionada: null,
  currentTab: "dashboard",
};

let entretenimientoEditando = null;

// Inicializaci├│n
document.addEventListener("DOMContentLoaded", () => {
  console.log("Ô£à M├│dulo de Desarrollo Personal cargado");

  // Mostrar frases del d├¡a
  mostrarFraseDelDia();

  // Actualizar reloj y fecha de Chile
  actualizarRelojChile();
  setInterval(actualizarRelojChile, 1000);
  actualizarPlanFechaHoy();
  setInterval(actualizarPlanFechaHoy, 60 * 1000);

  // Establecer fecha actual en los formularios
  const fechaInputs = document.querySelectorAll('input[type="date"]');
  const hoy = new Date().toISOString().split("T")[0];
  fechaInputs.forEach((input) => {
    if (input.name === "fecha" || input.name === "fecha_inicio") {
      input.value = hoy;
    }
  });

  // Categorías finanzas
  cargarCategoriasFinanzas();
  ordenarSelectsMetodoPago();

  // Cargar datos iniciales
  cargarDashboard();
  cargarEntretenimiento();
});

// ==================== MEN├Ü HAMBURGUESA ====================

function toggleMenu() {
  const menu = document.getElementById("sidebar-menu");
  const overlay = document.getElementById("sidebar-overlay");

  if (menu && overlay) {
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

function closeMenu() {
  const menu = document.getElementById("sidebar-menu");
  const overlay = document.getElementById("sidebar-overlay");

  if (menu && overlay) {
    menu.classList.remove("active");
    overlay.classList.remove("active");
  }
}

// Cerrar men├║ al hacer clic en overlay
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // Cerrar men├║ al hacer clic en un enlace
  const menuLinks = document.querySelectorAll(".sidebar-menu a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
});

// ==================== FRASES MILLONARIAS ====================

function mostrarFraseDelDia() {
  // Seleccionar una frase aleatoria para principios de riqueza
  const fraseAleatoria =
    FRASES_MILLONARIAS[Math.floor(Math.random() * FRASES_MILLONARIAS.length)];
  const fraseEl = document.getElementById("frase-del-dia");
  if (fraseEl) fraseEl.textContent = fraseAleatoria;

  // Seleccionar una declaraci├│n aleatoria
  const declaracionAleatoria =
    DECLARACIONES_RIQUEZA[
      Math.floor(Math.random() * DECLARACIONES_RIQUEZA.length)
    ];
  const declaracionEl = document.getElementById("declaracion-del-dia");
  if (declaracionEl) declaracionEl.textContent = declaracionAleatoria;
}

// ==================== RELOJ CHILE ====================

function actualizarRelojChile() {
  const ahora = new Date();

  // Reloj con zona horaria de Chile
  const horaChile = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Santiago",
  }).format(ahora);

  // Fecha con zona horaria de Chile
  const fechaChile = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(ahora);

  const relojEl = document.getElementById("reloj-chile");
  const fechaEl = document.getElementById("fecha-chile");

  if (relojEl) relojEl.textContent = horaChile;
  if (fechaEl) fechaEl.textContent = fechaChile;
}

function nowChile() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
  );
}

function formatFechaPlanChile(dateObj = nowChile()) {
  try {
    const parts = new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Santiago",
    }).formatToParts(dateObj);

    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    const { weekday, day, month, year } = map;
    if (weekday && day && month && year) {
      const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      return `- ${weekdayCap} ${day} de ${month} del ${year}`;
    }
  } catch (e) {
    // fallback handled below
  }

  const fallback = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(dateObj);

  const fallbackCap = fallback.charAt(0).toUpperCase() + fallback.slice(1);
  return `- ${fallbackCap}`;
}

function actualizarPlanFechaHoy() {
  const fechaEl = document.getElementById("plan-dia-fecha");
  if (!fechaEl) return;
  fechaEl.textContent = formatFechaPlanChile();
}

// ==================== NAVEGACI├ôN ====================

function switchTab(tabName, evt) {
  // Actualizar botones
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const target = evt?.target?.closest?.(".tab-btn");
  if (target) target.classList.add("active");

  // Actualizar contenido
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  const tab = document.getElementById(`tab-${tabName}`);
  if (!tab) {
    const fallback = document.getElementById("tab-dashboard");
    if (fallback) {
      fallback.classList.add("active");
      state.currentTab = "dashboard";
    }
    return;
  }
  tab.classList.add("active");

  state.currentTab = tabName;

  // Cargar datos seg├║n la pesta├▒a
  switch (tabName) {
    case "dashboard":
      cargarDashboard();
      break;
    case "planificacion":
      cargarPlanificacion();
      break;
    case "habitos":
      cargarHabitos();
      cargarHistorialHabitosMes();
      break;
    case "finanzas":
      cargarFinanzas();
      break;
    case "entretenimiento":
      cargarEntretenimiento();
      break;
    case "deudas":
      cargarDeudas();
      break;
    case "agenda":
      cargarAgenda();
      break;
    case "objetivos":
      cargarObjetivos();
      break;
  }
}

// ==================== PLANIFICACIÓN (interactiva local) ====================

const PLAN_STORAGE_KEY = "planificacion_local";
const PLAN_VERSION = 4;
const PLAN_FALLBACK_WEEK_KEY = startOfWeekMonday(nowChile()).toISOString().split("T")[0];

const PLAN_FALLBACK = {
  version: PLAN_VERSION,
  ultimaActualizacion: new Date().toISOString(),
  weekOffset: 0,
  pomodoroConfig: {
    workMin: 25,
    breakMin: 5,
  },
  pomodoroLogs: [],
  roles: [
    {
      id: "rol-profesional",
      nombre: "Profesional/Desarrollador",
      color: "#2563eb",
      objetivos: ["Cerrar entregables clave cada semana"],
    },
    {
      id: "rol-salud",
      nombre: "Salud",
      color: "#16a34a",
      objetivos: ["Mejorar rendimiento futbol"],
    },
    {
      id: "rol-finanzas",
      nombre: "Gestor financiero",
      color: "#f59e0b",
      objetivos: ["Mantener presupuesto y ahorro mensual"],
    },
  ],
  tareas: [
    {
      id: "t-deep-ia",
      rolId: "rol-profesional",
      titulo: "Deep Work: feature IA",
      duracionMin: 90,
      prioridad: "A",
      completada: false,
      objetivo: "Cerrar entregables clave cada semana",
      checklist: [],
    },
    {
      id: "t-break",
      rolId: "rol-salud",
      titulo: "Break + agua",
      duracionMin: 15,
      prioridad: "B",
      completada: false,
      objetivo: "Mejorar rendimiento futbol",
      checklist: [],
    },
    {
      id: "t-reunion",
      rolId: "rol-profesional",
      titulo: "Reunión semanal",
      duracionMin: 60,
      prioridad: "B",
      completada: false,
      objetivo: "Cerrar entregables clave cada semana",
      checklist: [],
    },
    {
      id: "t-backlog",
      rolId: "rol-profesional",
      titulo: "Correo y backlog liviano",
      duracionMin: 45,
      prioridad: "C",
      completada: false,
      objetivo: "Mantener seguimiento de proyectos",
      checklist: [],
    },
  ],
  bloques: [
    { id: "b-0830-1000", start: "08:30", end: "10:00", tareaId: "t-deep-ia", rolId: "rol-profesional", dia: 1, completado: false },
    { id: "b-1000-1015", start: "10:00", end: "10:15", tareaId: "t-break", rolId: "rol-salud", dia: 1, completado: false },
    { id: "b-1030-1130", start: "10:30", end: "11:30", tareaId: "t-reunion", rolId: "rol-profesional", dia: 1, completado: false },
    { id: "b-1200-1245", start: "12:00", end: "12:45", tareaId: "t-backlog", rolId: "rol-profesional", dia: 1, completado: false },
  ],
  bloquesByWeek: {},
};

const PLAN_REMOTE_ENDPOINT = `${API_URL}/api/plan-pro`;
const PLAN_FALLBACK_ROLE_IDS = new Set(
  (PLAN_FALLBACK.roles || []).map((r) => r.id)
);
const PLAN_FALLBACK_TASK_IDS = new Set(
  (PLAN_FALLBACK.tareas || []).map((t) => t.id)
);
let planRemoteSyncPromise = null;
let planRemoteWriteTimer = null;
let planRemoteWriteInFlight = false;
let planRemoteQueued = null;
let planRemoteReady = false;

function normalizePlan(plan) {
  const base = plan && typeof plan === "object" ? plan : {};
  const roles = Array.isArray(base.roles) ? base.roles : PLAN_FALLBACK.roles;
  const tareas = Array.isArray(base.tareas) ? base.tareas : PLAN_FALLBACK.tareas;
  const bloquesLegacy = Array.isArray(base.bloques) ? base.bloques : PLAN_FALLBACK.bloques;
  const rawBloquesByWeek = base.bloquesByWeek && typeof base.bloquesByWeek === "object" ? base.bloquesByWeek : null;
  const pomodoroConfigRaw =
    base.pomodoroConfig && typeof base.pomodoroConfig === "object" ? base.pomodoroConfig : PLAN_FALLBACK.pomodoroConfig || {};
  const pomodoroLogsRaw = Array.isArray(base.pomodoroLogs) ? base.pomodoroLogs : [];
  const fallbackRolesMap = (PLAN_FALLBACK.roles || []).reduce((acc, rol) => {
    acc[rol.id] = rol;
    return acc;
  }, {});

  const normalizeBloquesLista = (bloques, idxOffset = 0) =>
    Array.isArray(bloques)
      ? bloques.map((b, idx) => ({
          id: b.id || `b-${idx + idxOffset}-${Date.now()}`,
          start: b.start || "08:00",
          end: b.end || "09:00",
          tareaId: b.tareaId || tareas[0]?.id || "t-deep-ia",
          rolId: b.rolId || tareas[0]?.rolId || "rol-profesional",
          dia: Number(b.dia) || 1,
          completado: Boolean(b.completado),
        }))
      : [];

  const bloquesByWeek = {};
  if (rawBloquesByWeek) {
    Object.entries(rawBloquesByWeek).forEach(([weekKey, lista = []], idx) => {
      bloquesByWeek[weekKey] = normalizeBloquesLista(lista, idx * 1000);
    });
  } else {
    const weekKey = base.fechaBase || PLAN_FALLBACK_WEEK_KEY;
    bloquesByWeek[weekKey] = normalizeBloquesLista(bloquesLegacy);
  }

  return {
    ...PLAN_FALLBACK,
    ...base,
    version: PLAN_VERSION,
    weekOffset: Number.isFinite(base.weekOffset) ? Number(base.weekOffset) : 0,
    ultimaActualizacion: base.ultimaActualizacion || new Date().toISOString(),
    roles: roles.map((r, idx) => {
      const objetivosFuente = Array.isArray(r.objetivos)
        ? r.objetivos
        : Array.isArray(fallbackRolesMap[r.id]?.objetivos)
        ? fallbackRolesMap[r.id].objetivos
        : [];
      const objetivos = objetivosFuente
        .map((o) => (typeof o === "string" ? o.trim() : String(o || "")))
        .filter(Boolean);
      return {
        id: r.id || `rol-${idx}-${Date.now()}`,
        nombre: r.nombre || "Rol",
        color: r.color || "#2563eb",
        objetivos,
      };
    }),
    tareas: tareas.map((t, idx) => {
      const checklist = Array.isArray(t.checklist)
        ? t.checklist
            .map((c, cidx) => {
              const text = typeof c === "string" ? c : c?.text || c?.titulo || "";
              if (!text) return null;
              return {
                id: c.id || `chk-${idx}-${cidx}-${Date.now()}`,
                text: text,
                done: Boolean(c.done),
              };
            })
            .filter(Boolean)
        : [];
      return {
        id: t.id || `t-${idx}-${Date.now()}`,
        rolId: t.rolId || roles[0]?.id || "rol-profesional",
        titulo: t.titulo || "Tarea",
        duracionMin: t.duracionMin || 60,
        prioridad: t.prioridad || "B",
        completada: Boolean(t.completada),
        objetivo: t.objetivo || "",
        checklist,
        pomodoroNotas: typeof t.pomodoroNotas === "string" ? t.pomodoroNotas : "",
      };
    }),
    bloques: [],
    bloquesByWeek,
    pomodoroConfig: {
      workMin: clampNumber(pomodoroConfigRaw.workMin, 5, 180, 25),
      breakMin: clampNumber(pomodoroConfigRaw.breakMin, 3, 60, 5),
    },
    pomodoroLogs: pomodoroLogsRaw
      .map((log, idx) => {
        const minutos = Number(log?.minutos || log?.minutes || 0);
        return {
          id: log?.id || `pomo-${idx}-${Date.now()}`,
          tareaId: log?.tareaId || log?.tarea_id || "",
          minutos: Number.isFinite(minutos) ? minutos : 0,
          mode: log?.mode || "work",
          startedAt: log?.startedAt || null,
          endedAt: log?.endedAt || null,
          createdAt: log?.createdAt || log?.endedAt || log?.startedAt || new Date().toISOString(),
        };
      })
      .filter((log) => log.tareaId && log.minutos > 0),
  };
}

function parsePlanTimestamp(value) {
  if (!value) return 0;
  const ts = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function planHasCustomItems(plan) {
  const roles = Array.isArray(plan?.roles) ? plan.roles : [];
  const tareas = Array.isArray(plan?.tareas) ? plan.tareas : [];
  if (roles.some((r) => r?.id && !PLAN_FALLBACK_ROLE_IDS.has(r.id))) return true;
  if (tareas.some((t) => t?.id && !PLAN_FALLBACK_TASK_IDS.has(t.id))) return true;
  return false;
}

async function fetchPlanRemote() {
  try {
    const res = await fetch(PLAN_REMOTE_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data || !data.ok) return null;
    return data;
  } catch (_) {
    return null;
  }
}

async function writePlanRemote(plan) {
  if (!plan || planRemoteWriteInFlight) return false;
  planRemoteWriteInFlight = true;
  try {
    const res = await fetch(PLAN_REMOTE_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    const data = await res.json().catch(() => null);
    return !!(res.ok && data && data.ok);
  } catch (_) {
    return false;
  } finally {
    planRemoteWriteInFlight = false;
  }
}

function schedulePlanRemoteSave(plan) {
  planRemoteQueued = plan;
  if (!planRemoteReady) return;
  if (planRemoteWriteTimer) clearTimeout(planRemoteWriteTimer);
  planRemoteWriteTimer = setTimeout(async () => {
    const payload = planRemoteQueued;
    planRemoteQueued = null;
    const ok = await writePlanRemote(payload);
    if (!ok && payload) {
      planRemoteQueued = payload;
    }
    if (planRemoteQueued) schedulePlanRemoteSave(planRemoteQueued);
  }, 600);
}

async function syncPlanWithRemote() {
  const localPlan = planLocal || loadPlanLocal();
  const remoteData = await fetchPlanRemote();
  if (!remoteData) {
    planRemoteReady = true;
    if (planRemoteQueued) schedulePlanRemoteSave(planRemoteQueued);
    return { plan: localPlan, changed: false };
  }

  if (!remoteData.plan) {
    planRemoteReady = true;
    if (localPlan) schedulePlanRemoteSave(localPlan);
    return { plan: localPlan, changed: false };
  }

  const remotePlan = normalizePlan(remoteData.plan);
  const localTs = parsePlanTimestamp(localPlan?.ultimaActualizacion);
  const remoteTs = parsePlanTimestamp(
    remoteData.updated_at || remotePlan.ultimaActualizacion
  );
  const localHasCustom = planHasCustomItems(localPlan);
  const remoteHasCustom = planHasCustomItems(remotePlan);

  if (!remoteHasCustom && localHasCustom) {
    schedulePlanRemoteSave(localPlan);
    planRemoteReady = true;
    if (planRemoteQueued) schedulePlanRemoteSave(planRemoteQueued);
    return { plan: localPlan, changed: false };
  }

  if (remoteTs >= localTs) {
    planLocal = remotePlan;
    savePlanLocal(remotePlan, false, false);
    planRemoteReady = true;
    if (planRemoteQueued) schedulePlanRemoteSave(planRemoteQueued);
    return { plan: remotePlan, changed: true };
  }

  schedulePlanRemoteSave(localPlan);
  planRemoteReady = true;
  if (planRemoteQueued) schedulePlanRemoteSave(planRemoteQueued);
  return { plan: localPlan, changed: false };
}

function ensurePlanSync() {
  if (planRemoteSyncPromise) return planRemoteSyncPromise;
  planRemoteSyncPromise = syncPlanWithRemote().finally(() => {
    planRemoteSyncPromise = null;
  });
  return planRemoteSyncPromise;
}

function loadPlanLocal() {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return normalizePlan(PLAN_FALLBACK);
    return normalizePlan(JSON.parse(raw));
  } catch (_) {
    return normalizePlan(PLAN_FALLBACK);
  }
}

function savePlanLocal(plan, touchDate = true, syncRemote = true) {
  const payload = touchDate
    ? { ...plan, ultimaActualizacion: new Date().toISOString() }
    : { ...plan };
  planLocal = payload;
  localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(payload));
  if (syncRemote) schedulePlanRemoteSave(payload);
}

let planLocal = loadPlanLocal();
let draggingPlanBlockId = null;
let planEventsBound = false;
let planHighlightInterval = null;
let pendingDeleteRoleId = null;
let planBlockMenuBound = false;

const POMODORO_DEFAULTS = {
  workMin: 25,
  breakMin: 5,
};

const pomodoroState = {
  taskId: null,
  mode: "work",
  remainingSec: 0,
  timerId: null,
  sessionStartedAt: null,
};

let pomodoroNotesTimer = null;

function bindPlanificacionUI() {
  if (planEventsBound) return;

  const resetBtn = document.getElementById("plan-reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", resetPlanificacionDemo);

  const addRolBtn = document.getElementById("plan-add-rol-btn");
  if (addRolBtn) {
    addRolBtn.addEventListener("click", () => {
      const form = document.getElementById("form-plan-rol");
      if (form) {
        form.reset();
        const colorInput = form.querySelector('input[name="color"]');
        if (colorInput) colorInput.value = randomColor();
      }
      openModal("modal-plan-rol");
    });
  }

  const backlogChip = document.getElementById("plan-backlog-count");
  if (backlogChip && !document.getElementById("plan-add-tarea-btn")) {
    const header = backlogChip.parentElement;
    if (header) {
      const btn = document.createElement("button");
      btn.id = "plan-add-tarea-btn";
      btn.textContent = "+ Tarea";
      btn.className = "btn-secondary";
      btn.style.padding = "6px 10px";
      btn.addEventListener("click", crearTareaManual);
      header.appendChild(btn);
    }
  }

  const hoyBtn = document.getElementById("plan-db-hoy-btn");
  if (hoyBtn) hoyBtn.addEventListener("click", () => setPlanFechaBase(new Date()));

  const fechaInput = document.getElementById("plan-db-fecha");
  if (fechaInput) {
    fechaInput.addEventListener("change", (e) => {
      if (!e.target.value) return;
      setPlanFechaBase(new Date(e.target.value));
    });
  }

  const todoInput = document.getElementById("plan-todo-input");
  const todoBtn = document.getElementById("plan-todo-add-btn");
  const todoRolSelect = document.getElementById("plan-todo-rol");
  const todoObjSelect = document.getElementById("plan-todo-objetivo");
  const todoOpenBtn = document.getElementById("plan-todo-open-btn");
  if (todoBtn) {
    todoBtn.addEventListener("click", () => addTodoTaskFromInput());
  }
  if (todoInput) {
    todoInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") addTodoTaskFromInput();
    });
  }
  if (todoRolSelect) {
    todoRolSelect.addEventListener("change", () => updateObjetivosSelect());
  }
  if (todoOpenBtn) {
    todoOpenBtn.addEventListener("click", () => openPlanTareaModal());
  }
  const rolForm = document.getElementById("form-plan-rol");
  if (rolForm) {
    rolForm.addEventListener("submit", handlePlanRolSubmit);
  }
  const objetivoForm = document.getElementById("form-plan-objetivo");
  if (objetivoForm) {
    objetivoForm.addEventListener("submit", handlePlanObjetivoSubmit);
  }
  const tareaForm = document.getElementById("form-plan-tarea");
  if (tareaForm) tareaForm.addEventListener("submit", handlePlanTareaSubmit);
  const tareaRolSelect = document.getElementById("plan-tarea-rol");
  if (tareaRolSelect) tareaRolSelect.addEventListener("change", () => updatePlanTareaObjetivos());
  const tareaHoraInicio = document.getElementById("plan-tarea-hora-inicio");
  const tareaHoraFin = document.getElementById("plan-tarea-hora-fin");
  if (tareaHoraInicio && tareaHoraFin) {
    tareaHoraInicio.addEventListener("change", () => {
      const start = tareaHoraInicio.value;
      if (!start) return;
      const startMin = timeToMinutes(start);
      const minEnd = Math.min(startMin + PLAN_SLOT_MIN, PLAN_DAY_END_LIMIT_MIN);
      const currentEndMin = timeToMinutes(tareaHoraFin.value);
      if (!tareaHoraFin.value || currentEndMin <= startMin) {
        tareaHoraFin.value = minutesToTime(minEnd);
      }
    });
  }
  const quickForm = document.getElementById("form-plan-quick-block");
  if (quickForm) quickForm.addEventListener("submit", handleQuickBlockSubmit);
  const prevWeek = document.getElementById("plan-week-prev");
  const nextWeek = document.getElementById("plan-week-next");
  const weekToday = document.getElementById("plan-week-today");
  if (prevWeek) prevWeek.addEventListener("click", () => changePlanWeek(-1));
  if (nextWeek) nextWeek.addEventListener("click", () => changePlanWeek(1));
  if (weekToday) weekToday.addEventListener("click", resetPlanWeek);

  const pomoStart = document.getElementById("pomodoro-start-btn");
  const pomoPause = document.getElementById("pomodoro-pause-btn");
  const pomoReset = document.getElementById("pomodoro-reset-btn");
  const pomoLog = document.getElementById("pomodoro-log-btn");
  const pomoWork = document.getElementById("pomodoro-work-min");
  const pomoBreak = document.getElementById("pomodoro-break-min");
  const pomoNotes = document.getElementById("pomodoro-notes");
  if (pomoStart) pomoStart.addEventListener("click", startPomodoroTimer);
  if (pomoPause) pomoPause.addEventListener("click", pausePomodoroTimer);
  if (pomoReset) pomoReset.addEventListener("click", resetPomodoroTimer);
  if (pomoLog) pomoLog.addEventListener("click", logPomodoroFocus);
  if (pomoWork) pomoWork.addEventListener("change", handlePomodoroConfigChange);
  if (pomoBreak) pomoBreak.addEventListener("change", handlePomodoroConfigChange);
  if (pomoNotes) pomoNotes.addEventListener("input", schedulePomodoroNotesSave);

  if (!planBlockMenuBound) {
    document.addEventListener("click", handlePlanBlockMenuOutside);
    planBlockMenuBound = true;
  }

  planEventsBound = true;
}

function resetPlanificacionDemo() {
  planLocal = normalizePlan(PLAN_FALLBACK);
  savePlanLocal(planLocal);
  cargarPlanificacion();
}

function setPlanFechaBase(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return;
  const input = document.getElementById("plan-db-fecha");
  const iso = dateObj.toISOString().split("T")[0];
  if (input) input.value = iso;
  planLocal.fechaBase = iso;
  savePlanLocal(planLocal);
}

function changePlanWeek(delta) {
  planLocal.weekOffset = Number(planLocal.weekOffset || 0) + Number(delta || 0);
  savePlanLocal(planLocal, false);
  renderPlanAgenda();
  renderPlanResumen();
  renderPlanLegend();
  renderTodoFormOptions();
}

function resetPlanWeek() {
  planLocal.weekOffset = 0;
  savePlanLocal(planLocal, false);
  renderPlanAgenda();
  renderPlanResumen();
  renderPlanLegend();
  renderTodoFormOptions();
}

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [h = "0", m = "0"] = timeStr.split(":");
  return Number(h) * 60 + Number(m);
}

const PLAN_DAY_START_MIN = 8 * 60;
const PLAN_DAY_END_MIN = 21 * 60 + 30;
const PLAN_SLOT_MIN = 30;
const PLAN_DAY_END_LIMIT_MIN = PLAN_DAY_END_MIN + PLAN_SLOT_MIN;

function buildPlanTimeOptions(endLimit = PLAN_DAY_END_MIN) {
  const options = [];
  for (let minutes = PLAN_DAY_START_MIN; minutes <= endLimit; minutes += PLAN_SLOT_MIN) {
    options.push(minutesToTime(minutes));
  }
  return options;
}

function fillPlanHoraSelect(select, selected, allowEmpty = false, endLimit = PLAN_DAY_END_MIN) {
  if (!select) return;
  const options = buildPlanTimeOptions(endLimit);
  const items = [];
  if (allowEmpty) {
    items.push(`<option value="">Seleccionar</option>`);
  }
  items.push(...options.map((time) => `<option value="${time}">${time}</option>`));
  select.innerHTML = items.join("");
  if (selected) {
    select.value = selected;
  }
}

function getDefaultPlanHora() {
  const now = nowChile();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let rounded = Math.ceil(currentMinutes / PLAN_SLOT_MIN) * PLAN_SLOT_MIN;
  if (rounded < PLAN_DAY_START_MIN) rounded = PLAN_DAY_START_MIN;
  if (rounded > PLAN_DAY_END_MIN) rounded = PLAN_DAY_START_MIN;
  return minutesToTime(rounded);
}

function getDefaultPlanHoraFin(start) {
  const startMin = timeToMinutes(start);
  let endMin = startMin + 60;
  if (endMin > PLAN_DAY_END_LIMIT_MIN) endMin = PLAN_DAY_END_LIMIT_MIN;
  if (endMin <= startMin) endMin = Math.min(startMin + PLAN_SLOT_MIN, PLAN_DAY_END_LIMIT_MIN);
  return minutesToTime(endMin);
}

function parsePlanDateInput(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isPlanHoraValida(hora, maxLimit = PLAN_DAY_END_MIN) {
  const minutes = timeToMinutes(hora);
  return minutes % PLAN_SLOT_MIN === 0 && minutes >= PLAN_DAY_START_MIN && minutes <= maxLimit;
}

function diffTimes(start, end) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  return Math.max(0, endMin - startMin);
}

function roundUpToSlot(minutes) {
  return Math.ceil(minutes / PLAN_SLOT_MIN) * PLAN_SLOT_MIN;
}

function getPlanSlotStarts(start, end) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const slots = [];
  for (let minutes = startMin; minutes < endMin; minutes += PLAN_SLOT_MIN) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

function isPlanRangeDisponible(dia, start, end, weekKey = getCurrentWeekKey(), ignoreId = null) {
  const slots = getPlanSlotStarts(start, end);
  return slots.every((slot) => !slotOcupado(dia, slot, ignoreId, weekKey));
}

function buildPlanBlocksForRange({ start, end, tareaId, rolId, dia }) {
  const slots = getPlanSlotStarts(start, end);
  const base = Date.now();
  return slots.map((slot, index) => ({
    id: `b-${base}-${index}`,
    start: slot,
    end: minutesToTime(timeToMinutes(slot) + PLAN_SLOT_MIN),
    tareaId,
    rolId,
    dia,
    completado: false,
  }));
}

function getPlanEndFromDuration(start, durationMin) {
  const startMin = timeToMinutes(start);
  const endMin = roundUpToSlot(startMin + durationMin);
  return minutesToTime(endMin);
}

function getWeekKey(dateObj = new Date()) {
  const start = startOfWeekMonday(dateObj);
  return start.toISOString().split("T")[0];
}

function getCurrentWeekKey() {
  return getWeekKey(getPlanWeekStart());
}

function getBloquesSemana(weekKey = getCurrentWeekKey()) {
  const map = planLocal.bloquesByWeek || {};
  const lista = map[weekKey];
  return Array.isArray(lista) ? lista : [];
}

function setBloquesSemana(weekKey, bloques) {
  planLocal.bloquesByWeek = { ...(planLocal.bloquesByWeek || {}), [weekKey]: bloques };
}

function actualizarBloquesTodasLasSemanas(callback) {
  const map = planLocal.bloquesByWeek || {};
  const nuevo = {};
  Object.entries(map).forEach(([weekKey, lista = []]) => {
    const result = callback(Array.isArray(lista) ? lista : [], weekKey);
    nuevo[weekKey] = Array.isArray(result) ? result : [];
  });
  planLocal.bloquesByWeek = nuevo;
}

function slotOcupado(dia, hora, ignoreId = null, weekKey = getCurrentWeekKey()) {
  const diaNum = Number(dia);
  return getBloquesSemana(weekKey).some((b) => b.dia === diaNum && b.start === hora && b.id !== ignoreId);
}

function minutesToTime(total) {
  const clamped = Math.max(0, Math.min(total, 24 * 60));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function colorWithAlpha(color, alphaHex = "1a") {
  if (typeof color !== "string" || !color.startsWith("#") || (color.length !== 7 && color.length !== 9)) {
    return color || "#cbd5e1";
  }
  const base = color.length === 9 ? color.slice(0, 7) : color;
  return `${base}${alphaHex}`;
}

function getRolColor(rolId) {
  return (planLocal.roles || []).find((r) => r.id === rolId)?.color || "#cbd5e1";
}

function randomColor() {
  const palette = ["#2563eb", "#16a34a", "#f59e0b", "#6366f1", "#db2777", "#0ea5e9", "#10b981", "#f97316"];
  return palette[Math.floor(Math.random() * palette.length)];
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

function startOfWeekMonday(dateObj = new Date()) {
  const d = new Date(dateObj);
  const day = d.getDay(); // 0=Domingo ... 6=Sábado
  const diff = day === 0 ? -6 : 1 - day; // mover a lunes
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

function getPlanWeekStart() {
  const today = nowChile();
  const offsetDays = (Number(planLocal.weekOffset) || 0) * 7;
  const offsetDate = new Date(today);
  offsetDate.setDate(today.getDate() + offsetDays);
  const weekStart = startOfWeekMonday(offsetDate);
  if (planLocal.weekOffset === 0) {
    planLocal.fechaBase = weekStart.toISOString().split("T")[0];
    savePlanLocal(planLocal, false);
  }
  return weekStart;
}

function formatFechaPlan(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString("es-CL");
  return `${date.toLocaleDateString("es-CL")} ${date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`;
}

function cargarPlanificacion() {
  if (!document.getElementById("plan-agenda-grid")) return;
  bindPlanificacionUI();
  renderPlanRoles();
  renderPlanLegend();
  renderPlanAgenda();
  renderPlanTodoList();
  renderPlanPomodoroChart();
  renderTodoFormOptions();
  renderPlanResumen();
  updatePlanFechaBase();
  const updated = document.getElementById("plan-ultima-actualizacion");
  if (updated) updated.textContent = `Actualizado: ${formatFechaPlan(planLocal.ultimaActualizacion)}`;
  startPlanHighlightWatcher();

  ensurePlanSync().then((result) => {
    if (!result || !result.changed) return;
    renderPlanRoles();
    renderPlanLegend();
    renderPlanAgenda();
    renderPlanTodoList();
    renderPlanPomodoroChart();
    renderTodoFormOptions();
    renderPlanResumen();
    updatePlanFechaBase();
    if (updated) {
      updated.textContent = `Actualizado: ${formatFechaPlan(planLocal.ultimaActualizacion)}`;
    }
  });
}

function updatePlanFechaBase() {
  const input = document.getElementById("plan-db-fecha");
  if (input && !input.value) {
    input.value = planLocal.fechaBase || new Date().toISOString().split("T")[0];
  }
}

function renderPlanRoles() {
  const container = document.getElementById("plan-roles");
  const count = document.getElementById("plan-roles-count");
  if (!container) return;
  const roles = planLocal.roles || [];
  if (count) count.textContent = roles.length;
  if (!roles.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Sin roles</div></div>';
    return;
  }
  container.innerHTML = roles
    .map((r) => {
      const tareasDelRol = (planLocal.tareas || []).filter((t) => t.rolId === r.id).length;
          const objetivos = Array.isArray(r.objetivos) ? r.objetivos : [];
          const objetivosHtml = objetivos.length
            ? objetivos
                .map(
                  (obj, idx) => `
                <div class="plan-obj-item" style="border-left: 4px solid ${r.color}; background:${colorWithAlpha(r.color, "12")};">
                  <strong>${obj}</strong>
                  <div class="plan-obj-kpi">Objetivo del rol</div>
                  <div class="plan-role-actions">
                    <button class="plan-role-action-btn plan-icon-btn" title="Editar objetivo" onclick="openPlanObjetivoModal('${r.id}', ${idx})">✏️</button>
                    <button class="plan-role-action-btn" onclick="eliminarObjetivoRol('${r.id}', ${idx})">Quitar</button>
                  </div>
                </div>
              `
            )
            .join("")
        : `
            <div class="plan-obj-item" style="border-style: dashed; color: #475569; border-left: 4px solid ${r.color}; background:${colorWithAlpha(r.color, "08")};">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <span>Agrega el primer objetivo para este rol</span>
                <button class="plan-role-action-btn" onclick="openPlanObjetivoModal('${r.id}')" aria-label="Agregar objetivo">+</button>
              </div>
            </div>
          `;
      return `
        <div class="plan-role-card">
          <div style="display:flex; gap:10px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap;">
            <div class="plan-role-info">
              <span class="plan-role-dot" style="background:${r.color};"></span>
              <div>
                <strong>${r.nombre}</strong>
                <div class="plan-role-meta">${tareasDelRol} tareas${objetivos.length ? " | " + objetivos.length + " objetivos" : ""}</div>
              </div>
            </div>
            <div class="plan-role-actions">
              <button class="plan-role-action-btn" onclick="openPlanObjetivoModal('${r.id}')">+ Objetivo</button>
              <button class="plan-role-action-btn plan-icon-btn" title="Editar rol" aria-label="Editar rol" onclick="openPlanRolModal('${r.id}')">✏️</button>
              <button class="plan-role-action-btn plan-icon-btn plan-icon-btn-danger" aria-label="Eliminar rol" onclick="openDeleteRoleModal('${r.id}')">🗑️</button>
            </div>
          </div>
          <div class="plan-role-objectives">
            ${objetivosHtml}
          </div>
        </div>
      `;
    })
    .join("");
}

function agregarObjetivoRol(rolId) {
  openPlanObjetivoModal(rolId);
}

function eliminarObjetivoRol(rolId, objetivoIndex) {
  const roles = planLocal.roles || [];
  const rol = roles.find((r) => r.id === rolId);
  if (!rol) return;
  const objetivos = Array.isArray(rol.objetivos) ? rol.objetivos : [];
  if (!objetivos[objetivoIndex]) return;
  if (!confirm("Eliminar este objetivo del rol?")) return;
  const nuevos = objetivos.filter((_, idx) => idx !== objetivoIndex);
  planLocal.roles = roles.map((r) => (r.id === rolId ? { ...r, objetivos: nuevos } : r));
  savePlanLocal(planLocal);
  renderPlanRoles();
}

function eliminarRol(rolId) {
  const rol = (planLocal.roles || []).find((r) => r.id === rolId);
  if (!rol) return;
  const tareasEliminar = (planLocal.tareas || []).filter((t) => t.rolId === rolId);
  if (tareasEliminar.some((t) => t.id === pomodoroState.taskId)) {
    pausePomodoroTimer();
    pomodoroState.taskId = null;
  }
  planLocal.roles = (planLocal.roles || []).filter((r) => r.id !== rolId);
  planLocal.tareas = (planLocal.tareas || []).filter((t) => t.rolId !== rolId);
  actualizarBloquesTodasLasSemanas((lista) => lista.filter((b) => b.rolId !== rolId));
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanLegend();
  renderPlanTodoList();
  renderPlanAgenda();
  renderPlanResumen();
  renderTodoFormOptions();
}
function crearTareaManual() {
  const titulo = prompt("Título de la tarea:");
  if (!titulo) return;
  const duracion = Number(prompt("Duración (minutos):", "60")) || 60;
  const prioridad = (prompt("Prioridad (A/B/C):", "B") || "B").toUpperCase();
  const rolPredeterminado = planLocal.roles?.[0];
  const rolNombre = prompt("Rol de la tarea (nombre o id):", rolPredeterminado?.nombre || "") || rolPredeterminado?.nombre;
  const rolEncontrado =
    (planLocal.roles || []).find((r) => r.id === rolNombre || r.nombre?.toLowerCase() === rolNombre?.toLowerCase()) ||
    rolPredeterminado;
  const rolId = rolEncontrado?.id || `rol-${Date.now()}`;
  if (!rolEncontrado) {
    planLocal.roles = [...(planLocal.roles || []), { id: rolId, nombre: rolNombre || "General", color: "#64748b", objetivos: [] }];
  }
  const nuevaTarea = {
    id: `t-${Date.now()}`,
    rolId,
    titulo: titulo.trim(),
    duracionMin: duracion,
    prioridad,
    completada: false,
    checklist: [],
  };
  planLocal.tareas = [...(planLocal.tareas || []), nuevaTarea];
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanLegend();
  renderPlanTodoList();
  renderTodoFormOptions();
}

function renderTodoFormOptions() {
  const rolSelect = document.getElementById("plan-todo-rol");
  const objSelect = document.getElementById("plan-todo-objetivo");
  if (!rolSelect || !objSelect) return;
  const roles = planLocal.roles || [];
  rolSelect.innerHTML = roles
    .map((r, idx) => `<option value="${r.id}" ${idx === 0 ? "selected" : ""}>${r.nombre}</option>`)
    .join("");
  updateObjetivosSelect();
}

function updateObjetivosSelect() {
  const rolSelect = document.getElementById("plan-todo-rol");
  const objSelect = document.getElementById("plan-todo-objetivo");
  if (!rolSelect || !objSelect) return;
  const rolId = rolSelect.value;
  const rol = (planLocal.roles || []).find((r) => r.id === rolId);
  const objetivos = Array.isArray(rol?.objetivos) ? rol.objetivos : [];
  objSelect.innerHTML =
    `<option value="ninguno">Sin objetivo</option>` +
    objetivos.map((o) => `<option value="${o}">${o}</option>`).join("");
  objSelect.value = "ninguno";
}

function handlePlanRolSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const nombre = (fd.get("nombre") || "").toString().trim();
  if (!nombre) {
    alert("El nombre del rol es obligatorio");
    return;
  }
  const color = (fd.get("color") || "#2563eb").toString();
  const objetivo = (fd.get("objetivo") || "").toString().trim();
  const rolId = (fd.get("rol_id") || "").toString();
  const modoEdicion = form.dataset.editing === "true" || Boolean(rolId);
  if (modoEdicion) {
    planLocal.roles = (planLocal.roles || []).map((r) =>
      r.id === rolId ? { ...r, nombre, color, objetivos: objetivo ? [objetivo] : r.objetivos || [] } : r
    );
  } else {
    const nuevoRol = {
      id: rolId || `rol-${Date.now()}`,
      nombre,
      color,
      objetivos: objetivo ? [objetivo] : [],
    };
    planLocal.roles = [...(planLocal.roles || []), nuevoRol];
  }
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanLegend();
  renderTodoFormOptions();
  closeModal("modal-plan-rol");
  form.reset();
  form.dataset.editing = "false";
}

function openPlanObjetivoModal(rolId, objetivoIndex = null) {
  const form = document.getElementById("form-plan-objetivo");
  if (form) {
    form.reset();
    const rolInput = form.querySelector('input[name="rol_id"]');
    const rolDefault = rolId || planLocal.roles?.[0]?.id || "";
    if (rolInput) rolInput.value = rolDefault;
    const idxInput = form.querySelector('input[name="objetivo_index"]');
    if (idxInput) idxInput.value = objetivoIndex !== null && objetivoIndex !== undefined ? objetivoIndex : "";
    const titleInput = form.querySelector('input[name="titulo"]');
    const kpiInput = form.querySelector('input[name="kpi"]');
    const tituloEl = document.getElementById("plan-objetivo-modal-title");
    if (tituloEl) tituloEl.textContent = objetivoIndex !== null ? "Editar objetivo" : "Nuevo objetivo";
    if (objetivoIndex !== null) {
      const rol = (planLocal.roles || []).find((r) => r.id === rolDefault);
      const objetivos = Array.isArray(rol?.objetivos) ? rol.objetivos : [];
      const texto = objetivos[objetivoIndex] || "";
      if (titleInput) titleInput.value = texto;
      if (kpiInput) kpiInput.value = "";
    }
  }
  openModal("modal-plan-objetivo");
}

function handlePlanObjetivoSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  let rolId = (fd.get("rol_id") || "").toString();
  const objetivoIndexRaw = fd.get("objetivo_index");
  const objetivoIndex = objetivoIndexRaw !== null && objetivoIndexRaw !== "" ? Number(objetivoIndexRaw) : null;
  const titulo = (fd.get("titulo") || "").toString().trim();
  const kpi = (fd.get("kpi") || "").toString().trim();
  if (!titulo) {
    alert("El objetivo necesita un título");
    return;
  }
  const roles = planLocal.roles || [];
  if (!rolId && roles[0]) rolId = roles[0].id;
  const rol = roles.find((r) => r.id === rolId);
  let rolDestino = rol;
  if (!rolDestino) {
    const nuevo = { id: rolId || `rol-${Date.now()}`, nombre: rolId || "General", color: randomColor(), objetivos: [] };
    planLocal.roles = [...roles, nuevo];
    rolDestino = nuevo;
  }
  const texto = kpi ? `${titulo} — ${kpi}` : titulo;
  const objetivos = Array.isArray(rolDestino.objetivos) ? rolDestino.objetivos : [];
  let nuevosObjetivos;
  if (objetivoIndex !== null && objetivoIndex >= 0 && objetivoIndex < objetivos.length) {
    nuevosObjetivos = objetivos.map((o, idx) => (idx === objetivoIndex ? texto : o));
  } else {
    nuevosObjetivos = [...objetivos, texto];
  }
  const actualizado = { ...rolDestino, objetivos: nuevosObjetivos };
  planLocal.roles = (planLocal.roles || []).map((r) => (r.id === actualizado.id ? actualizado : r));
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanLegend();
  renderPlanTodoList();
  renderTodoFormOptions();
  closeModal("modal-plan-objetivo");
  form.reset();
}

function openDeleteRoleModal(rolId) {
  pendingDeleteRoleId = rolId;
  const nameEl = document.getElementById("plan-delete-role-name");
  const rol = (planLocal.roles || []).find((r) => r.id === rolId);
  if (nameEl) nameEl.textContent = rol?.nombre || "este rol";
  openModal("modal-plan-delete-rol");
}

function confirmDeleteRole() {
  if (!pendingDeleteRoleId) {
    closeModal("modal-plan-delete-rol");
    return;
  }
  eliminarRol(pendingDeleteRoleId);
  pendingDeleteRoleId = null;
  closeModal("modal-plan-delete-rol");
}

function openPlanRolModal(rolId) {
  const form = document.getElementById("form-plan-rol");
  if (!form) return;
  const rol = (planLocal.roles || []).find((r) => r.id === rolId);
  form.reset();
  form.dataset.editing = rol ? "true" : "false";
  const idInput = form.querySelector('input[name="rol_id"]');
  const nombreInput = form.querySelector('input[name="nombre"]');
  const colorInput = form.querySelector('input[name="color"]');
  const objetivoInput = form.querySelector('input[name="objetivo"]');
  if (rol) {
    if (idInput) idInput.value = rol.id;
    if (nombreInput) nombreInput.value = rol.nombre || "";
    if (colorInput) colorInput.value = rol.color || "#2563eb";
    if (objetivoInput) objetivoInput.value = (rol.objetivos && rol.objetivos[0]) || "";
    const title = document.getElementById("plan-rol-modal-title");
    if (title) title.textContent = "Editar rol";
  } else {
    if (idInput) idInput.value = "";
    if (colorInput) colorInput.value = randomColor();
    const title = document.getElementById("plan-rol-modal-title");
    if (title) title.textContent = "Nuevo rol";
  }
  openModal("modal-plan-rol");
}

function openPlanTareaModal(tarea) {
  const form = document.getElementById("form-plan-tarea");
  if (!form) return;
  form.reset();
  const fechaInput = document.getElementById("plan-tarea-fecha");
  const horaInicioSelect = document.getElementById("plan-tarea-hora-inicio");
  const horaFinSelect = document.getElementById("plan-tarea-hora-fin");
  const roles = planLocal.roles || [];
  const rolSelect = document.getElementById("plan-tarea-rol");
  const objSelect = document.getElementById("plan-tarea-objetivo");
  renderPlanTareaRolOptions();
  if (tarea) {
    const title = document.getElementById("plan-tarea-modal-title");
    if (title) title.textContent = "Editar tarea";
    const tareaIdInput = form.querySelector('input[name="tarea_id"]');
    if (tareaIdInput) tareaIdInput.value = tarea.id;
    if (rolSelect) rolSelect.value = tarea.rolId || roles[0]?.id || "";
    updatePlanTareaObjetivos();
    if (objSelect) objSelect.value = tarea.objetivo || "";
    const tituloInput = form.querySelector('input[name="titulo"]');
    if (tituloInput) tituloInput.value = tarea.titulo || "";
    if (fechaInput) {
      fechaInput.value = "";
      fechaInput.required = false;
    }
    fillPlanHoraSelect(horaInicioSelect, "", true);
    fillPlanHoraSelect(horaFinSelect, "", true, PLAN_DAY_END_LIMIT_MIN);
    if (horaInicioSelect) {
      horaInicioSelect.value = "";
      horaInicioSelect.required = false;
    }
    if (horaFinSelect) {
      horaFinSelect.value = "";
      horaFinSelect.required = false;
    }
  } else {
    const title = document.getElementById("plan-tarea-modal-title");
    if (title) title.textContent = "Nueva tarea";
    if (rolSelect) rolSelect.value = roles[0]?.id || "";
    updatePlanTareaObjetivos();
    const tareaIdInput = form.querySelector('input[name="tarea_id"]');
    if (tareaIdInput) tareaIdInput.value = "";
    if (fechaInput) {
      fechaInput.value = nowChile().toISOString().split("T")[0];
      fechaInput.required = true;
    }
    const defaultInicio = getDefaultPlanHora();
    const defaultFin = getDefaultPlanHoraFin(defaultInicio);
    fillPlanHoraSelect(horaInicioSelect, defaultInicio, false);
    fillPlanHoraSelect(horaFinSelect, defaultFin, false, PLAN_DAY_END_LIMIT_MIN);
    if (horaInicioSelect) horaInicioSelect.required = true;
    if (horaFinSelect) horaFinSelect.required = true;
  }
  openModal("modal-plan-tarea");
}

function renderPlanTareaRolOptions() {
  const rolSelect = document.getElementById("plan-tarea-rol");
  if (!rolSelect) return;
  const roles = planLocal.roles || [];
  rolSelect.innerHTML = roles.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join("");
}

function updatePlanTareaObjetivos() {
  const rolSelect = document.getElementById("plan-tarea-rol");
  const objSelect = document.getElementById("plan-tarea-objetivo");
  if (!rolSelect || !objSelect) return;
  const rol = (planLocal.roles || []).find((r) => r.id === rolSelect.value);
  const objetivos = Array.isArray(rol?.objetivos) ? rol.objetivos : [];
  objSelect.innerHTML = `<option value="">Sin objetivo</option>` + objetivos.map((o) => `<option value="${o}">${o}</option>`).join("");
}

function handlePlanTareaSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const tareaId = (fd.get("tarea_id") || "").toString();
  const titulo = (fd.get("titulo") || "").toString().trim();
  if (!titulo) {
    alert("La tarea necesita un titulo");
    return;
  }
  const tareaExistente = tareaId ? (planLocal.tareas || []).find((t) => t.id === tareaId) : null;
  let rolId = (fd.get("rol_id") || "").toString();
  const objetivo = (fd.get("objetivo_id") || "").toString();
  const fechaPlan = (fd.get("fecha_plan") || "").toString();
  const horaInicio = (fd.get("hora_inicio_plan") || "").toString();
  const horaFin = (fd.get("hora_fin_plan") || "").toString();
  const duracion = horaInicio && horaFin ? diffTimes(horaInicio, horaFin) : tareaExistente?.duracionMin || 60;
  const isNueva = !tareaId;
  if (isNueva && (!fechaPlan || !horaInicio || !horaFin)) {
    alert("Selecciona fecha y horario para agendar.");
    return;
  }
  if (fechaPlan || horaInicio || horaFin) {
    if (!fechaPlan || !horaInicio || !horaFin) {
      alert("Completa fecha y horario para agendar.");
      return;
    }
    if (!isPlanHoraValida(horaInicio)) {
      alert("La hora de inicio debe ser en bloques de 30 min.");
      return;
    }
    if (!isPlanHoraValida(horaFin, PLAN_DAY_END_LIMIT_MIN)) {
      alert("La hora de termino debe ser en bloques de 30 min.");
      return;
    }
    if (timeToMinutes(horaFin) <= timeToMinutes(horaInicio)) {
      alert("La hora de termino debe ser mayor que la hora de inicio.");
      return;
    }
    if (diffTimes(horaInicio, horaFin) % PLAN_SLOT_MIN !== 0) {
      alert("El horario debe estar en bloques de 30 min.");
      return;
    }
    const dateObj = parsePlanDateInput(fechaPlan);
    if (!dateObj) {
      alert("Fecha invalida.");
      return;
    }
    const diaAgenda = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
    const weekKeyAgenda = getWeekKey(dateObj);
    if (!isPlanRangeDisponible(diaAgenda, horaInicio, horaFin, weekKeyAgenda)) {
      alert("Ya existe un bloque en el horario seleccionado.");
      return;
    }
  }
  if (!rolId) {
    const rolDefault = planLocal.roles?.[0];
    if (rolDefault) {
      rolId = rolDefault.id;
    } else {
      const nuevoRol = { id: `rol-${Date.now()}`, nombre: "General", color: "#64748b", objetivos: [] };
      planLocal.roles = [...(planLocal.roles || []), nuevoRol];
      rolId = nuevoRol.id;
    }
  }
  const tareaIdFinal = tareaId || `t-${Date.now()}`;
  if (tareaId) {
    planLocal.tareas = (planLocal.tareas || []).map((t) =>
      t.id === tareaId ? { ...t, titulo, rolId: rolId || t.rolId, objetivo, duracionMin: duracion } : t
    );
  } else {
    const nueva = {
      id: tareaIdFinal,
      rolId,
      titulo,
      duracionMin: duracion,
      completada: false,
      objetivo,
      checklist: [],
    };
    planLocal.tareas = [...(planLocal.tareas || []), nueva];
  }
  if (fechaPlan && horaInicio && horaFin) {
    const dateObj = parsePlanDateInput(fechaPlan);
    const diaAgenda = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
    const weekKeyAgenda = getWeekKey(dateObj);
    const nuevosBloques = [
      ...getBloquesSemana(weekKeyAgenda),
      ...buildPlanBlocksForRange({
        start: horaInicio,
        end: horaFin,
        tareaId: tareaIdFinal,
        rolId,
        dia: diaAgenda,
      }),
    ];
    setBloquesSemana(weekKeyAgenda, nuevosBloques);
  }
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanTodoList();
  renderPlanLegend();
  renderPlanResumen();
  renderPlanAgenda();
  closeModal("modal-plan-tarea");
  form.reset();
}

function handlePlanTaskDrag(evt, tareaId) {
  const tarea = (planLocal.tareas || []).find((t) => t.id === tareaId);
  if (!tarea || tarea.completada) return;
  evt.dataTransfer.setData("text/plain", tareaId);
}

function renderPlanLegend() {
  const legend = document.getElementById("plan-legend");
  if (!legend) return;
  const roles = planLocal.roles || [];
  if (!roles.length) {
    legend.innerHTML = '<span class="plan-chip">Agrega roles para la agenda</span>';
    return;
  }
  legend.innerHTML = roles
    .map(
      (r) => `
        <span class="plan-legend-item">
          <span class="plan-legend-dot" style="background:${r.color};"></span>
          ${r.nombre}
        </span>
      `
    )
    .join("");
}

function renderPlanAgenda() {
  const grid = document.getElementById("plan-agenda-grid");
  if (!grid) return;
  const horas = [];
  for (let h = 8; h <= 21; h++) {
    horas.push(`${String(h).padStart(2, "0")}:00`);
  }
  const weekStart = getPlanWeekStart();
  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const dias = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    return {
      name: dayNames[idx],
      date: String(date.getDate()).padStart(2, "0"),
      diaIndex: idx + 1,
    };
  });
  const tareasMap = (planLocal.tareas || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});
  const rolesMap = (planLocal.roles || []).reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});
  const weekKey = getCurrentWeekKey();
  const bloques = getBloquesSemana(weekKey);
  const isCurrentWeek = getWeekKey(nowChile()) === weekKey;
  const ahora = nowChile();
  const diaActual = ahora.getDay() === 0 ? 7 : ahora.getDay();
  const minutoActual = ahora.getHours() * 60 + ahora.getMinutes();

  let html = '<table class="plan-week-grid"><thead><tr><th>Hora</th>';
  dias.forEach((d) => {
    html += `<th><div class="plan-day-label"><span class="plan-day-name">${d.name}</span><span class="plan-day-date">${d.date}</span></div></th>`;
  });
  html += "</tr></thead><tbody>";

  horas.forEach((hora) => {
    const horaMinutos = timeToMinutes(hora);
    const slotTimes = [minutesToTime(horaMinutos), minutesToTime(horaMinutos + 30)];
    html += `<tr><th class="plan-week-hour">${hora}</th>`;
    for (let dia = 1; dia <= 7; dia++) {
      html += `<td class="plan-cell-with-slots" data-dia="${dia}" data-hora="${hora}">`;
      slotTimes.forEach((slotTime, idx) => {
        const slotBlocks = bloques.filter((b) => {
          if (b.dia !== dia) return false;
          const startMin = timeToMinutes(b.start);
          const slotStart = timeToMinutes(slotTime);
          const slotEnd = slotStart + 30;
          return startMin >= slotStart && startMin < slotEnd;
        });
        const slotStateClass = slotBlocks.length ? "plan-slot-filled" : "plan-slot-empty";
        const halfClass = idx === 1 ? "plan-slot-second" : "plan-slot-first";
        const esSlotActual =
          isCurrentWeek &&
          dia === diaActual &&
          minutoActual >= timeToMinutes(slotTime) &&
          minutoActual < timeToMinutes(slotTime) + 30;
        const currentClass = esSlotActual ? "plan-slot-current" : "";
        html += `<div class="plan-slot ${slotStateClass} ${halfClass} ${currentClass}" data-dia="${dia}" data-hora="${slotTime}" ondragover="allowPlanDrop(event)" ondrop="handlePlanDrop(event)" onclick="openPlanQuickBlock('${dia}','${slotTime}')">`;
        html += `<div class="plan-slot-time">${slotTime}</div>`;
        if (!slotBlocks.length) {
          html += `<div class="plan-slot-placeholder">+</div>`;
        } else {
          slotBlocks.forEach((block) => {
            const tarea = tareasMap[block.tareaId] || {};
            const rol = rolesMap[block.rolId] || {};
            const rolColor = rol.color || "#cbd5e1";
            const blockEnd = block.end || minutesToTime(timeToMinutes(block.start) + (tarea.duracionMin || 60));
            html += `
            <div class="plan-block ${block.completado ? "plan-block-done" : ""}" style="border-left: 4px solid ${rolColor}; background:${colorWithAlpha(rolColor, "12")};" draggable="true" onclick="event.stopPropagation();" ondragstart="handlePlanBlockDragStart(event, '${block.id}')" ondragend="handlePlanBlockDragEnd(event)">
              <button class="plan-block-close" aria-label="Eliminar bloque" onclick="event.stopPropagation(); eliminarBloque('${block.id}')">&times;</button>
              <button class="plan-block-menu-btn" aria-label="Opciones" onclick="event.stopPropagation(); togglePlanBlockMenu('${block.id}')">⋯</button>
              <div class="plan-block-menu" id="plan-block-menu-${block.id}">
                <button class="plan-block-menu-item" onclick="event.stopPropagation(); openPomodoroForTask('${block.tareaId}');">▶ Pomodoro</button>
              </div>
              <strong>${tarea.titulo || "Bloque"}</strong>
            </div>
          `;
          });
        }
        html += `</div>`;
      });
      html += `</td>`;
    }
    html += "</tr>";
  });
  html += "</tbody></table>";
  grid.innerHTML = html;
  highlightCurrentAgendaSlot();
}

function highlightCurrentAgendaSlot() {
  const grid = document.getElementById("plan-agenda-grid");
  if (!grid) return;
  grid.querySelectorAll(".plan-slot-current").forEach((el) => el.classList.remove("plan-slot-current"));
  const viewWeekKey = getCurrentWeekKey();
  const nowWeekKey = getWeekKey(nowChile());
  if (viewWeekKey !== nowWeekKey) return;
  const now = nowChile();
  const dia = now.getDay() === 0 ? 7 : now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const slotStart = minutesToTime(Math.floor(mins / 30) * 30);
  const slot = grid.querySelector(`.plan-slot[data-dia="${dia}"][data-hora="${slotStart}"]`);
  if (slot) {
    slot.classList.add("plan-slot-current");
  }
}

function startPlanHighlightWatcher() {
  if (planHighlightInterval) return;
  planHighlightInterval = setInterval(highlightCurrentAgendaSlot, 60000);
}

function allowPlanDrop(evt) {
  evt.preventDefault();
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = draggingPlanBlockId && !(evt.ctrlKey || evt.metaKey) ? "move" : "copy";
  }
  autoScrollOnDrag(evt);
}

function handlePlanTodoDrop(evt) {
  evt.preventDefault();
  const payload = evt.dataTransfer.getData("text/plain");
  if (!payload) return;
  if (payload.startsWith("block:")) {
    const blockId = payload.replace("block:", "");
    const weekKey = getCurrentWeekKey();
    const nuevosBloques = getBloquesSemana(weekKey).filter((b) => b.id !== blockId);
    setBloquesSemana(weekKey, nuevosBloques);
    savePlanLocal(planLocal);
    renderPlanAgenda();
    renderPlanResumen();
    return;
  }
}

function filtrarQuickTareasPorRol(rolId) {
  const select = document.getElementById("plan-quick-tarea");
  if (!select) return;
  const tareasFiltradas = (planLocal.tareas || []).filter((t) => !rolId || t.rolId === rolId);
  select.innerHTML = tareasFiltradas.length
    ? tareasFiltradas.map((t) => `<option value="${t.id}">${t.titulo}</option>`).join("")
    : `<option value="">No hay tareas para este rol</option>`;
  if (!tareasFiltradas.length) {
    select.value = "";
  }
}

function openPlanQuickBlock(dia, hora) {
  const form = document.getElementById("form-plan-quick-block");
  if (!form) return;
  const diaInput = form.querySelector('input[name="dia"]');
  const horaInput = form.querySelector('input[name="hora"]');
  if (diaInput) diaInput.value = dia;
  if (horaInput) horaInput.value = hora;
  const roles = planLocal.roles || [];
  const rolSelect = document.getElementById("plan-quick-rol");
  if (rolSelect) {
    rolSelect.innerHTML = roles.length
      ? roles.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join("")
      : `<option value="">No hay roles</option>`;
    const rolDefault = roles[0]?.id || "";
    rolSelect.value = rolDefault;
    filtrarQuickTareasPorRol(rolDefault);
  } else {
    filtrarQuickTareasPorRol("");
  }
  const select = document.getElementById("plan-quick-tarea");
  if (select && !select.innerHTML) {
    select.innerHTML = `<option value="">No hay tareas disponibles</option>`;
  }
  openModal("modal-plan-quick-block");
}

function handleQuickBlockSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const dia = Number(fd.get("dia")) || 1;
  const hora = fd.get("hora");
  const tareaId = fd.get("tarea_id");
  const tarea = (planLocal.tareas || []).find((t) => t.id === tareaId);
  if (!tarea || !hora) {
    alert("Selecciona una tarea válida");
    return;
  }
  const weekKey = getCurrentWeekKey();
  const end = getPlanEndFromDuration(hora, tarea.duracionMin || 60);
  if (!isPlanRangeDisponible(dia, hora, end, weekKey)) {
    alert("Ya existe un bloque en el horario seleccionado.");
    return;
  }
  const nuevosBloques = [
    ...getBloquesSemana(weekKey),
    ...buildPlanBlocksForRange({
      start: hora,
      end,
      tareaId,
      rolId: tarea.rolId,
      dia,
    }),
  ];
  setBloquesSemana(weekKey, nuevosBloques);
  savePlanLocal(planLocal);
  closeModal("modal-plan-quick-block");
  renderPlanAgenda();
  renderPlanResumen();
}

function addTodoTaskFromInput() {
  const input = document.getElementById("plan-todo-input");
  const rolSelect = document.getElementById("plan-todo-rol");
  const objSelect = document.getElementById("plan-todo-objetivo");
  if (!input) return;
  const titulo = input.value.trim();
  if (!titulo) return;
  const rolSeleccionado =
    (planLocal.roles || []).find((r) => r.id === rolSelect?.value) || planLocal.roles?.[0] || null;
  const rolId = rolSeleccionado?.id || `rol-${Date.now()}`;
  if (!rolSeleccionado) {
    planLocal.roles = [...(planLocal.roles || []), { id: rolId, nombre: "General", color: "#64748b", objetivos: [] }];
  }
  const objetivo = objSelect?.value && objSelect.value !== "ninguno" ? objSelect.value : "";
  const nuevaTarea = {
    id: `t-${Date.now()}`,
    rolId,
    titulo,
    duracionMin: 60,
    prioridad: "B",
    completada: false,
    objetivo,
    checklist: [],
  };
  planLocal.tareas = [nuevaTarea, ...(planLocal.tareas || [])];
  savePlanLocal(planLocal);
  input.value = "";
  renderPlanRoles();
  renderPlanTodoList();
  renderPlanResumen();
}

function renderPlanTodoList() {
  const container = document.getElementById("plan-todo-list");
  if (!container) return;
  const tareas = planLocal.tareas || [];
  if (!tareas.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Sin tareas. Agrega la primera arriba.</div></div>';
    return;
  }
  const rolesMap = (planLocal.roles || []).reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});
  const sorted = [...tareas].sort((a, b) => Number(a.completada) - Number(b.completada));
  container.innerHTML = sorted
    .map((t) => {
      const rol = rolesMap[t.rolId] || {};
      const color = rol.color || "#cbd5e1";
      const checklist = Array.isArray(t.checklist) ? t.checklist : [];
      const objetivoLabel = t.objetivo ? `<span class="plan-chip" style="background:${colorWithAlpha(color, "12")}; border:1px solid ${colorWithAlpha(color, "44")}; color:${rol.color || "#0f172a"};">🎯 ${t.objetivo}</span>` : "";
      const checklistHtml = checklist.length
        ? `<div class="plan-checklist">
            ${checklist
              .map(
                (c) => `
                  <label class="plan-check-item">
                    <input type="checkbox" ${c.done ? "checked" : ""} onchange="toggleChecklistItem('${t.id}', '${c.id}', this.checked)">
                    <span class="${c.done ? "plan-check-done" : ""}">${c.text}</span>
                    <button class="plan-check-del" onclick="deleteChecklistItem('${t.id}', '${c.id}')">×</button>
                  </label>
                `
              )
              .join("")}
          </div>`
        : "";
      return `
        <div class="plan-todo-item ${t.completada ? "plan-todo-done" : ""}" draggable="true" ondragstart="handlePlanTaskDrag(event, '${t.id}')" style="border-left: 4px solid ${color}; background:${colorWithAlpha(color, "0f")};">
          <div class="plan-todo-left">
            <input type="checkbox" ${t.completada ? "checked" : ""} onchange="toggleTareaCompletada('${t.id}', this.checked)">
            <div>
              <div class="plan-todo-title">${t.titulo}</div>
              <div class="plan-todo-meta">
                <span class="plan-chip" style="background:${colorWithAlpha(color, "2a")}; color:${color}; border:1px solid ${color};">${rol.nombre || "Sin rol"}</span>
                <span class="plan-chip" style="background:#f8fafc; border:1px solid #e5e7eb;">${t.duracionMin || 60} min</span>
                ${objetivoLabel}
              </div>
              ${checklistHtml}
            </div>
          </div>
          <div class="plan-todo-actions">
            <button class="plan-role-action-btn plan-icon-btn" title="Editar" onclick="editTodoTask('${t.id}')">✏️</button>
            <button class="plan-role-action-btn plan-icon-btn plan-icon-btn-danger" title="Eliminar" onclick="eliminarTarea('${t.id}'); renderPlanTodoList();">🗑️</button>
          </div>
        </div>
      `;
    })
    .join("");
  renderPlanPomodoroChart();
}

function togglePlanBlockMenu(blockId) {
  const menuId = `plan-block-menu-${blockId}`;
  const menu = document.getElementById(menuId);
  if (!menu) return;
  const isOpen = menu.classList.contains("active");
  closePlanBlockMenus(blockId);
  if (!isOpen) menu.classList.add("active");
}

function closePlanBlockMenus(exceptBlockId = "") {
  document.querySelectorAll(".plan-block-menu.active").forEach((menu) => {
    if (exceptBlockId && menu.id === `plan-block-menu-${exceptBlockId}`) return;
    menu.classList.remove("active");
  });
}

function handlePlanBlockMenuOutside(event) {
  if (event.target.closest(".plan-block-menu")) return;
  if (event.target.closest(".plan-block-menu-btn")) return;
  closePlanBlockMenus();
}

function getPomodoroConfig() {
  const config = planLocal.pomodoroConfig || {};
  return {
    workMin: clampNumber(config.workMin, 5, 180, POMODORO_DEFAULTS.workMin),
    breakMin: clampNumber(config.breakMin, 3, 60, POMODORO_DEFAULTS.breakMin),
  };
}

function setPomodoroConfig(nextConfig) {
  planLocal.pomodoroConfig = { ...nextConfig };
  savePlanLocal(planLocal, false);
}

function getPomodoroModeMinutes(mode) {
  const config = getPomodoroConfig();
  return mode === "break" ? config.breakMin : config.workMin;
}

function openPomodoroForTask(tareaId) {
  const tarea = (planLocal.tareas || []).find((t) => t.id === tareaId);
  if (!tarea) return;
  closePlanBlockMenus();
  if (pomodoroState.taskId !== tareaId) {
    pausePomodoroTimer();
    pomodoroState.taskId = tareaId;
    pomodoroState.mode = "work";
    pomodoroState.remainingSec = getPomodoroModeMinutes("work") * 60;
    pomodoroState.sessionStartedAt = null;
  } else if (!pomodoroState.remainingSec) {
    pomodoroState.remainingSec = getPomodoroModeMinutes(pomodoroState.mode) * 60;
  }
  const title = document.getElementById("pomodoro-task-title");
  if (title) title.textContent = tarea.titulo || "Pomodoro";
  const notes = document.getElementById("pomodoro-notes");
  if (notes) notes.value = tarea.pomodoroNotas || "";
  const config = getPomodoroConfig();
  const workInput = document.getElementById("pomodoro-work-min");
  const breakInput = document.getElementById("pomodoro-break-min");
  if (workInput) workInput.value = config.workMin;
  if (breakInput) breakInput.value = config.breakMin;
  updatePomodoroUI();
  openModal("modal-plan-pomodoro");
}

function handlePomodoroConfigChange() {
  const workInput = document.getElementById("pomodoro-work-min");
  const breakInput = document.getElementById("pomodoro-break-min");
  const workMin = clampNumber(workInput?.value, 5, 180, POMODORO_DEFAULTS.workMin);
  const breakMin = clampNumber(breakInput?.value, 3, 60, POMODORO_DEFAULTS.breakMin);
  if (workInput) workInput.value = workMin;
  if (breakInput) breakInput.value = breakMin;
  setPomodoroConfig({ workMin, breakMin });
  if (!pomodoroState.timerId) {
    pomodoroState.remainingSec = getPomodoroModeMinutes(pomodoroState.mode || "work") * 60;
    updatePomodoroUI();
  }
}

function startPomodoroTimer() {
  if (!pomodoroState.taskId || pomodoroState.timerId) return;
  if (!pomodoroState.remainingSec) {
    pomodoroState.remainingSec = getPomodoroModeMinutes(pomodoroState.mode || "work") * 60;
  }
  pomodoroState.sessionStartedAt = pomodoroState.sessionStartedAt || new Date().toISOString();
  pomodoroState.timerId = setInterval(tickPomodoro, 1000);
  updatePomodoroControls();
}

function pausePomodoroTimer() {
  if (!pomodoroState.timerId) return;
  clearInterval(pomodoroState.timerId);
  pomodoroState.timerId = null;
  updatePomodoroControls();
}

function resetPomodoroTimer() {
  pausePomodoroTimer();
  pomodoroState.remainingSec = getPomodoroModeMinutes(pomodoroState.mode || "work") * 60;
  pomodoroState.sessionStartedAt = null;
  updatePomodoroUI();
}

function tickPomodoro() {
  pomodoroState.remainingSec = Math.max(0, Number(pomodoroState.remainingSec) - 1);
  updatePomodoroUI();
  if (pomodoroState.remainingSec <= 0) {
    completePomodoroSession();
  }
}

function completePomodoroSession() {
  pausePomodoroTimer();
  if (pomodoroState.mode === "work") {
    const config = getPomodoroConfig();
    addPomodoroLog(
      pomodoroState.taskId,
      config.workMin,
      "work",
      pomodoroState.sessionStartedAt,
      new Date().toISOString()
    );
  }
  pomodoroState.mode = pomodoroState.mode === "work" ? "break" : "work";
  pomodoroState.remainingSec = getPomodoroModeMinutes(pomodoroState.mode) * 60;
  pomodoroState.sessionStartedAt = null;
  updatePomodoroUI();
}

function logPomodoroFocus() {
  if (!pomodoroState.taskId) return;
  if (pomodoroState.mode !== "work") {
    alert("Solo puedes registrar foco en modo trabajo.");
    return;
  }
  const config = getPomodoroConfig();
  const elapsedSec = config.workMin * 60 - pomodoroState.remainingSec;
  if (elapsedSec < 60) {
    alert("Aun no hay tiempo suficiente para registrar.");
    return;
  }
  pausePomodoroTimer();
  const minutes = Math.max(1, Math.round(elapsedSec / 60));
  addPomodoroLog(
    pomodoroState.taskId,
    minutes,
    "manual",
    pomodoroState.sessionStartedAt || new Date().toISOString(),
    new Date().toISOString()
  );
  pomodoroState.remainingSec = getPomodoroModeMinutes("work") * 60;
  pomodoroState.sessionStartedAt = null;
  updatePomodoroUI();
}

function addPomodoroLog(tareaId, minutes, mode, startedAt, endedAt) {
  if (!tareaId || !minutes) return;
  const log = {
    id: `pomo-${Date.now()}`,
    tareaId,
    minutos: Math.max(1, Math.round(minutes)),
    mode: mode || "work",
    startedAt: startedAt || new Date().toISOString(),
    endedAt: endedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  planLocal.pomodoroLogs = [...(planLocal.pomodoroLogs || []), log];
  savePlanLocal(planLocal);
  renderPlanPomodoroChart();
}

function schedulePomodoroNotesSave() {
  if (!pomodoroState.taskId) return;
  if (pomodoroNotesTimer) clearTimeout(pomodoroNotesTimer);
  const notes = document.getElementById("pomodoro-notes");
  const value = notes ? notes.value : "";
  pomodoroNotesTimer = setTimeout(() => {
    savePomodoroNotes(value);
  }, 500);
}

function savePomodoroNotes(value) {
  if (!pomodoroState.taskId) return;
  const notesValue = value ?? "";
  const tareaActual = (planLocal.tareas || []).find((t) => t.id === pomodoroState.taskId);
  if (tareaActual && tareaActual.pomodoroNotas === notesValue) return;
  planLocal.tareas = (planLocal.tareas || []).map((t) =>
    t.id === pomodoroState.taskId ? { ...t, pomodoroNotas: notesValue } : t
  );
  savePlanLocal(planLocal, false);
}

function updatePomodoroUI() {
  const modeLabel = document.getElementById("pomodoro-mode-label");
  const timeLabel = document.getElementById("pomodoro-time");
  if (modeLabel) {
    modeLabel.textContent = pomodoroState.mode === "break" ? "Descanso" : "Trabajo";
  }
  if (timeLabel) {
    timeLabel.textContent = formatPomodoroTime(pomodoroState.remainingSec);
  }
  updatePomodoroControls();
}

function updatePomodoroControls() {
  const startBtn = document.getElementById("pomodoro-start-btn");
  const pauseBtn = document.getElementById("pomodoro-pause-btn");
  const logBtn = document.getElementById("pomodoro-log-btn");
  const running = Boolean(pomodoroState.timerId);
  if (startBtn) startBtn.disabled = running || !pomodoroState.taskId;
  if (pauseBtn) pauseBtn.disabled = !running;
  if (logBtn) logBtn.disabled = !pomodoroState.taskId || pomodoroState.mode !== "work";
}

function formatPomodoroTime(totalSeconds) {
  const clamped = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatPomodoroMinutes(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

function renderPlanPomodoroChart() {
  const chart = document.getElementById("plan-pomodoro-chart");
  if (!chart) return;
  const summary = document.getElementById("plan-pomodoro-summary");
  const logs = Array.isArray(planLocal.pomodoroLogs) ? planLocal.pomodoroLogs : [];
  if (!logs.length) {
    chart.innerHTML =
      '<div class="empty-state"><div class="empty-state-text">Aun no hay sesiones registradas.</div></div>';
    if (summary) summary.textContent = "";
    return;
  }
  const tareasMap = (planLocal.tareas || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});
  const rolesMap = (planLocal.roles || []).reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});
  const totals = logs.reduce((acc, log) => {
    if (!log || !log.tareaId) return acc;
    const minutes = Number(log.minutos || 0);
    if (!minutes) return acc;
    acc[log.tareaId] = (acc[log.tareaId] || 0) + minutes;
    return acc;
  }, {});
  const entries = Object.entries(totals)
    .map(([tareaId, minutos]) => {
      const tarea = tareasMap[tareaId];
      const rol = tarea ? rolesMap[tarea.rolId] : null;
      return {
        tareaId,
        titulo: tarea?.titulo || "Tarea eliminada",
        minutos,
        color: rol?.color || "#2563eb",
      };
    })
    .sort((a, b) => b.minutos - a.minutos);
  if (!entries.length) {
    chart.innerHTML =
      '<div class="empty-state"><div class="empty-state-text">Aun no hay sesiones registradas.</div></div>';
    if (summary) summary.textContent = "";
    return;
  }
  const maxMinutes = Math.max(...entries.map((e) => e.minutos));
  chart.innerHTML = entries
    .map((entry) => {
      const percent = maxMinutes ? Math.round((entry.minutos / maxMinutes) * 100) : 0;
      return `
        <div class="plan-pomodoro-row">
          <div class="plan-pomodoro-label">
            <span class="plan-pomodoro-task">${entry.titulo}</span>
            <span class="plan-pomodoro-min">${formatPomodoroMinutes(entry.minutos)}</span>
          </div>
          <div class="plan-pomodoro-bar" style="--pomodoro-color:${entry.color};">
            <span class="plan-pomodoro-bar-fill" style="--pomodoro-width:${percent}%;"></span>
          </div>
        </div>
      `;
    })
    .join("");
  if (summary) {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.minutos, 0);
    summary.textContent = `${formatPomodoroMinutes(totalMinutes)} · ${logs.length} sesiones`;
  }
}

function editTodoTask(tareaId) {
  const tarea = (planLocal.tareas || []).find((t) => t.id === tareaId);
  if (!tarea) return;
  openPlanTareaModal(tarea);
}

function addChecklistItem(tareaId) {
  const texto = prompt("Nueva checklist para la tarea:");
  if (!texto) return;
  planLocal.tareas = (planLocal.tareas || []).map((t) =>
    t.id === tareaId
      ? {
          ...t,
          checklist: [...(t.checklist || []), { id: `chk-${Date.now()}`, text: texto.trim(), done: false }],
        }
      : t
  );
  savePlanLocal(planLocal);
  renderPlanTodoList();
}

function toggleChecklistItem(tareaId, itemId, done) {
  planLocal.tareas = (planLocal.tareas || []).map((t) =>
    t.id === tareaId
      ? {
          ...t,
          checklist: (t.checklist || []).map((c) => (c.id === itemId ? { ...c, done: Boolean(done) } : c)),
        }
      : t
  );
  savePlanLocal(planLocal);
  renderPlanTodoList();
}

function deleteChecklistItem(tareaId, itemId) {
  planLocal.tareas = (planLocal.tareas || []).map((t) =>
    t.id === tareaId
      ? { ...t, checklist: (t.checklist || []).filter((c) => c.id !== itemId) }
      : t
  );
  savePlanLocal(planLocal);
  renderPlanTodoList();
}


function handlePlanDrop(evt) {
  evt.preventDefault();
  const cell = evt.currentTarget;
  const dia = Number(cell.getAttribute("data-dia"));
  const hora = cell.getAttribute("data-hora");
  const payload = evt.dataTransfer.getData("text/plain");
  if (!payload) return;
  const weekKey = getCurrentWeekKey();

  if (payload.startsWith("block:")) {
    const blockId = payload.replace("block:", "") || draggingPlanBlockId;
    if (!blockId) return;
    if (slotOcupado(dia, hora, blockId, weekKey)) {
      alert("Ya hay un bloque en este horario.");
      return;
    }
    // Por defecto duplicamos al arrastrar; usa Ctrl/Cmd para mover
    if (evt.ctrlKey || evt.metaKey) {
      moverPlanBloque(blockId, dia, hora, weekKey);
    } else {
      duplicarPlanBloque(blockId, dia, hora, weekKey);
    }
    return;
  }

  const tareaId = payload;
  const tarea = (planLocal.tareas || []).find((t) => t.id === tareaId);
  if (!tarea) return;
  const end = getPlanEndFromDuration(hora, tarea.duracionMin || 60);
  if (!isPlanRangeDisponible(dia, hora, end, weekKey)) {
    alert("Ya hay un bloque en el horario seleccionado.");
    return;
  }
  const nuevosBloques = [
    ...getBloquesSemana(weekKey),
    ...buildPlanBlocksForRange({
      start: hora,
      end,
      tareaId,
      rolId: tarea.rolId,
      dia,
    }),
  ];
  setBloquesSemana(weekKey, nuevosBloques);
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function autoScrollOnDrag(evt) {
  const threshold = 80;
  const speed = 22;
  if (evt.clientY < threshold) {
    window.scrollBy({ top: -speed, behavior: "auto" });
  } else if (window.innerHeight - evt.clientY < threshold) {
    window.scrollBy({ top: speed, behavior: "auto" });
  }
}

function toggleTareaCompletada(tareaId, completada) {
  planLocal.tareas = (planLocal.tareas || []).map((t) =>
    t.id === tareaId ? { ...t, completada: Boolean(completada) } : t
  );
  actualizarBloquesTodasLasSemanas((lista) =>
    lista.map((b) => (b.tareaId === tareaId ? { ...b, completado: Boolean(completada) } : b))
  );
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
  renderPlanTodoList();
}

function toggleBloqueCompleto(bloqueId) {
  const weekKey = getCurrentWeekKey();
  const nuevos = getBloquesSemana(weekKey).map((b) =>
    b.id === bloqueId ? { ...b, completado: !b.completado } : b
  );
  setBloquesSemana(weekKey, nuevos);
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function editarBloque(bloqueId) {
  const weekKey = getCurrentWeekKey();
  const bloque = getBloquesSemana(weekKey).find((b) => b.id === bloqueId);
  if (!bloque) return;
  const nuevaHora = prompt("Nueva hora de inicio (HH:MM):", bloque.start);
  if (!nuevaHora || !/^[0-2][0-9]:[0-5][0-9]$/.test(nuevaHora)) return;
  const nuevoDia = Number(prompt("Nuevo d?a (1=Lun ... 7=Dom):", bloque.dia)) || bloque.dia;
  const tarea = (planLocal.tareas || []).find((t) => t.id === bloque.tareaId);
  const duracion = diffTimes(bloque.start, bloque.end || bloque.start) || tarea?.duracionMin || 60;
  const nuevoFin = minutesToTime(timeToMinutes(nuevaHora) + duracion);
  if (!isPlanRangeDisponible(nuevoDia, nuevaHora, nuevoFin, weekKey, bloqueId)) {
    alert("Ya existe un bloque en el horario seleccionado.");
    return;
  }
  const nuevos = getBloquesSemana(weekKey).map((b) =>
    b.id === bloqueId ? { ...b, start: nuevaHora, end: nuevoFin, dia: nuevoDia } : b
  );
  setBloquesSemana(weekKey, nuevos);
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function eliminarBloque(bloqueId) {
  const weekKey = getCurrentWeekKey();
  setBloquesSemana(
    weekKey,
    getBloquesSemana(weekKey).filter((b) => b.id !== bloqueId)
  );
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function handlePlanBlockDragStart(evt, blockId) {
  draggingPlanBlockId = blockId;
  if (evt.dataTransfer) {
    evt.dataTransfer.effectAllowed = "copyMove";
    evt.dataTransfer.dropEffect = evt.ctrlKey || evt.metaKey ? "copy" : "move";
    evt.dataTransfer.setData("text/plain", `block:${blockId}`);
  }
}

function handlePlanBlockDragEnd() {
  draggingPlanBlockId = null;
}

function duplicarPlanBloque(blockId, dia, hora, weekKey = getCurrentWeekKey()) {
  const orig = getBloquesSemana(weekKey).find((b) => b.id === blockId);
  if (!orig) return;
  const dur = diffTimes(orig.start, orig.end || orig.start) || 60;
  const endMinutes = timeToMinutes(hora) + dur;
  const end = minutesToTime(endMinutes);
  if (!isPlanRangeDisponible(dia, hora, end, weekKey)) {
    alert("Ya existe un bloque en el horario seleccionado.");
    return;
  }
  const nuevo = {
    ...orig,
    id: `b-${Date.now()}`,
    start: hora,
    end,
    dia,
    completado: false,
  };
  const nuevosBloques = [...getBloquesSemana(weekKey), nuevo];
  setBloquesSemana(weekKey, nuevosBloques);
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function moverPlanBloque(blockId, dia, hora, weekKey = getCurrentWeekKey()) {
  const orig = getBloquesSemana(weekKey).find((b) => b.id === blockId);
  if (!orig) return;
  const dur = diffTimes(orig.start, orig.end || orig.start) || 60;
  const endMinutes = timeToMinutes(hora) + dur;
  const end = minutesToTime(endMinutes);
  if (!isPlanRangeDisponible(dia, hora, end, weekKey, blockId)) {
    alert("Ya existe un bloque en el horario seleccionado.");
    return;
  }
  const nuevosBloques = getBloquesSemana(weekKey).map((b) =>
    b.id === blockId ? { ...b, start: hora, end, dia, completado: false } : b
  );
  setBloquesSemana(weekKey, nuevosBloques);
  savePlanLocal(planLocal);
  renderPlanAgenda();
  renderPlanResumen();
}

function eliminarTarea(tareaId) {
  if (pomodoroState.taskId === tareaId) {
    pausePomodoroTimer();
    pomodoroState.taskId = null;
  }
  planLocal.tareas = (planLocal.tareas || []).filter((t) => t.id !== tareaId);
  actualizarBloquesTodasLasSemanas((lista) => lista.filter((b) => b.tareaId !== tareaId));
  savePlanLocal(planLocal);
  renderPlanRoles();
  renderPlanAgenda();
  renderPlanLegend();
  renderPlanResumen();
  renderPlanTodoList();
}

function renderPlanResumen() {
  const target = document.getElementById("plan-resumen");
  if (!target) return;
  const total = planLocal.tareas?.length || 0;
  const completas = (planLocal.tareas || []).filter((t) => t.completada).length;
  const bloquesSemana = getBloquesSemana(getCurrentWeekKey());
  const bloques = bloquesSemana.length;
  const bloquesDone = bloquesSemana.filter((b) => b.completado).length;
  target.innerHTML = `
    <div class="plan-chip">Pendientes: ${Math.max(total - completas, 0)}</div>
    <div class="plan-chip">Completadas: ${completas}</div>
    <div class="plan-chip">Bloques: ${bloques}</div>
    <div class="plan-chip">Bloques listos: ${bloquesDone}</div>
  `;
}

// ==================== MODALES ====================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn(`Modal no encontrado: ${modalId}`);
    return;
  }
  modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("active");
  // Limpiar formulario
  const form = document.querySelector(`#${modalId} form`);
  if (form) form.reset();
}

// Cerrar modal al hacer clic fuera
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});

// ==================== DASHBOARD ====================

async function cargarDashboard() {
  if (!document.getElementById("stat-habitos")) return;
  try {
    // Cargar estad├¡sticas
    await cargarEstadisticasDashboard();

    // Cargar h├íbitos de hoy
    await cargarHabitosHoy();

    // Cargar objetivos en progreso
    await cargarObjetivosProgreso();
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    mostrarError("Error al cargar el dashboard");
  }
}


async function cargarEstadisticasDashboard() {
  try {
    const resHabitos = await fetch(`${API_URL}/api/habitos`);
    const dataHabitos = await resHabitos.json();
    const habitosActivos = dataHabitos.habitos.filter((h) => h.activo);
    const statHabitos = document.getElementById("stat-habitos");
    if (statHabitos) statHabitos.textContent = habitosActivos.length;

    const mejorRacha = Math.max(
      ...habitosActivos.map((h) => h.racha_maxima || 0),
      0
    );
    const statRacha = document.getElementById("stat-racha");
    if (statRacha) statRacha.textContent = mejorRacha + " dias";

    const resFinanzas = await fetch(
      `${API_URL}/api/finanzas-personales/resumen`
    );
    const dataFinanzas = await resFinanzas.json();
    const balance =
      (dataFinanzas.resumen?.ingresos || 0) -
      (dataFinanzas.resumen?.gastos || 0);
    const statBalance = document.getElementById("stat-balance");
    if (statBalance) statBalance.textContent = formatMoney(balance);

    try {
      const resDeudas = await fetch(`${API_URL}/api/deudas/resumen`);
      const dataDeudas = await resDeudas.json();
      const deudaTotal = Number(dataDeudas.resumen?.monto_total || 0);
      const statDeuda = document.getElementById("stat-deuda");
      if (statDeuda) statDeuda.textContent = formatMoney(deudaTotal);
    } catch (err) {
      console.error("Error cargando deudas en dashboard:", err);
    }

    const resObjetivos = await fetch(
      `${API_URL}/api/objetivos?estado=en_progreso`
    );
    const dataObjetivos = await resObjetivos.json();
    const statObjetivos = document.getElementById("stat-objetivos");
    if (statObjetivos) {
      statObjetivos.textContent = dataObjetivos.objetivos.length;
    }

    await cargarProximoEventoDashboard();
  } catch (error) {
    console.error("Error cargando estadisticas:", error);
  }
}

async function cargarProximoEventoDashboard() {
  const target = document.getElementById("stat-proximo-evento");
  if (!target) return;

  try {
    const res = await fetch(`${API_URL}/api/eventos-personales/proximo`);
    const data = await res.json();

    if (!data.ok || !data.evento) {
      target.textContent = "Sin eventos";
      return;
    }

    const evento = data.evento;
    const hoy = new Date();
    const fechaEvento = new Date(
      (evento.fecha || "").includes("T")
        ? evento.fecha
        : `${evento.fecha}T00:00:00`
    );

    const msDiff = fechaEvento - new Date(hoy.toDateString());
    const dias = Math.max(0, Math.round(msDiff / (1000 * 60 * 60 * 24)));

    const hora = evento.hora ? evento.hora.slice(0, 5) : "";
    const titulo = evento.titulo || "Evento";
    const fechaLarga = formatFechaLarga(evento.fecha);

    target.innerHTML = `${titulo} ┬À ${hora ? `${hora} ┬À ` : ""}${
      fechaLarga || ""
    }<br><span style="color:#fbbf24; font-size:0.9em; font-weight: 600;">Faltan ${dias} d├¡as</span>`;
  } catch (error) {
    console.error("Error cargando pr├│ximo evento:", error);
    target.textContent = "Sin datos";
  }
}

async function cargarHabitosHoy() {
  const container = document.getElementById("dashboard-habitos-hoy");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/api/habitos/hoy/checklist`);
    const data = await res.json();

    if (!data.ok || !data.habitos || data.habitos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <div class="empty-state-text">No tienes hábitos activos</div>
          <button class="btn-primary" onclick="switchTab('habitos')">Crear mi primer hábito</button>
        </div>
      `;
      return;
    }

    const html = data.habitos
      .map((habito) => {
        const completado = habito.completado_hoy || false;
        return `
          <div class="habito-item"
               draggable="true"
               data-habito-id="${habito.id}"
               ondragstart="handleDragStart(event, ${habito.id})"
               ondragover="handleDragOver(event)"
               ondrop="handleDrop(event, ${habito.id})"
               ondragend="handleDragEnd(event)">
            <span class="drag-handle" style="cursor: move; margin-right: 8px; color: #999;">☰</span>
            <input type="checkbox"
                   class="habito-checkbox"
                   ${completado ? "checked" : ""}
                   onchange="marcarHabito(${habito.id}, this.checked)">
            <span class="habito-icon">${habito.icono || "⭐"}</span>
            <div class="habito-info">
              <div class="habito-nombre">${habito.nombre}</div>
              ${habito.descripcion ? `<div class="habito-descripcion">${habito.descripcion}</div>` : ""}
              <div class="habito-racha">
                <span class="racha-badge">🔥 ${habito.racha_actual || 0} días</span>
                <span style="color: #999;">Mejor: ${habito.racha_maxima || 0} días</span>
              </div>
            </div>
            <span class="categoria-badge ${habito.categoria || "otro"}">
              ${habito.categoria || "otro"}
            </span>
          </div>
        `;
      })
      .join("");

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando hábitos de hoy:", error);
    container.innerHTML = '<div class="empty-state">Error al cargar hábitos</div>';
  }
}async function cargarHistorialHabitosMes() {
  const container = document.getElementById("habitos-historial-mes");
  const header = document.getElementById("habitos-historial-header");

  if (!container || !header) return;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const mesNombre = hoy.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  header.textContent = `Mes actual: ${mesNombre}`;
  container.innerHTML = '<div class="loading"></div>';

  try {
    const res = await fetch(
      `${API_URL}/api/habitos/progreso/mes?anio=${anio}&mes=${mes}`
    );
    const data = await res.json();

    // Preparar mapa de fechas (normalizando a YYYY-MM-DD)
    const mapa = {};
    (data.resumen || []).forEach((item) => {
      const key = (item.fecha || "").split("T")[0];
      if (key) {
        mapa[key] = item;
      }
    });

    const diasEnMes = new Date(anio, mes, 0).getDate();
    const totalHabitos = data.habitos_activos || 0;

    let html = "";
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;
      const info = mapa[fechaStr] || {};
      const completados = parseInt(info.completados || 0, 10);
      const porcentaje = totalHabitos
        ? Math.round((completados / totalHabitos) * 100)
        : 0;

      const esHoy =
        dia === hoy.getDate() &&
        mes === hoy.getMonth() + 1 &&
        anio === hoy.getFullYear();

      html += `
        <div class="habit-day-card ${esHoy ? "today" : ""}">
          <div class="habit-day-header">
            <span>${dia}</span>
            <span style="color: #64748b; font-size: 0.9em;">${completados}/${
        totalHabitos || "-"
      }</span>
          </div>
          <div class="habit-day-progress">
            <div class="habit-day-progress-fill" style="width: ${porcentaje}%;"></div>
          </div>
          <div style="color: #94a3b8; font-size: 0.85em;">${porcentaje}% completado</div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando historial de h├íbitos:", error);
    container.innerHTML =
      '<div style="text-align:center; padding: 20px; color: #999;">No se pudo cargar el historial</div>';
  }
}

async function cargarObjetivosProgreso() {
  const container = document.getElementById("dashboard-objetivos");
  if (!container) return;

  try {
    const res = await fetch(`${API_URL}/api/objetivos`);
    const data = await res.json();

    // Filtrar objetivos activos (no completados ni cancelados)
    const objetivosActivos =
      data.objetivos?.filter(
        (obj) => obj.estado !== "completado" && obj.estado !== "cancelado"
      ) || [];

    if (!data.ok || objetivosActivos.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">­ƒÄ»</div>
                    <div class="empty-state-text">No tienes objetivos activos</div>
                    <button class="btn-primary" onclick="switchTab('objetivos')">Crear mi primer objetivo</button>
                </div>
            `;
      return;
    }

    let html = "";
    objetivosActivos.slice(0, 6).forEach((objetivo) => {
      html += renderObjetivoCard(objetivo);
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando objetivos:", error);
    container.innerHTML =
      '<div class="empty-state">Error al cargar objetivos</div>';
  }
}


// ==================== HABITOS ====================

async function cargarHabitos() {
  const plannerGrid = document.getElementById("habitos-planner-grid");
  const plannerMonth = document.getElementById("habitos-planner-month");
  const chartContainer = document.getElementById("habitos-chart");
  const chartSummary = document.getElementById("habitos-chart-summary");

  if (!plannerGrid && !chartContainer && !plannerMonth) return;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const diasEnMes = new Date(anio, mes, 0).getDate();
  const hoyStr = `${anio}-${String(mes).padStart(2, "0")}-${String(
    hoy.getDate()
  ).padStart(2, "0")}`;

  if (plannerGrid) {
    plannerGrid.innerHTML = '<div class="loading"></div>';
    plannerGrid.style.setProperty("--days", diasEnMes);
  }
  if (chartContainer) {
    chartContainer.innerHTML = '<div class="loading"></div>';
  }
  if (plannerMonth) {
    plannerMonth.textContent = formatMesHabitos(anio, mes);
  }
  if (chartSummary) {
    chartSummary.textContent = "Cargando...";
  }

  try {
    const res = await fetch(
      `${API_URL}/api/habitos/progreso/mes/detalle?anio=${anio}&mes=${mes}`
    );
    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || "No se pudo cargar habitos");
    }

    const habitos = (data.habitos || []).sort(
      (a, b) => (a.orden || 0) - (b.orden || 0)
    );
    state.habitos = habitos;

    if (plannerGrid) {
      renderHabitosPlanner({
        container: plannerGrid,
        habitos,
        progreso: data.progreso || [],
        anio,
        mes,
        diasEnMes,
        hoyStr,
      });
    }

    if (chartContainer) {
      renderHabitosResumenMensual({
        container: chartContainer,
        summaryEl: chartSummary,
        resumenDia: data.resumen_dia || [],
        totalHabitos: habitos.length,
        diasEnMes,
        hoyStr,
      });
    }
  } catch (error) {
    console.error("Error cargando habitos:", error);
    if (plannerGrid) {
      plannerGrid.innerHTML =
        '<div class="empty-state">No se pudieron cargar los habitos</div>';
    }
    if (chartContainer) {
      chartContainer.innerHTML = "";
    }
    if (chartSummary) {
      chartSummary.textContent = "Error al cargar";
    }
  }
}

function renderHabitosPlanner({
  container,
  habitos,
  progreso,
  anio,
  mes,
  diasEnMes,
  hoyStr,
}) {
  if (!container) return;

  if (!habitos || habitos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">:)</div>
        <div class="empty-state-text">No tienes habitos registrados</div>
        <button class="btn-primary" onclick="openModal('modal-habito')">Crear mi primer habito</button>
      </div>
    `;
    return;
  }

  const completados = new Set(
    (progreso || [])
      .map((p) => buildHabitDateKey(p.habito_id, p.fecha))
      .filter(Boolean)
  );

  let html =
    '<div class="habit-planner-cell habit-planner-header-cell">Habito</div>';
  for (let dia = 1; dia <= diasEnMes; dia++) {
    html += `<div class="habit-planner-cell habit-planner-header-cell">${dia}</div>`;
  }

  habitos.forEach((habito) => {
    html += `
      <div class="habit-planner-cell habit-planner-habit" title="${
        habito.categoria || "habito"
      }">
        <button class="habit-planner-emoji" type="button" aria-hidden="true">${
          habito.icono || "*"
        }</button>
        <span>${habito.nombre}</span>
      </div>
    `;

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`;
      const key = `${habito.id}-${fechaStr}`;
      const completado = completados.has(key);
      const esHoy = fechaStr === hoyStr;
      const todayStyle = esHoy
        ? 'style="border-color:#6366f1; box-shadow:0 0 0 2px rgba(99,102,241,0.25);"'
        : "";

      html += `
        <button
          class="habit-planner-cell habit-day-dot${
            completado ? " completed" : ""
          }"
          data-habito="${habito.id}"
          data-fecha="${fechaStr}"
          aria-label="${habito.nombre} - ${
        completado ? "completado" : "pendiente"
      } (${fechaStr})"
          ${todayStyle}
          onclick="toggleHabitoDia(${habito.id}, '${fechaStr}', ${completado})"
        ></button>
      `;
    }
  });

  container.innerHTML = html;
}

function renderHabitosResumenMensual({
  container,
  summaryEl,
  resumenDia,
  totalHabitos,
  diasEnMes,
  hoyStr,
}) {
  if (!container) return;

  if (!totalHabitos) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">!</div>
        <div class="empty-state-text">Agrega habitos para ver el progreso</div>
      </div>
    `;
    if (summaryEl) {
      summaryEl.textContent = "Sin habitos activos";
    }
    return;
  }

  const resumenMap = (resumenDia || []).reduce((acc, item) => {
    const key = (item.fecha || "").split("T")[0];
    if (key) acc[key] = item;
    return acc;
  }, {});

  let totalCheckins = 0;
  let diasConActividad = 0;
  let html = '<div class="habit-month-grid">';

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaStr = `${hoyStr.slice(0, 8)}${String(dia).padStart(2, "0")}`;
    const info = resumenMap[fechaStr] || {};
    const completados = parseInt(info.completados || 0, 10);
    const porcentaje = totalHabitos
      ? Math.round((completados / totalHabitos) * 100)
      : 0;

    totalCheckins += completados;
    if (completados > 0) diasConActividad += 1;

    html += `
      <div class="habit-day-card ${fechaStr === hoyStr ? "today" : ""}">
        <div class="habit-day-header">
          <span>${dia}</span>
          <span style="color: #64748b; font-size: 0.9em;">${completados}/${totalHabitos}</span>
        </div>
        <div class="habit-day-progress">
          <div class="habit-day-progress-fill" style="width: ${porcentaje}%;"></div>
        </div>
        <div style="color: #94a3b8; font-size: 0.85em;">${porcentaje}% completado</div>
      </div>
    `;
  }

  html += "</div>";
  container.innerHTML = html;

  if (summaryEl) {
    const totalPosibles = totalHabitos * diasEnMes;
    const pctGlobal = totalPosibles
      ? Math.round((totalCheckins / totalPosibles) * 100)
      : 0;
    summaryEl.textContent = `${pctGlobal}% del mes ? ${diasConActividad} dias con actividad`;
  }
}

function buildHabitDateKey(habitoId, fecha) {
  if (!habitoId || !fecha) return "";
  const fechaStr = (fecha || "").split("T")[0];
  return `${habitoId}-${fechaStr}`;
}

function formatMesHabitos(anio, mes) {
  try {
    const fecha = new Date(Date.UTC(anio, mes - 1, 1));
    const texto = new Intl.DateTimeFormat("es-CL", {
      month: "long",
      year: "numeric",
    }).format(fecha);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  } catch (e) {
    return `${mes}/${anio}`;
  }
}

async function guardarHabito(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const habito = {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    frecuencia: formData.get("frecuencia"),
    objetivo_diario: parseInt(formData.get("objetivo_diario")),
    icono: formData.get("icono"),
    color: formData.get("color"),
  };

  try {
    const res = await fetch(`${API_URL}/api/habitos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habito),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("H├íbito creado exitosamente");
      closeModal("modal-habito");
      cargarHabitos();
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else {
      mostrarError(data.error || "Error al crear h├íbito");
    }
  } catch (error) {
    console.error("Error guardando h├íbito:", error);
    mostrarError("Error al guardar h├íbito");
  }
}

async function marcarHabito(habitoId, completado) {
  try {
    const res = await fetch(`${API_URL}/api/habitos/${habitoId}/marcar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completado }),
    });

    const data = await res.json();

    if (data.ok) {
      console.log("Ô£à H├íbito marcado:", data);
      // Recargar para actualizar rachas
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
      if (state.currentTab === "habitos") {
        cargarHabitos();
      }
    } else {
      mostrarError(data.error || "Error al marcar h├íbito");
    }
  } catch (error) {
    console.error("Error marcando h├íbito:", error);
    mostrarError("Error al marcar h├íbito");
  }
}


async function toggleHabitoDia(habitoId, fecha, completadoActual) {
  try {
    const res = await fetch(`${API_URL}/api/habitos/${habitoId}/marcar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha,
        completado: !completadoActual,
        veces: completadoActual ? 0 : 1,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      await cargarHabitos();
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else {
      mostrarError(data.error || "No se pudo actualizar el habito");
    }
  } catch (error) {
    console.error("Error actualizando dia de habito:", error);
    mostrarError("Error al actualizar el habito");
  }
}

// Reordenar h├íbitos (subir/bajar)
async function moverHabito(habitoId, direccion) {
  // Ordenar localmente por el campo orden
  state.habitos = (state.habitos || []).sort(
    (a, b) => (a.orden || 0) - (b.orden || 0)
  );

  const index = state.habitos.findIndex((h) => h.id === habitoId);
  if (index === -1) return;

  const swapIndex = index + direccion;
  if (swapIndex < 0 || swapIndex >= state.habitos.length) return;

  // Intercambiar posiciones
  [state.habitos[index], state.habitos[swapIndex]] = [
    state.habitos[swapIndex],
    state.habitos[index],
  ];

  // Recalcular orden secuencial
  const nuevoOrden = state.habitos.map((h, idx) => ({
    id: h.id,
    orden: idx + 1,
  }));

  try {
    const res = await fetch(`${API_URL}/api/habitos/reordenar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orden: nuevoOrden }),
    });

    const data = await res.json();
    if (data.ok) {
      // Refrescar listas
      await cargarHabitos();
      if (state.currentTab === "dashboard") {
        cargarHabitosHoy();
      }
    } else {
      mostrarError(data.error || "No se pudo reordenar");
    }
  } catch (error) {
    console.error("Error reordenando h├íbitos:", error);
    mostrarError("Error al reordenar");
  }
}

async function eliminarHabito(habitoId) {
  if (!confirm("┬┐Est├ís seguro de eliminar este h├íbito?")) return;

  try {
    const res = await fetch(`${API_URL}/api/habitos/${habitoId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("H├íbito eliminado");
      cargarHabitos();
    } else {
      mostrarError(data.error || "Error al eliminar h├íbito");
    }
  } catch (error) {
    console.error("Error eliminando h├íbito:", error);
    mostrarError("Error al eliminar h├íbito");
  }
}

// ==================== FINANZAS ====================

const MESES_CORTOS = [
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

const MESES_LARGOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const CATEGORIAS_FINANZAS_KEY = "finanzas_categorias";
const CATEGORIAS_FINANZAS_BASE = [
  "Comida",
  "Compras",
  "Educaci?n",
  "Freelance",
  "Inversi?n",
  "Ocio",
  "Renta",
  "Salario",
  "Servicios",
  "Transporte",
  "Transferencia",
];

function ordenarCategoriasFinanzasLista(lista = []) {
  return [...new Set(lista)]
    .map((cat) => (typeof cat === "string" ? cat.trim() : ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function ordenarSelectsMetodoPago() {
  const selects = document.querySelectorAll('select[name="metodo_pago"], select.metodo-select');
  selects.forEach((select) => {
    const valorActual = select.value;
    const options = Array.from(select.options);
    const placeholderIndex = options.findIndex((opt) => opt.value === "");
    const placeholder =
      placeholderIndex >= 0 ? options.splice(placeholderIndex, 1)[0] : null;

    options.sort((a, b) =>
      a.text.localeCompare(b.text, "es", { sensitivity: "base" })
    );

    select.innerHTML = "";
    if (placeholder) select.appendChild(placeholder);
    options.forEach((opt) => select.appendChild(opt));
    if (valorActual && Array.from(select.options).some((opt) => opt.value === valorActual)) {
      select.value = valorActual;
    }
  });
}

function calcularResumenMensual() {
  const transacciones = state.finanzas || [];
  const resumen = Array.from({ length: 12 }, () => ({
    ingresos: 0,
    gastos: 0,
    resultado: 0,
  }));

  transacciones.forEach((t) => {
    const mes = obtenerMesTransaccion(t);
    if (!mes) return;
    const idx = mes - 1;
    const monto = Number(t.monto || 0);
    if (t.tipo === "ingreso") {
      resumen[idx].ingresos += monto;
    } else if (t.tipo === "gasto") {
      resumen[idx].gastos += monto;
    }
  });

  resumen.forEach((r) => {
    r.resultado = r.ingresos - r.gastos;
  });

  const saldoAcumulado = [];
  let acumulado = 0;
  resumen.forEach((r) => {
    acumulado += r.resultado;
    saldoAcumulado.push(acumulado);
  });

  return { resumen, saldoAcumulado };
}

function cargarCategoriasFinanzas() {
  try {
    const guardadas = localStorage.getItem(CATEGORIAS_FINANZAS_KEY);
    const categorias = guardadas ? JSON.parse(guardadas) : CATEGORIAS_FINANZAS_BASE;
    state.categoriasFinanzas = Array.isArray(categorias)
      ? ordenarCategoriasFinanzasLista(categorias)
      : [];
    renderCategoriasFinanzas();
  } catch (error) {
    console.error("Error cargando categorías de finanzas", error);
    state.categoriasFinanzas = [];
    renderCategoriasFinanzas();
  }
}

function guardarCategoriasFinanzas() {
  try {
    const ordenadas = ordenarCategoriasFinanzasLista(state.categoriasFinanzas || []);
    state.categoriasFinanzas = ordenadas;
    localStorage.setItem(CATEGORIAS_FINANZAS_KEY, JSON.stringify(ordenadas));
    renderCategoriasFinanzas();
  } catch (error) {
    console.error("Error guardando categorías de finanzas", error);
  }
}

function renderCategoriasFinanzas() {
  const categorias = ordenarCategoriasFinanzasLista(state.categoriasFinanzas || []);

  const datalist = document.getElementById("categorias-finanzas-options");
  if (datalist) {
    const opciones = categorias.map((cat) => `<option value="${cat}"></option>`).join("");
    datalist.innerHTML = opciones || "<option value=''></option>";
  }

  const selects = document.querySelectorAll(".categoria-select");
  const optionsHtml =
    `<option value="">Seleccionar...</option>` +
    categorias.map((c) => `<option value="${c}">${c}</option>`).join("");
  selects.forEach((sel) => {
    const valorActual = sel.value;
    sel.innerHTML = optionsHtml;
  if (valorActual && categorias.includes(valorActual)) {
    sel.value = valorActual;
  } else {
    sel.value = "";
  }
  });
}

function guardarCategoriaFinanza(event) {
  event.preventDefault();
  const form = event.target;
  const nombre = (form.categoria?.value || "").trim();
  if (!nombre) {
    mostrarError("Ingresa un nombre de categoría");
    return;
  }
  if (!state.categoriasFinanzas.includes(nombre)) {
    state.categoriasFinanzas.push(nombre);
  }
  guardarCategoriasFinanzas();
  form.reset();
  closeModal("modal-categoria-finanza");
  renderCategoriasFinanzas();
  mostrarExito("Categoría agregada");
}

async function cargarFinanzas() {
  try {
    renderCategoriasFinanzas();
    // Vista limpia: sin resumen previo
    document.getElementById("finanzas-balance").textContent = formatMoney(0);
    document.getElementById("finanzas-ingresos").textContent = formatMoney(0);
    document.getElementById("finanzas-gastos").textContent = formatMoney(0);
    document.getElementById("finanzas-ahorros").textContent = formatMoney(0);
    document.getElementById("finanzas-inversiones").textContent = formatMoney(0);
    // Cargar transacciones
    await cargarTransacciones();

    // Cargar saldos por metodo de pago
    await cargarSaldosPorMetodo();
    renderIngresosEgresos();
    renderReporteMensual();
    renderGraficosFlujo();
    const totalIngresos = (state.finanzas || [])
      .filter((t) => t.tipo === "ingreso")
      .reduce((acc, t) => acc + Number(t.monto || 0), 0);
    const totalGastos = (state.finanzas || [])
      .filter((t) => t.tipo === "gasto")
      .reduce((acc, t) => acc + Number(t.monto || 0), 0);
    const balance = totalIngresos - totalGastos;

    document.getElementById("finanzas-balance").textContent = formatMoney(balance);
    document.getElementById("finanzas-ingresos").textContent = formatMoney(totalIngresos);
    document.getElementById("finanzas-gastos").textContent = formatMoney(totalGastos);
  } catch (error) {
    console.error("Error cargando finanzas:", error);
    mostrarError("Error al cargar finanzas");
  }
}


async function cargarSaldosPorMetodo() {
  const container = document.getElementById("finanzas-saldos");
  if (!container) return;
  const totalEl = document.getElementById("finanzas-efectivo-total");

  try {
    const res = await fetch(
      `${API_URL}/api/finanzas-personales/saldos/metodos`
    );
    const data = await res.json();

    const saldosApi = Array.isArray(data.saldos) ? data.saldos : [];
    const saldoMap = new Map(
      saldosApi.map((saldo) => [saldo.metodo_pago, saldo])
    );
    const metodos = new Set(saldosApi.map((saldo) => saldo.metodo_pago));
    const metodosConMonto = ["banco_estado_rut", "banco_chile"];
    const metodosEspeciales = ["tenpo_credito"];
    [...metodosConMonto, ...metodosEspeciales].forEach((metodo) => {
      metodos.add(metodo);
    });
    const metodosDesdeTransacciones = new Set(
      (state.finanzas || []).map((t) => t.metodo_pago).filter(Boolean)
    );
    metodosDesdeTransacciones.forEach((metodo) => metodos.add(metodo));
    const saldosManual = new Set(["efectivo"]);

    const obtenerSaldoManual = (metodo) => {
      const movimientos = (state.finanzas || []).filter(
        (t) => t.metodo_pago === metodo
      );
      const ingresos = movimientos
        .filter((t) => t.tipo === "ingreso")
        .reduce((acc, t) => acc + Number(t.monto || 0), 0);
      const gastos = movimientos
        .filter((t) => t.tipo === "gasto")
        .reduce((acc, t) => acc + Number(t.monto || 0), 0);
      return {
        saldo: ingresos - gastos,
        ingresos,
        gastos,
        transacciones: movimientos.length,
      };
    };

    const saldos = Array.from(metodos).map((metodo) => {
      const base = saldoMap.get(metodo);
      if (saldosManual.has(metodo) && !base) {
        const manual = obtenerSaldoManual(metodo);
        return {
          metodo_pago: metodo,
          nombre: METODOS_PAGO_LABELS[metodo] || metodo,
          saldo_disponible: manual.saldo,
          total_ingresos: manual.ingresos,
          total_gastos: manual.gastos,
          num_transacciones: manual.transacciones,
        };
      }
      const saldoValor = parseFloat((base && base.saldo_disponible) || 0);
      const ingresosValor = parseFloat((base && base.total_ingresos) || 0);
      const gastosValor = parseFloat((base && base.total_gastos) || 0);
      const numTransacciones =
        parseInt((base && base.num_transacciones) || 0, 10) || 0;

      const nombreBase = base && base.nombre;
      return {
        metodo_pago: metodo,
        nombre: METODOS_PAGO_LABELS[metodo] || nombreBase || metodo,
        saldo_disponible: saldoValor,
        total_ingresos: ingresosValor,
        total_gastos: gastosValor,
        num_transacciones: numTransacciones,
      };
    });

    const ocultarMetodos = new Set(["banco_estado", "junaeb"]);
    const ocultarSiSaldoCero = new Set(["efectivo", "santander_cc_1"]);
    const saldosVisibles = saldos.filter((saldo) => {
      if (ocultarMetodos.has(saldo.metodo_pago)) return false;
      if (
        saldo.metodo_pago !== "tenpo_credito" &&
        ocultarSiSaldoCero.has(saldo.metodo_pago)
      ) {
        const saldoValor = Number(saldo.saldo_disponible || 0);
        if (saldoValor === 0) return false;
      }
      return true;
    });

    if (!data.ok || !saldosVisibles.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">?</div>
          <div class="empty-state-text">No hay saldos registrados</div>
        </div>
      `;
      if (totalEl) {
        totalEl.textContent = formatMoney(0);
      }
      return;
    }

    let html = "";
    let efectivoTotal = 0;

    saldosVisibles.forEach((saldo) => {
      if (saldo.metodo_pago === "tenpo_credito") {
        const limite = TENPO_CREDITO_INFO.limite;
        const baseUsado = TENPO_CREDITO_INFO.usado;
        const movimientosTenpo = (state.finanzas || []).filter(
          (t) => t.metodo_pago === "tenpo_credito"
        );
        const gastosExtra = movimientosTenpo
          .filter((t) => t.tipo === "gasto")
          .reduce((acc, t) => acc + Number(t.monto || 0), 0);
        const abonosExtra = movimientosTenpo
          .filter((t) => t.tipo === "ingreso")
          .reduce((acc, t) => acc + Number(t.monto || 0), 0);
        const usado = Math.min(
          limite,
          Math.max(0, baseUsado + gastosExtra - abonosExtra)
        );
        const disponible = Math.max(0, limite - usado);
        const transaccionesTenpo =
          movimientosTenpo.length || saldo.num_transacciones || 0;

        html += `
          <div class="saldo-card credit-card">
            <div class="saldo-card-nombre">${saldo.nombre}</div>
            <div class="saldo-card-amount">
              ${formatMoney(disponible)}
              <span class="saldo-card-subtitle">Cupo disponible</span>
            </div>
            <div class="saldo-card-stats">
              <div class="saldo-card-stat">
                <span class="saldo-stat-label">Limite:</span>
                <span class="saldo-stat-value">${formatMoney(limite)}</span>
              </div>
              <div class="saldo-card-stat">
                <span class="saldo-stat-label">Usado:</span>
                <span class="saldo-stat-value" style="color: #b91c1c;">
                  -${formatMoney(usado)}
                </span>
              </div>
              <div class="saldo-card-stat">
                <span class="saldo-stat-label">Transacciones:</span>
                <span class="saldo-stat-value">${transaccionesTenpo}</span>
              </div>
            </div>
          </div>
        `;
        return;
      }

      const saldoValor = parseFloat(saldo.saldo_disponible || 0);
      const colorSaldo = saldoValor >= 0 ? "#2196f3" : "#f44336";
      const ingresosValor = parseFloat(saldo.total_ingresos || 0);
      const gastosValor = parseFloat(saldo.total_gastos || 0);
      efectivoTotal += saldoValor;

      html += `
        <div class="saldo-card">
          <div class="saldo-card-nombre">${saldo.nombre}</div>
          <div class="saldo-card-amount" style="color: ${colorSaldo};">
            ${formatMoney(saldoValor)}
          </div>
          <div class="saldo-card-stats">
            <div class="saldo-card-stat">
              <span class="saldo-stat-label">Ingresos:</span>
              <span class="saldo-stat-value" style="color: #4caf50;">
                +${formatMoney(ingresosValor)}
              </span>
            </div>
            <div class="saldo-card-stat">
              <span class="saldo-stat-label">Gastos:</span>
              <span class="saldo-stat-value" style="color: #f44336;">
                -${formatMoney(gastosValor)}
              </span>
            </div>
            <div class="saldo-card-stat">
              <span class="saldo-stat-label">Transacciones:</span>
              <span class="saldo-stat-value">${saldo.num_transacciones}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    if (totalEl) {
      totalEl.textContent = formatMoney(efectivoTotal);
    }
  } catch (error) {
    console.error("Error cargando saldos:", error);
    container.innerHTML =
      '<div class="empty-state">Error al cargar saldos</div>';
  }
}


async function cargarTransacciones() {
  const container = document.getElementById("finanzas-list");

  try {
    const res = await fetch(`${API_URL}/api/finanzas-personales?limit=50`);
    const data = await res.json();
    let resetDesde = Number(localStorage.getItem("finanzas_reset_desde") || 0);
    if (!Number.isFinite(resetDesde)) resetDesde = 0;

    state.finanzas = (data.transacciones || []).filter((t) => {
      if (!resetDesde) return true;
      const raw = t.created_at || t.updated_at || "";
      if (!raw) return true;
      const timestamp = new Date(raw).getTime();
      if (!timestamp) return true;
      return timestamp >= resetDesde;
    });

    if (!data.ok || !state.finanzas.length) {
      if (container) {
        container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">&#128337;</div>
          <div class="empty-state-text">Sin transacciones registradas</div>
          <button class="btn-primary" type="button" onclick="openModal('modal-form-ingreso')">Registrar ingreso</button>
        </div>
      `;
      }
      return;
    }

    let html = '<div class="transactions-list">';
    state.finanzas.forEach((t) => {
      const icono =
        t.tipo === "ingreso"
          ? "\u{1F4B0}"
          : t.tipo === "gasto"
          ? "\u{1F4B8}"
          : t.tipo === "ahorro"
          ? "\u{1FA99}"
          : "\u{1F4C8}";
      const signo = t.tipo === "gasto" ? "-" : "+";
      const monto = Number(t.monto || 0);
      const descripcion =
        t.descripcion && t.descripcion.trim().length
          ? t.descripcion
          : "Sin descripcion";
      const fechaLegible = formatDate(t.fecha || t.created_at) || "";
      const metodo = t.metodo_pago
        ? `<br/><span style="color: #667eea;">${formatMetodoPago(
            t.metodo_pago
          )}</span>`
        : "";

      html += `
        <div class="transaction-item">
          <span class="transaction-icon">${icono}</span>
          <div class="transaction-info">
            <div style="font-weight: 600;">${t.categoria || "-"}</div>
            <div style="color: #475569; font-size: 0.9em;">
              ${descripcion} &bull; ${fechaLegible}
              ${metodo}
            </div>
          </div>
          <div class="transaction-amount ${t.tipo}">
              ${signo}${formatMoney(monto)}
          </div>
          <button class="btn-danger" onclick="eliminarTransaccion(${t.id})">&#128465;</button>
        </div>
      `;
    });
    html += "</div>";

    if (container) {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error("Error cargando transacciones:", error);
    if (container) {
      container.innerHTML =
        '<div class="empty-state">Error al cargar transacciones</div>';
    }
  }
}

function renderFiltroMetodoFinanzas() {
  const select = document.getElementById("ing-eg-metodo-filter");
  if (!select) return;

  const transacciones = state.finanzas || [];
  const metodosMap = new Map();
  transacciones.forEach((t) => {
    const raw = t.metodo_pago;
    if (!raw) return;
    const key = normalizarMetodoPago(raw);
    const label = METODOS_PAGO_LABELS[key] || formatMetodoPago(raw);
    metodosMap.set(key, label);
  });

  const opciones = Array.from(metodosMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));

  const valorActual = state.finanzasFiltroMetodo || select.value || "";
  const optionsHtml =
    `<option value="">Todas</option>` +
    opciones.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");

  select.innerHTML = optionsHtml;

  if (valorActual && metodosMap.has(valorActual)) {
    select.value = valorActual;
  } else {
    select.value = "";
    state.finanzasFiltroMetodo = "";
  }

  const hint = document.getElementById("ing-eg-filter-hint");
  if (hint) {
    hint.textContent = select.value ? (METODOS_PAGO_LABELS[select.value] || formatMetodoPago(select.value)) : "Todas";
  }
}

function configurarFiltroMetodoFinanzas() {
  const select = document.getElementById("ing-eg-metodo-filter");
  if (!select) return;
  select.addEventListener("change", () => {
    state.finanzasFiltroMetodo = select.value || "";
    renderIngresosEgresos();
    renderFiltroMetodoFinanzas();
  });
}

function resetFiltroMetodoFinanzas() {
  state.finanzasFiltroMetodo = "";
  const select = document.getElementById("ing-eg-metodo-filter");
  if (select) select.value = "";
  renderIngresosEgresos();
  renderFiltroMetodoFinanzas();
}

function renderIngresosEgresos() {
  const ingresosBody = document.getElementById("ingresos-table-body");
  const egresosBody = document.getElementById("egresos-table-body");

  if (!ingresosBody || !egresosBody) return;

  const transacciones = state.finanzas || [];
  const metodoFiltro = state.finanzasFiltroMetodo || "";
  const metodoFiltroNorm = metodoFiltro ? normalizarMetodoPago(metodoFiltro) : "";
  const filtradas = metodoFiltro
    ? transacciones.filter((t) => {
        if (!t.metodo_pago) return false;
        const metodoNorm = normalizarMetodoPago(t.metodo_pago);
        return metodoNorm === metodoFiltroNorm;
      })
    : transacciones;
  const ingresos = filtradas.filter((t) => t.tipo === "ingreso");
  const gastos = filtradas.filter((t) => t.tipo === "gasto");

  const renderTabla = (items, body, opciones = {}) => {
    const columnas = opciones.columnas || 5;
    if (!items.length) {
      body.innerHTML = `<tr class="empty-row"><td colspan="${columnas}">${opciones.textoVacio}</td></tr>`;
      return;
    }

    const filas = items
      .slice()
      .sort(ordenarTransaccionesPorFechaDesc)
      .map((t) => {
        const mesNombre = obtenerMesNombre(t);
        const fecha = formatDate(t.fecha || t.created_at) || "-";
        const categoria = t.categoria || "-";
        const descripcion = t.descripcion || "-";
        const metodo = opciones.mostrarMetodo
          ? `<td>${formatMetodoPago(t.metodo_pago)}</td>`
          : "";
        return `
            <tr>
              <td>${fecha}</td>
              <td>${mesNombre}</td>
              <td>${categoria}</td>
              ${metodo}
              <td>${descripcion}</td>
              <td class="align-right ${opciones.tipo === "ingreso" ? "text-success" : "text-danger"}">${formatMoney(t.monto)}</td>
              <td>
                <div class="table-actions">
                  <button class="table-action-btn primary" onclick="prefillTransaccion(${t.id}, '${opciones.tipo}');" title="Editar">&#9998;</button>
                  <button class="table-action-btn danger" onclick="eliminarTransaccion(${t.id});" title="Eliminar">&#128465;</button>
                </div>
              </td>
            </tr>
          `;
      })
      .join("");

    body.innerHTML = filas;
  };

  renderTabla(ingresos, ingresosBody, {
    columnas: 7,
    textoVacio: metodoFiltro ? "Sin ingresos para este m?todo" : "Sin ingresos registrados",
    mostrarMetodo: true,
    tipo: "ingreso",
  });

  renderTabla(gastos, egresosBody, {
    columnas: 7,
    textoVacio: metodoFiltro ? "Sin egresos para este m?todo" : "Sin egresos registrados",
    mostrarMetodo: true,
    tipo: "gasto",
  });

  const totalIngresos = ingresos.reduce(
    (acc, t) => acc + Number(t.monto || 0),
    0
  );
  const totalGastos = gastos.reduce(
    (acc, t) => acc + Number(t.monto || 0),
    0
  );
  const resultado = totalIngresos - totalGastos;

  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setText("ingresos-total-card", formatMoney(totalIngresos));
  setText("ingresos-total-chip", formatMoney(totalIngresos));
  setText("egresos-total-card", formatMoney(totalGastos));
  setText("egresos-total-chip", formatMoney(totalGastos));
  setText("flujo-total-chip", formatMoney(resultado));
  actualizarChipEstado("flujo-total-chip", resultado);
  renderFiltroMetodoFinanzas();
}

function actualizarChipEstado(strongId, valor) {
  const strongEl = document.getElementById(strongId);
  if (!strongEl) return;
  const chip = strongEl.closest(".ing-eg-chip");
  if (!chip) return;
  chip.classList.remove("success", "danger", "neutral");
  if (valor > 0) {
    chip.classList.add("success");
  } else if (valor < 0) {
    chip.classList.add("danger");
  } else {
    chip.classList.add("neutral");
  }
}

function prefillTransaccion(id, tipoForzado) {
  const transacciones = state.finanzas || [];
  const tx = transacciones.find((t) => String(t.id) === String(id));
  const tipo = tipoForzado || (tx ? tx.tipo : "ingreso");
  const modalId =
    tipo === "gasto" ? "modal-form-egreso" : "modal-form-ingreso";
  const formId = tipo === "gasto" ? "form-egreso-rapido" : "form-ingreso-rapido";
  const form = document.getElementById(formId);

  if (!form) return;

  const setValue = (name, value) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) field.value = value ?? "";
  };

  if (!tx) {
    setValue("transaccion_id", "");
    setValue("fecha", "");
    setValue("mes_manual", "");
    setValue("categoria", "");
    setValue("metodo_pago", "");
    setValue("descripcion", "");
    setValue("monto", "");
    openModal(modalId);
    return;
  }

  const fechaRaw = tx.fecha || tx.created_at || "";
  const fechaNormalizada = fechaRaw.includes("T")
    ? fechaRaw.split("T")[0]
    : fechaRaw;
  const mesValor = tx.mes_manual || tx.mes || obtenerMesTransaccion(tx) || "";

  setValue("transaccion_id", tx.id || "");
  setValue("fecha", fechaNormalizada);
  setValue("mes_manual", mesValor ? String(mesValor) : "");
  setValue("categoria", tx.categoria || "");
  setValue("metodo_pago", tx.metodo_pago || "");
  setValue("descripcion", tx.descripcion || "");
  setValue("monto", tx.monto || "");

  openModal(modalId);
}

function obtenerCategoriaTop(transacciones, tipo) {
  const totales = new Map();
  (transacciones || []).forEach((t) => {
    if (!t || t.tipo !== tipo) return;
    const categoria = (t.categoria || "").trim() || "Sin categoria";
    const monto = Number(t.monto || 0);
    const montoSeguro = Number.isFinite(monto) ? monto : 0;
    totales.set(categoria, (totales.get(categoria) || 0) + montoSeguro);
  });

  let top = { categoria: "-", monto: 0 };
  for (const [categoria, monto] of totales.entries()) {
    if (top.categoria === "-" || monto > top.monto) {
      top = { categoria, monto };
    }
  }
  return top;
}

function renderReporteMensual() {
  const body = document.getElementById("reporte-mensual-body");
  if (!body) return;

  const { resumen, saldoAcumulado } = calcularResumenMensual();

  const filas = [
    { label: "Ingresos", key: "ingresos", clase: "text-success" },
    { label: "Egresos", key: "gastos", clase: "text-danger" },
    { label: "Resultado", key: "resultado", clase: "text-strong" },
  ]
    .map((row) => {
      const rowClass =
        row.key === "ingresos"
          ? "monthly-ingresos"
          : row.key === "gastos"
          ? "monthly-egresos"
          : "monthly-resultado";
      const celdas = resumen
        .map((mes) => {
          const valor = mes[row.key] || 0;
          const claseExtra =
            row.key === "resultado"
              ? valor < 0
                ? "amount-negative"
                : "amount-positive"
              : row.key === "gastos"
              ? "amount-negative"
              : "amount-positive";
          return `<td class="${row.clase} ${claseExtra}">${formatMoney(valor)}</td>`;
        })
        .join("");
      return `<tr class="${rowClass}"><th>${row.label}</th>${celdas}</tr>`;
    })
    .join("");

    body.innerHTML = filas;

    const totalIngresos = resumen.reduce((acc, m) => acc + m.ingresos, 0);
    const totalGastos = resumen.reduce((acc, m) => acc + m.gastos, 0);
    const saldo = totalIngresos - totalGastos;

  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setText("reporte-ingresos-anual", formatMoney(totalIngresos));
  setText("reporte-egresos-anual", formatMoney(totalGastos));
  setText("reporte-saldo-anual", formatMoney(saldo));
  actualizarChipEstado("reporte-saldo-anual", saldo);

  const mesTopIngresos = resumen.reduce(
    (best, mes, idx) =>
      mes.ingresos > best.monto ? { mes: idx, monto: mes.ingresos } : best,
    { mes: null, monto: 0 }
  );
  const mesTopGastos = resumen.reduce(
    (best, mes, idx) =>
      mes.gastos > best.monto ? { mes: idx, monto: mes.gastos } : best,
    { mes: null, monto: 0 }
  );

  setText(
    "mes-top-ingresos",
    mesTopIngresos.mes !== null ? MESES_LARGOS[mesTopIngresos.mes] : "-"
  );
  setText(
    "mes-top-ingresos-monto",
    formatMoney(mesTopIngresos.monto || 0)
  );
  setText(
    "mes-top-gastos",
    mesTopGastos.mes !== null ? MESES_LARGOS[mesTopGastos.mes] : "-"
  );
  setText("mes-top-gastos-monto", formatMoney(mesTopGastos.monto || 0));

  const topIngresosCategoria = obtenerCategoriaTop(state.finanzas || [], "ingreso");
  const topGastosCategoria = obtenerCategoriaTop(state.finanzas || [], "gasto");
  setText("categoria-top-ingresos", topIngresosCategoria.categoria);
  setText(
    "categoria-top-ingresos-monto",
    formatMoney(topIngresosCategoria.monto || 0)
  );
  setText("categoria-top-egresos", topGastosCategoria.categoria);
  setText(
    "categoria-top-egresos-monto",
    formatMoney(topGastosCategoria.monto || 0)
  );

  renderGraficosFlujo(resumen, saldoAcumulado);
}

function renderGraficosFlujo(resumen = [], saldoAcumulado = []) {
  const ivg = document.getElementById("chart-ivg");
  const saldo = document.getElementById("chart-saldo");
  if (!ivg || !saldo) return;

  if (!resumen.length) {
    const data = calcularResumenMensual();
    resumen = data.resumen;
    saldoAcumulado = data.saldoAcumulado;
  }

  const ingresos = resumen.map((m) => m.ingresos || 0);
  const gastos = resumen.map((m) => m.gastos || 0);
  const saldoData = saldoAcumulado && saldoAcumulado.length
    ? saldoAcumulado
    : resumen.reduce((acc, m, idx) => {
        const prev = idx === 0 ? 0 : acc[idx - 1];
        acc.push(prev + (m.resultado || 0));
        return acc;
      }, []);

  renderBarChart(ivg, MESES_CORTOS, [
    { label: "Ingresos", color: "#22c55e", data: ingresos },
    { label: "Egresos", color: "#3b82f6", data: gastos },
  ]);

  renderLineChart(saldo, MESES_CORTOS, [
    { label: "Saldo acumulado", color: "#0ea5e9", data: saldoData },
  ]);
}

function renderLineChart(container, labels, series) {
  const width = 520;
  const height = 220;
  const padding = 46;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;
  const flatValues = series.flatMap((s) => s.data);
  const minVal = Math.min(0, ...flatValues);
  const maxVal = Math.max(0, ...flatValues);
  const range = maxVal - minVal || 1;
  const step = getNiceStep(range, 4);
  const yMin = Math.floor(minVal / step) * step;
  const yMax = Math.ceil(maxVal / step) * step;
  const yRange = yMax - yMin || 1;
  const xStep = labels.length > 1 ? usableW / (labels.length - 1) : 0;

  const formatAxisNumber = (value) => {
    const isInt = Math.abs(value % 1) < 0.0001;
    return value.toLocaleString("es-CL", {
      maximumFractionDigits: isInt ? 0 : 1,
    });
  };

  const polyline = (data) =>
    data
      .map((v, i) => {
        const x = padding + xStep * i;
        const y = padding + ((yMax - v) / yRange) * usableH;
        return `${x},${y}`;
      })
      .join(" ");

  const legends = series
    .map(
      (s) =>
        `<span class="chart-legend"><i style="background:${s.color}"></i>${s.label}</span>`
    )
    .join("");

  const svgLines = series
    .map(
      (s) =>
        `<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${polyline(
          s.data
        )}" />`
      )
      .join("");

  const yTicks = [];
  for (let t = yMin; t <= yMax + step / 2; t += step) {
    yTicks.push(Number(t.toFixed(2)));
  }

  const yGrid = yTicks
    .map((tick) => {
      const y = padding + ((yMax - tick) / yRange) * usableH;
      const stroke = tick === 0 ? "#94a3b8" : "#e2e8f0";
      return `
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${stroke}" stroke-width="1" />
        <text x="${padding - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="#94a3b8">${formatAxisNumber(tick)}</text>
      `;
    })
    .join("");

  const axisLines = `
    ${yGrid}
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e2e8f0" stroke-width="1" />
  `;

  const monthLabels = labels
    .map((m, i) => {
      const x = padding + xStep * i;
      const y = height - padding + 16;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#94a3b8">${m}</text>`;
    })
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico">
      ${axisLines}
      ${svgLines}
      ${monthLabels}
    </svg>
    <div class="chart-legend-row">${legends}</div>
  `;
}

function renderBarChart(container, labels, series) {
  const width = 520;
  const height = 220;
  const padding = 46;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;
  const flatValues = series.flatMap((s) => s.data);
  const minVal = Math.min(0, ...flatValues);
  const maxVal = Math.max(0, ...flatValues);
  const range = maxVal - minVal || 1;
  const step = getNiceStep(range, 4);
  const yMin = Math.floor(minVal / step) * step;
  const yMax = Math.ceil(maxVal / step) * step;
  const yRange = yMax - yMin || 1;
  const xStep = labels.length > 0 ? usableW / labels.length : 0;
  const barGroupWidth = xStep * 0.7;
  const barWidth = series.length ? barGroupWidth / series.length : 0;
  const zeroY = padding + ((yMax - 0) / yRange) * usableH;

  const formatAxisNumber = (value) => {
    const isInt = Math.abs(value % 1) < 0.0001;
    return value.toLocaleString("es-CL", {
      maximumFractionDigits: isInt ? 0 : 1,
    });
  };

  const yTicks = [];
  for (let t = yMin; t <= yMax + step / 2; t += step) {
    yTicks.push(Number(t.toFixed(2)));
  }

  const gridLines = yTicks
    .map((tick) => {
      const y = padding + ((yMax - tick) / yRange) * usableH;
      const stroke = tick === 0 ? "#94a3b8" : "#e2e8f0";
      return `
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${stroke}" stroke-width="1" />
        <text x="${padding - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="#94a3b8">${formatAxisNumber(tick)}</text>
      `;
    })
    .join("");

  const bars = series
    .map((s, seriesIndex) =>
      s.data
        .map((value, i) => {
          const x =
            padding +
            xStep * i +
            (xStep - barGroupWidth) / 2 +
            barWidth * seriesIndex;
          const yValue = padding + ((yMax - value) / yRange) * usableH;
          const barHeight = Math.max(2, Math.abs(zeroY - yValue));
          const y = value >= 0 ? yValue : zeroY;
          return `<rect x="${x}" y="${y}" width="${barWidth - 4}" height="${barHeight}" rx="3" fill="${s.color}" />`;
        })
        .join("")
    )
    .join("");

  const monthLabels = labels
    .map((m, i) => {
      const x = padding + xStep * i + xStep / 2;
      const y = height - padding + 16;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#94a3b8">${m}</text>`;
    })
    .join("");

  const legends = series
    .map(
      (s) =>
        `<span class="chart-legend"><i style="background:${s.color}"></i>${s.label}</span>`
    )
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico">
      ${gridLines}
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e2e8f0" stroke-width="1" />
      ${bars}
      ${monthLabels}
    </svg>
    <div class="chart-legend-row">${legends}</div>
  `;
}

function getNiceStep(range, targetTicks = 4) {
  const rough = range / targetTicks;
  const exponent = Math.floor(Math.log10(rough));
  const fraction = rough / Math.pow(10, exponent);
  let niceFraction = 1;
  if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function obtenerMesTransaccion(t) {
  const mesManual = Number(t.mes_manual || t.mes || 0);
  if (mesManual >= 1 && mesManual <= 12) return mesManual;

  const rawFecha = t.fecha || t.created_at;
  if (!rawFecha) return null;
  const fecha = new Date(
    rawFecha.includes("T") ? rawFecha : `${rawFecha}T00:00:00`
  );
  if (isNaN(fecha.getTime())) return null;
  return fecha.getMonth() + 1;
}

function obtenerMesNombre(transaccion) {
  const mes = obtenerMesTransaccion(transaccion);
  if (!mes) return "-";
  return MESES_CORTOS[mes - 1] || "-";
}

function ordenarTransaccionesPorFechaDesc(a, b) {
  const fechaA = obtenerTimestampSeguro(a);
  const fechaB = obtenerTimestampSeguro(b);
  return fechaB - fechaA;
}

function obtenerTimestampSeguro(item) {
  const raw = item.fecha || item.created_at || item.updated_at;
  if (!raw) return 0;
  const fecha = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`);
  return fecha.getTime() || 0;
}

async function guardarIngresoRapido(event) {
  await guardarMovimientoRapido(event, "ingreso");
}

async function guardarEgresoRapido(event) {
  await guardarMovimientoRapido(event, "gasto");
}


async function guardarMovimientoRapido(event, tipo) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const transaccionId = formData.get("transaccion_id");
  const mesManual = formData.get("mes_manual");
  const monto = parseFloat(formData.get("monto") || "0");
  const categoria = formData.get("categoria");
  const descripcion = formData.get("descripcion");
  const fechaForm = formData.get("fecha");
  const metodoPago = formData.get("metodo_pago");

  if (!monto || !categoria) {
    mostrarError("Completa monto y categoria");
    return;
  }

  const fecha =
    fechaForm && fechaForm.trim().length > 0
      ? fechaForm
      : new Date().toISOString().split("T")[0];

  const payload = {
    tipo,
    monto,
    categoria,
    descripcion,
    fecha,
  };

  if (mesManual) {
    payload.mes_manual = mesManual;
  }

  if (metodoPago) {
    payload.metodo_pago = metodoPago;
  }

  try {
    const url = transaccionId
      ? `${API_URL}/api/finanzas-personales/${transaccionId}`
      : `${API_URL}/api/finanzas-personales`;
    const method = transaccionId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito(transaccionId ? "Movimiento actualizado" : "Movimiento guardado");
      event.target.reset();
      const hiddenId = event.target.querySelector('input[name="transaccion_id"]');
      if (hiddenId) hiddenId.value = "";
      const fechaInput = event.target.querySelector('input[name="fecha"]');
      if (fechaInput) {
        fechaInput.value = new Date().toISOString().split("T")[0];
      }
      if (event.target.id === "form-ingreso-rapido") {
        closeModal("modal-form-ingreso");
      } else if (event.target.id === "form-egreso-rapido") {
        closeModal("modal-form-egreso");
      }
      cargarFinanzas();
    } else {
      mostrarError(data.error || "No se pudo guardar el movimiento");
    }
  } catch (error) {
    console.error("Error guardando movimiento:", error);
    mostrarError("Error al guardar movimiento");
  }
}


async function guardarTransaccion(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const transaccion = {
    tipo: formData.get("tipo"),
    monto: 0,
    categoria: formData.get("categoria"),
    descripcion: formData.get("descripcion"),
    fecha: formData.get("fecha") || new Date().toISOString().split("T")[0],
    metodo_pago: formData.get("metodo_pago"),
  };

  try {
    const res = await fetch(`${API_URL}/api/finanzas-personales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaccion),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Transacci├│n registrada exitosamente");
      closeModal("modal-transaccion");
      cargarFinanzas();
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else {
      mostrarError(data.error || "Error al registrar transacci├│n");
    }
  } catch (error) {
    console.error("Error guardando transacci├│n:", error);
    mostrarError("Error al guardar transacci├│n");
  }
}

async function guardarTransferencia(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const origen = formData.get("metodo_origen");
  const destino = formData.get("metodo_destino");
  const monto = parseFloat(formData.get("monto") || "0");
  const fecha = formData.get("fecha") || new Date().toISOString().split("T")[0];
  const nota = (formData.get("descripcion") || "").trim();

  if (!origen || !destino) {
    mostrarError("Selecciona cuenta origen y destino");
    return;
  }

  if (origen === destino) {
    mostrarError("La cuenta origen y destino deben ser diferentes");
    return;
  }

  if (!monto || monto <= 0) {
    mostrarError("Ingresa un monto v?lido");
    return;
  }

  if (!state.categoriasFinanzas.includes("Transferencia")) {
    state.categoriasFinanzas.push("Transferencia");
    guardarCategoriasFinanzas();
  }

  const nombreOrigen = formatMetodoPago(origen);
  const nombreDestino = formatMetodoPago(destino);

  const descripcionSalida = nota
    ? `${nota} - Transferencia a ${nombreDestino}`
    : `Transferencia a ${nombreDestino}`;
  const descripcionEntrada = nota
    ? `${nota} - Transferencia desde ${nombreOrigen}`
    : `Transferencia desde ${nombreOrigen}`;

  const payloadSalida = {
    tipo: "gasto",
    monto,
    categoria: "Transferencia",
    descripcion: descripcionSalida,
    fecha,
    metodo_pago: origen,
  };

  const payloadEntrada = {
    tipo: "ingreso",
    monto,
    categoria: "Transferencia",
    descripcion: descripcionEntrada,
    fecha,
    metodo_pago: destino,
  };

  try {
    const [resSalida, resEntrada] = await Promise.all([
      fetch(`${API_URL}/api/finanzas-personales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadSalida),
      }),
      fetch(`${API_URL}/api/finanzas-personales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadEntrada),
      }),
    ]);

    const dataSalida = await resSalida.json();
    const dataEntrada = await resEntrada.json();

    if (dataSalida.ok && dataEntrada.ok) {
      mostrarExito("Transferencia registrada");
      form.reset();
      const fechaInput = form.querySelector('input[name="fecha"]');
      if (fechaInput) {
        fechaInput.value = new Date().toISOString().split("T")[0];
      }
      cargarFinanzas();
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else if (dataSalida.ok && !dataEntrada.ok) {
      mostrarError(
        dataEntrada.error || "La salida se registr?, pero fall? la entrada"
      );
    } else if (!dataSalida.ok && dataEntrada.ok) {
      mostrarError(
        dataSalida.error || "La entrada se registr?, pero fall? la salida"
      );
    } else {
      mostrarError(
        dataSalida.error || dataEntrada.error || "No se pudo registrar la transferencia"
      );
    }
  } catch (error) {
    console.error("Error guardando transferencia:", error);
    mostrarError("Error al guardar transferencia");
  }
}

function swapTransferenciaCuentas() {
  const form = document.getElementById("form-transferencia");
  if (!form) return;
  const origen = form.querySelector('[name="metodo_origen"]');
  const destino = form.querySelector('[name="metodo_destino"]');
  if (!origen || !destino) return;
  const temp = origen.value;
  origen.value = destino.value;
  destino.value = temp;
}

function resetTransferenciaForm() {
  const form = document.getElementById("form-transferencia");
  if (!form) return;
  form.reset();
  const fechaInput = form.querySelector('input[name="fecha"]');
  if (fechaInput) {
    fechaInput.value = new Date().toISOString().split("T")[0];
  }
}

async function eliminarTransaccion(transaccionId) {
  if (!confirm("┬┐Est├ís seguro de eliminar esta transacci├│n?")) return;

  try {
    const res = await fetch(
      `${API_URL}/api/finanzas-personales/${transaccionId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Transacci├│n eliminada");
      cargarFinanzas();
    } else {
      mostrarError(data.error || "Error al eliminar transacci├│n");
    }
  } catch (error) {
    console.error("Error eliminando transacci├│n:", error);
    mostrarError("Error al eliminar transacci├│n");
  }
}

// ==================== OBJETIVOS ====================

async function cargarObjetivos() {
  const container = document.getElementById("objetivos-list");

  try {
    const res = await fetch(`${API_URL}/api/objetivos`);
    const data = await res.json();
    state.objetivos = data.objetivos;

    if (!data.ok || !data.objetivos || data.objetivos.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">­ƒÄ»</div>
                    <div class="empty-state-text">No tienes objetivos registrados</div>
                    <button class="btn-primary" onclick="openModal('modal-objetivo')">Crear mi primer objetivo</button>
                </div>
            `;
      return;
    }

    let html = "";
    data.objetivos.forEach((objetivo) => {
      html += renderObjetivoCard(objetivo);
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando objetivos:", error);
    container.innerHTML =
      '<div class="empty-state">Error al cargar objetivos</div>';
  }
}

function renderObjetivoCard(objetivo) {
  const progreso = objetivo.progreso_porcentaje || 0;
  const estadoBadge = {
    planificado: "­ƒôï Planificado",
    en_progreso: "­ƒÜÇ En Progreso",
    pausado: "ÔÅ©´©Å Pausado",
    completado: "Ô£à Completado",
    cancelado: "ÔØî Cancelado",
  };

  return `
        <div class="objetivo-card ${objetivo.prioridad || "media"}">
            <div class="objetivo-header">
                <div>
                    <div class="objetivo-titulo">${objetivo.titulo}</div>
                    <span class="objetivo-categoria">${
                      objetivo.categoria || "personal"
                    }</span>
                </div>
                <button class="btn-danger" onclick="eliminarObjetivo(${
                  objetivo.id
                })">­ƒùæ´©Å</button>
            </div>
            
            ${
              objetivo.descripcion
                ? `<p style="color: #666; margin: 10px 0;">${objetivo.descripcion}</p>`
                : ""
            }
            
            <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 0.9em; color: #999;">
                <span>${estadoBadge[objetivo.estado] || objetivo.estado}</span>
                ${
                  objetivo.fecha_objetivo
                    ? `<span>­ƒôà ${formatDate(objetivo.fecha_objetivo)}</span>`
                    : ""
                }
            </div>
            
            <div class="progreso-container">
                <div class="progreso-bar">
                    <div class="progreso-fill" style="width: ${progreso}%;"></div>
                </div>
                <div class="progreso-text">${progreso}% completado</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <span style="font-size: 0.9em; color: #999;">
                    ${objetivo.total_hitos || 0} hitos ÔÇó ${
    objetivo.hitos_completados || 0
  } completados
                </span>
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.85em;" 
                        onclick="verDetallesObjetivo(${objetivo.id})">
                    Ver detalles
                </button>
            </div>
        </div>
    `;
}

async function guardarObjetivo(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const objetivo = {
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    prioridad: formData.get("prioridad"),
    fecha_objetivo: formData.get("fecha_objetivo"),
    color: formData.get("color"),
  };

  try {
    const res = await fetch(`${API_URL}/api/objetivos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objetivo),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Objetivo creado exitosamente");
      closeModal("modal-objetivo");
      cargarObjetivos();
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else {
      mostrarError(data.error || "Error al crear objetivo");
    }
  } catch (error) {
    console.error("Error guardando objetivo:", error);
    mostrarError("Error al guardar objetivo");
  }
}

async function eliminarObjetivo(objetivoId) {
  if (!confirm("┬┐Est├ís seguro de eliminar este objetivo?")) return;

  try {
    const res = await fetch(`${API_URL}/api/objetivos/${objetivoId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Objetivo eliminado");
      cargarObjetivos();
      // Refrescar dashboard si estamos en esa pesta├▒a
      if (state.currentTab === "dashboard") {
        cargarDashboard();
      }
    } else {
      mostrarError(data.error || "Error al eliminar objetivo");
    }
  } catch (error) {
    console.error("Error eliminando objetivo:", error);
    mostrarError("Error al eliminar objetivo");
  }
}

async function verDetallesObjetivo(objetivoId) {
  try {
    state.detalleObjetivoId = objetivoId;
    // Obtener datos del objetivo
    const res = await fetch(`${API_URL}/api/objetivos/${objetivoId}`);
    const data = await res.json();

    if (!data.ok) {
      mostrarError("Error al cargar detalles del objetivo");
      return;
    }

    const objetivo = data.objetivo;
    const estadoBadge = {
      planificado: "­ƒôï Planificado",
      en_progreso: "­ƒÜÇ En Progreso",
      pausado: "ÔÅ©´©Å Pausado",
      completado: "Ô£à Completado",
      cancelado: "ÔØî Cancelado",
    };

    const container = document.getElementById("objetivo-detalle-content");

    let html = `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 10px 0; font-size: 1.8em;">${
              objetivo.titulo
            }</h3>
            <div style="display: flex; gap: 10px; align-items: center;">
              <span class="objetivo-categoria">${
                objetivo.categoria || "personal"
              }</span>
              <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.85em; background: ${
                objetivo.prioridad === "critica"
                  ? "#ff4444"
                  : objetivo.prioridad === "alta"
                  ? "#ff9800"
                  : objetivo.prioridad === "media"
                  ? "#2196F3"
                  : "#9e9e9e"
              }; color: white;">
                ${objetivo.prioridad || "media"}
              </span>
              <span>${estadoBadge[objetivo.estado] || objetivo.estado}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 2em; font-weight: bold; color: #2196F3;">
              ${objetivo.progreso_porcentaje || 0}%
            </div>
            <div style="color: #999; font-size: 0.9em;">completado</div>
          </div>
        </div>

        ${
          objetivo.descripcion
            ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong>Descripci├│n:</strong><br>
            ${objetivo.descripcion}
          </div>
        `
            : ""
        }

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          ${
            objetivo.fecha_inicio
              ? `
            <div>
              <div style="color: #999; font-size: 0.85em;">Fecha de Inicio</div>
              <div style="font-weight: 600;">­ƒôà ${formatDate(
                objetivo.fecha_inicio
              )}</div>
            </div>
          `
              : ""
          }
          ${
            objetivo.fecha_objetivo
              ? `
            <div>
              <div style="color: #999; font-size: 0.85em;">Fecha Objetivo</div>
              <div style="font-weight: 600;">­ƒÄ» ${formatDate(
                objetivo.fecha_objetivo
              )}</div>
            </div>
          `
              : ""
          }
          ${
            objetivo.fecha_completado
              ? `
            <div>
              <div style="color: #999; font-size: 0.85em;">Fecha Completado</div>
              <div style="font-weight: 600;">Ô£à ${formatDate(
                objetivo.fecha_completado
              )}</div>
            </div>
          `
              : ""
          }
        </div>

        <div class="progreso-container" style="margin-bottom: 30px;">
          <div class="progreso-bar">
            <div class="progreso-fill" style="width: ${
              objetivo.progreso_porcentaje || 0
            }%;"></div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0;">Hitos (${objetivo.total_hitos || 0})</h4>
            <button class="btn-secondary" onclick="abrirModalHito(${objetivoId})" style="padding: 8px 16px; font-size: 0.9em;">
              Ô×ò Agregar Hito
            </button>
          </div>
          <div id="hitos-list-${objetivoId}"></div>
        </div>

        ${
          objetivo.notas
            ? `
          <div style="margin-top: 20px;">
            <strong>Notas:</strong><br>
            <div style="background: #fffbea; border-left: 3px solid #ffc107; padding: 10px; margin-top: 5px;">
              ${objetivo.notas}
            </div>
          </div>
        `
            : ""
        }

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-secondary" onclick="closeModal('modal-objetivo-detalle')">Cerrar</button>
          <button class="btn-primary" onclick="editarObjetivo(${objetivoId})">Editar Objetivo</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Cargar hitos del objetivo
    await cargarHitos(objetivoId);

    // Abrir modal
    openModal("modal-objetivo-detalle");
  } catch (error) {
    console.error("Error cargando detalles:", error);
    mostrarError("Error al cargar detalles del objetivo");
  }
}

async function cargarHitos(objetivoId) {
  try {
    const res = await fetch(`${API_URL}/api/objetivos/${objetivoId}/hitos`);
    const data = await res.json();

    const container = document.getElementById(`hitos-list-${objetivoId}`);

    if (!data.ok || !data.hitos || data.hitos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #999;">
          No hay hitos definidos para este objetivo
        </div>
      `;
      return;
    }

    let html =
      '<div style="display: flex; flex-direction: column; gap: 10px;">';
    data.hitos.forEach((hito) => {
      const completado = hito.completado || false;
      html += `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${
          completado ? "#e8f5e9" : "#fff"
        }; border: 1px solid #e0e0e0; border-radius: 8px;">
          <input type="checkbox" 
                 ${completado ? "checked" : ""}
                 onchange="toggleHito(${objetivoId}, ${hito.id}, this.checked)"
                 style="width: 20px; height: 20px; cursor: pointer;">
          <div style="flex: 1;">
            <div style="font-weight: 600; ${
              completado ? "text-decoration: line-through; color: #999;" : ""
            }">${hito.titulo}</div>
            ${
              hito.descripcion
                ? `<div style="color: #666; font-size: 0.9em; margin-top: 4px;">${hito.descripcion}</div>`
                : ""
            }
            ${
              hito.fecha_limite
                ? `<div style="color: #999; font-size: 0.85em; margin-top: 4px;">­ƒôà ${formatDate(
                    hito.fecha_limite
                  )}</div>`
                : ""
            }
          </div>
          ${
            completado && hito.fecha_completado
              ? `
            <div style="color: #4caf50; font-size: 0.85em;">Ô£à ${formatDate(
              hito.fecha_completado
            )}</div>
          `
              : ""
          }
          <button class="btn-danger" onclick="eliminarHito(${objetivoId}, ${
        hito.id
      })" style="padding: 6px 10px;">­ƒùæ´©Å</button>
        </div>
      `;
    });
    html += "</div>";

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando hitos:", error);
  }
}

async function toggleHito(objetivoId, hitoId, completado) {
  try {
    const res = await fetch(
      `${API_URL}/api/objetivos/${objetivoId}/hitos/${hitoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completado }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      // Recargar detalles para actualizar progreso
      await verDetallesObjetivo(objetivoId);
    } else {
      mostrarError(data.error || "Error al actualizar hito");
    }
  } catch (error) {
    console.error("Error actualizando hito:", error);
    mostrarError("Error al actualizar hito");
  }
}

function abrirModalHito(objetivoId) {
  state.detalleObjetivoId = objetivoId;
  const form = document.getElementById("form-hito");
  if (form) form.reset();
  openModal("modal-hito");
}

async function guardarHitoDesdeFormulario(event) {
  event.preventDefault();
  const objetivoId = state.detalleObjetivoId;
  if (!objetivoId) {
    mostrarError("No se encontr├│ el objetivo activo");
    return;
  }

  const formData = new FormData(event.target);
  const hito = {
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    fecha_limite: formData.get("fecha_limite") || null,
  };

  await guardarHito(objetivoId, hito);
  closeModal("modal-hito");
}

async function guardarHito(objetivoId, hito) {
  try {
    const res = await fetch(`${API_URL}/api/objetivos/${objetivoId}/hitos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hito),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Hito agregado");
      await verDetallesObjetivo(objetivoId);
    } else {
      mostrarError(data.error || "Error al crear hito");
    }
  } catch (error) {
    console.error("Error guardando hito:", error);
    mostrarError("Error al guardar hito");
  }
}

async function eliminarHito(objetivoId, hitoId) {
  if (!confirm("┬┐Est├ís seguro de eliminar este hito?")) return;

  try {
    const res = await fetch(
      `${API_URL}/api/objetivos/${objetivoId}/hitos/${hitoId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Hito eliminado");
      await verDetallesObjetivo(objetivoId);
    } else {
      mostrarError(data.error || "Error al eliminar hito");
    }
  } catch (error) {
    console.error("Error eliminando hito:", error);
    mostrarError("Error al eliminar hito");
  }
}

function editarObjetivo(objetivoId) {
  alert("Funcionalidad de edici├│n en desarrollo. ID: " + objetivoId);
}

// ==================== DEUDAS ====================

async function cargarDeudas() {
  const container = document.getElementById("deudas-list");

  try {
    // Cargar resumen de deudas
    const resResumen = await fetch(`${API_URL}/api/deudas/resumen`);
    const dataResumen = await resResumen.json();

    if (dataResumen.ok) {
      const r = dataResumen.resumen;
      document.getElementById("deudas-total").textContent = formatMoney(
        r.monto_total || 0
      );
      document.getElementById("deudas-pagado").textContent = formatMoney(
        r.monto_pagado || 0
      );
      document.getElementById("deudas-pendiente").textContent = formatMoney(
        r.monto_pendiente || 0
      );
      document.getElementById("deudas-activas").textContent =
        r.deudas_activas || 0;
    }

    // Cargar deudas
    const res = await fetch(`${API_URL}/api/deudas`);
    const data = await res.json();

    if (!data.ok || !data.deudas || data.deudas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">­ƒôï</div>
          <div class="empty-state-text">No tienes deudas registradas</div>
          <button class="btn-primary" onclick="openModal('modal-deuda')">Registrar mi primera deuda</button>
        </div>
      `;
      return;
    }

    let html = "";
    data.deudas.forEach((deuda) => {
      const porcentaje =
        deuda.monto_total > 0
          ? Math.round((deuda.monto_pagado / deuda.monto_total) * 100)
          : 0;
      const esActiva = deuda.estado === "activa";

      html += `
        <div class="deuda-item ${deuda.estado}">
          <div class="deuda-header">
            <div>
              <div class="deuda-acreedor">${deuda.acreedor}</div>
              ${
                deuda.descripcion
                  ? `<div style="color: #999; font-size: 0.9em; margin-top: 4px;">${deuda.descripcion}</div>`
                  : ""
              }
            </div>
            <span class="deuda-estado ${
              deuda.estado
            }">${deuda.estado.toUpperCase()}</span>
          </div>

          <div class="deuda-info">
            <div class="deuda-info-item">
              <div class="deuda-info-label">Monto Total</div>
              <div class="deuda-info-value">${formatMoney(
                deuda.monto_total
              )}</div>
            </div>
            <div class="deuda-info-item">
              <div class="deuda-info-label">Pagado</div>
              <div class="deuda-info-value" style="color: #4caf50;">${formatMoney(
                deuda.monto_pagado
              )}</div>
            </div>
            <div class="deuda-info-item">
              <div class="deuda-info-label">Pendiente</div>
              <div class="deuda-info-value" style="color: #f44336;">${formatMoney(
                deuda.monto_pendiente
              )}</div>
            </div>
            ${
              deuda.cuota_mensual
                ? `
              <div class="deuda-info-item">
                <div class="deuda-info-label">Cuota Mensual</div>
                <div class="deuda-info-value">${formatMoney(
                  deuda.cuota_mensual
                )}</div>
              </div>
            `
                : ""
            }
            ${
              deuda.tasa_interes
                ? `
              <div class="deuda-info-item">
                <div class="deuda-info-label">Inter├®s</div>
                <div class="deuda-info-value">${deuda.tasa_interes}%</div>
              </div>
            `
                : ""
            }
          </div>

          <div class="deuda-progreso">
            <div class="deuda-progreso-label">
              <span>Progreso de pago</span>
              <span>${porcentaje}%</span>
            </div>
            <div class="deuda-progreso-bar">
              <div class="deuda-progreso-fill" style="width: ${porcentaje}%;"></div>
            </div>
          </div>

          <div class="deuda-acciones">
            ${
              esActiva
                ? `
              <button class="btn-pagar" onclick="abrirModalPagar(${deuda.id})">
                ­ƒÆ░ Registrar Pago
              </button>
            `
                : ""
            }
            <button class="btn-danger" onclick="eliminarDeuda(${deuda.id})">
              ­ƒùæ´©Å Eliminar
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Error cargando deudas:", error);
    container.innerHTML =
      '<div class="empty-state">Error al cargar deudas</div>';
  }
}

async function guardarDeuda(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const deuda = {
    acreedor: formData.get("acreedor"),
    descripcion: formData.get("descripcion"),
    monto_total: parseFloat(formData.get("monto_total")),
    cuota_mensual: formData.get("cuota_mensual")
      ? parseFloat(formData.get("cuota_mensual"))
      : null,
    tasa_interes: formData.get("tasa_interes")
      ? parseFloat(formData.get("tasa_interes"))
      : 0,
    fecha_inicio:
      formData.get("fecha_inicio") || new Date().toISOString().split("T")[0],
    fecha_vencimiento: formData.get("fecha_vencimiento") || null,
    proxima_cuota: formData.get("proxima_cuota") || null,
    metodo_pago: formData.get("metodo_pago"),
    notas: formData.get("notas"),
  };

  try {
    const res = await fetch(`${API_URL}/api/deudas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deuda),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Deuda registrada exitosamente");
      closeModal("modal-deuda");
      cargarDeudas();
    } else {
      mostrarError(data.error || "Error al registrar deuda");
    }
  } catch (error) {
    console.error("Error guardando deuda:", error);
    mostrarError("Error al guardar deuda");
  }
}

function abrirModalPagar(deudaId) {
  state.deudaId = deudaId;
  const form = document.getElementById("form-pago-deuda");
  if (form) form.reset();
  openModal("modal-pagar-deuda");
}

async function registrarPagoDeuda(event) {
  event.preventDefault();

  const deudaId = state.deudaId;
  if (!deudaId) {
    mostrarError("No se encontr├│ la deuda");
    return;
  }

  const formData = new FormData(event.target);
  const pago = {
    monto: 0,
    fecha: formData.get("fecha") || new Date().toISOString().split("T")[0],
    metodo_pago: formData.get("metodo_pago"),
    descripcion: formData.get("descripcion"),
  };

  try {
    const res = await fetch(`${API_URL}/api/deudas/${deudaId}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pago),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Pago registrado exitosamente");
      closeModal("modal-pagar-deuda");
      cargarDeudas();
    } else {
      mostrarError(data.error || "Error al registrar pago");
    }
  } catch (error) {
    console.error("Error registrando pago:", error);
    mostrarError("Error al registrar pago");
  }
}

async function eliminarDeuda(deudaId) {
  if (!confirm("┬┐Est├ís seguro de eliminar esta deuda?")) return;

  try {
    const res = await fetch(`${API_URL}/api/deudas/${deudaId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Deuda eliminada");
      cargarDeudas();
    } else {
      mostrarError(data.error || "Error al eliminar deuda");
    }
  } catch (error) {
    console.error("Error eliminando deuda:", error);
    mostrarError("Error al eliminar deuda");
  }
}

// ==================== AGENDA ====================

async function cargarAgenda() {
  const calendario = document.getElementById("agenda-calendario");
  if (!calendario) return;

  const hoy = new Date();
  if (!state.agendaMes || !state.agendaAnio) {
    state.agendaMes = hoy.getMonth() + 1;
    state.agendaAnio = hoy.getFullYear();
  }

  const mes = state.agendaMes;
  const anio = state.agendaAnio;

  calendario.innerHTML = '<div class="loading"></div>';

  try {
    const res = await fetch(
      `${API_URL}/api/eventos-personales?anio=${anio}&mes=${mes}`
    );
    const data = await res.json();
    state.eventosPersonales = data.eventos || [];
  } catch (error) {
    console.error("Error cargando agenda:", error);
    mostrarError("No se pudo cargar la agenda");
    state.eventosPersonales = [];
  }

  const mesActualStr = `${anio}-${String(mes).padStart(2, "0")}`;
  if (
    !state.agendaFechaSeleccionada ||
    !state.agendaFechaSeleccionada.startsWith(mesActualStr)
  ) {
    state.agendaFechaSeleccionada = `${mesActualStr}-01`;
  }

  renderAgendaCalendario();
  renderEventosDia(state.agendaFechaSeleccionada);
  cargarProximoEventoAgenda();
}

async function cargarProximoEventoAgenda() {
  const target = document.getElementById("agenda-proximo-resumen");
  if (!target) return;

  try {
    const res = await fetch(`${API_URL}/api/eventos-personales/proximo`);
    const data = await res.json();

    if (!data.ok || !data.evento) {
      target.textContent = "Sin eventos pr├│ximos";
      return;
    }

    const ev = data.evento;
    const fechaLarga = formatFechaLarga(ev.fecha);
    const hora = ev.hora ? ev.hora.slice(0, 5) : "";

    target.innerHTML = `Pr├│ximo: <strong>${ev.titulo}</strong>${
      hora ? ` ÔÇó ${hora}` : ""
    } ÔÇó ${fechaLarga}`;
  } catch (error) {
    console.error("Error cargando pr├│ximo evento (agenda):", error);
    target.textContent = "Sin eventos pr├│ximos";
  }
}

function renderAgendaCalendario() {
  const container = document.getElementById("agenda-calendario");
  if (!container) return;

  const { agendaMes: mes, agendaAnio: anio } = state;
  const baseDate = new Date(anio, mes - 1, 1);
  const label = document.getElementById("agenda-mes-label");
  if (label) {
    label.textContent = baseDate.toLocaleDateString("es-CL", {
      month: "long",
      year: "numeric",
    });
  }

  container.innerHTML = "";

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const firstDay = new Date(anio, mes - 1, 1).getDay();
  const offset = (firstDay + 6) % 7; // hacer que la semana inicie en lunes

  for (let i = 0; i < offset; i++) {
    const filler = document.createElement("div");
    filler.style.visibility = "hidden";
    container.appendChild(filler);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(
      dia
    ).padStart(2, "0")}`;
    const eventosDia = (state.eventosPersonales || []).filter((evento) =>
      (evento.fecha || "").startsWith(fechaStr)
    );
    eventosDia.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

    const esHoy = esMismaFecha(fechaStr, new Date());
    const esSeleccionado = state.agendaFechaSeleccionada === fechaStr;

    const card = document.createElement("div");
    card.style.background = esSeleccionado ? "#eef2ff" : "#fff";
    card.style.border = esSeleccionado
      ? "2px solid #6366f1"
      : "1px solid #e5e7eb";
    card.style.borderRadius = "10px";
    card.style.padding = "12px";
    card.style.cursor = "pointer";
    card.style.boxShadow = "0 2px 4px rgba(0,0,0,0.04)";

    const eventosHtml = eventosDia.length
      ? eventosDia
          .map((ev) => {
            const hora = ev.hora ? ev.hora.slice(0, 5) : "";
            return `<div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; font-size: 0.95em; color: #0f172a; border-left: 3px solid #6366f1;">${
              hora ? `${hora} ÔÇó ` : ""
            }${ev.titulo}</div>`;
          })
          .join("")
      : '<div style="color: #94a3b8; font-size: 0.9em;">Sin eventos</div>';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-weight: 700; font-size: 1.1em;">${dia}</div>
        <div style="color: #94a3b8; font-size: 0.9em;">${
          esHoy ? "Hoy" : ""
        }</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">${eventosHtml}</div>
    `;

    card.onclick = () => {
      state.agendaFechaSeleccionada = fechaStr;
      renderAgendaCalendario();
      renderEventosDia(fechaStr);
    };

    container.appendChild(card);
  }
}

function renderEventosDia(fechaStr) {
  const lista = document.getElementById("agenda-lista-dia");
  const label = document.getElementById("agenda-dia-label");
  if (!lista) return;

  const eventosDia = (state.eventosPersonales || [])
    .filter((evento) => (evento.fecha || "").startsWith(fechaStr))
    .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

  if (label) {
    label.textContent = `Eventos del ${formatFechaLarga(fechaStr)}`;
  }

  if (eventosDia.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">­ƒùô´©Å</div>
        <div class="empty-state-text">Sin eventos para este d├¡a</div>
      </div>
    `;
    return;
  }

  let html =
    '<div class="deudas-container" style="grid-template-columns: 1fr;">';
  eventosDia.forEach((ev) => {
    const hora = ev.hora ? ev.hora.slice(0, 5) : "";
    html += `
      <div class="deuda-item" style="border-left: 4px solid #6366f1;">
        <div class="deuda-header">
          <div>
            <div class="deuda-acreedor">${ev.titulo}</div>
            <div style="color: #94a3b8; font-size: 0.9em;">${
              hora ? `${hora} ÔÇó ` : ""
            }${ev.ubicacion || ""}</div>
          </div>
          <button class="btn-danger" onclick="eliminarEventoPersonal(${
            ev.id
          })">­ƒùæ´©Å</button>
        </div>
        ${
          ev.descripcion
            ? `<div style="color: #475569; margin-top: 6px;">${ev.descripcion}</div>`
            : ""
        }
        ${
          ev.recordatorio
            ? `<div style="color: #94a3b8; margin-top: 6px; font-size: 0.9em;">­ƒöö ${ev.recordatorio}</div>`
            : ""
        }
      </div>
    `;
  });
  html += "</div>";

  lista.innerHTML = html;
}

function cambiarMesAgenda(delta) {
  const base = new Date(
    state.agendaAnio || new Date().getFullYear(),
    (state.agendaMes || new Date().getMonth() + 1) - 1 + delta,
    1
  );

  state.agendaMes = base.getMonth() + 1;
  state.agendaAnio = base.getFullYear();
  state.agendaFechaSeleccionada = `${state.agendaAnio}-${String(
    state.agendaMes
  ).padStart(2, "0")}-01`;

  cargarAgenda();
}

async function guardarEventoPersonal(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const nuevoEvento = {
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    fecha: formData.get("fecha"),
    hora: formData.get("hora"),
    ubicacion: formData.get("ubicacion"),
    recordatorio: formData.get("recordatorio"),
  };

  if (!nuevoEvento.fecha || !nuevoEvento.titulo) {
    mostrarError("T├¡tulo y fecha son obligatorios");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/eventos-personales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoEvento),
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Evento guardado");
      closeModal("modal-evento");
      const fechaEvento = new Date(nuevoEvento.fecha + "T00:00:00");
      if (!isNaN(fechaEvento)) {
        state.agendaMes = fechaEvento.getMonth() + 1;
        state.agendaAnio = fechaEvento.getFullYear();
        state.agendaFechaSeleccionada = nuevoEvento.fecha;
      }
      cargarAgenda();
    } else {
      mostrarError(data.error || "Error al guardar evento");
    }
  } catch (error) {
    console.error("Error guardando evento:", error);
    mostrarError("No se pudo guardar el evento");
  }
}

async function eliminarEventoPersonal(eventoId) {
  if (!confirm("┬┐Eliminar este evento?")) return;

  try {
    const res = await fetch(`${API_URL}/api/eventos-personales/${eventoId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.ok) {
      mostrarExito("Evento eliminado");
      cargarAgenda();
    } else {
      mostrarError(data.error || "No se pudo eliminar");
    }
  } catch (error) {
    console.error("Error eliminando evento:", error);
    mostrarError("Error al eliminar evento");
  }
}

// ==================== ENTRETENIMIENTO (LOCAL) ====================

function persistirEntretenimiento() {
  localStorage.setItem(
    "entretenimientoItems",
    JSON.stringify(state.entretenimiento)
  );
}

function cargarEntretenimiento() {
  try {
    const guardados = localStorage.getItem("entretenimientoItems");
    state.entretenimiento = guardados ? JSON.parse(guardados) : [];
    renderEntretenimiento();
  } catch (e) {
    console.error("Error cargando entretenimiento", e);
    state.entretenimiento = [];
  }
}

function filtrarEntretenimientoBase() {
  const buscar =
    document.getElementById("ent-buscar")?.value?.toLowerCase() || "";
  const tipo = document.getElementById("ent-filtro-tipo")?.value || "";
  const estado = document.getElementById("ent-filtro-estado")?.value || "";
  const plataforma =
    document.getElementById("ent-filtro-plataforma")?.value || "";

  return state.entretenimiento.filter((item) => {
    const matchTexto = (item.titulo || "").toLowerCase().includes(buscar);
    const matchTipo = !tipo || item.tipo === tipo;
    const matchEstado = !estado || item.estado === estado;
    const matchPlataforma = !plataforma || item.plataforma === plataforma;
    return matchTexto && matchTipo && matchEstado && matchPlataforma;
  });
}

function renderEntretenimiento() {
  const items = filtrarEntretenimientoBase();
  const countEl = document.getElementById("ent-count");
  if (countEl) countEl.textContent = `${items.length} ├¡tems`;
  renderKanbanEntretenimiento(items);
  renderTablaEntretenimiento(items);
  renderSiguienteEntretenimiento(items);
}

function renderKanbanEntretenimiento(items) {
  const columnas = {
    pendiente: document.getElementById("ent-col-pendiente"),
    en_curso: document.getElementById("ent-col-en_curso"),
    terminado: document.getElementById("ent-col-terminado"),
    recomendada: document.getElementById("ent-col-recomendada"),
  };
  Object.values(columnas).forEach((col) => {
    if (col) col.innerHTML = "";
  });

  items.forEach((item) => {
    const col = columnas[item.estado] || columnas.pendiente;
    if (!col) return;
    const badge = formatEstadoEntretenimiento(item.estado);
    const tipoLabel = formatTipoEntretenimiento(item.tipo);
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.innerHTML = `
      <h4>${item.titulo}</h4>
      <small>${tipoLabel} ÔÇó ${item.plataforma || "Sin plataforma"}</small><br>
      <small>${badge}</small><br>
      <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-secondary" style="padding:4px 8px;" onclick="editarEntretenimiento(${
          item.id
        })">Editar</button>
        <button class="btn-primary" style="padding:4px 8px;" onclick="marcarTerminadoEntretenimiento(${
          item.id
        })">Terminar</button>
      </div>
    `;
    col.appendChild(card);
  });
}

function renderTablaEntretenimiento(items) {
  const tbody = document.getElementById("ent-table-body");
  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    .map((item) => {
      const estado = formatEstadoEntretenimiento(item.estado);
      const tipo = formatTipoEntretenimiento(item.tipo);
      const fechas = formatFechasEntretenimiento(item);
      const rating = item.rating ? `Ô¡É ${item.rating}/5` : "-";
      return `
        <tr>
          <td>${item.titulo}${
        item.enlace
          ? ` <a href="${item.enlace}" target="_blank" rel="noopener">­ƒöù</a>`
          : ""
      }</td>
          <td>${tipo}</td>
          <td>${item.plataforma || "-"}</td>
          <td>${estado}</td>
          <td>${rating}</td>
          <td>${fechas}</td>
          <td>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn-secondary" onclick="editarEntretenimiento(${
                item.id
              })">Editar</button>
              <button class="btn-primary" onclick="marcarTerminadoEntretenimiento(${
                item.id
              })">Terminar</button>
              <button class="btn-danger" onclick="eliminarEntretenimiento(${
                item.id
              })">Borrar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSiguienteEntretenimiento(items) {
  const cont = document.getElementById("ent-next-list");
  if (!cont) return;
  const prioridades = { alta: 3, media: 2, baja: 1 };
  const proximos = items
    .filter((i) => i.estado === "pendiente" || i.estado === "en_curso")
    .sort(
      (a, b) =>
        (prioridades[b.prioridad] || 0) - (prioridades[a.prioridad] || 0) ||
        (a.created_at || 0) - (b.created_at || 0)
    )
    .slice(0, 3);

  if (!proximos.length) {
    cont.innerHTML = `<div class="empty-state">Agrega algo para ver/jugar</div>`;
    return;
  }

  cont.innerHTML = proximos
    .map(
      (i) => `
        <div class="objetivo-card" style="min-height:auto;">
          <div class="objetivo-title">${i.titulo}</div>
          <div class="objetivo-meta">${formatTipoEntretenimiento(
            i.tipo
          )} ÔÇó ${formatEstadoEntretenimiento(i.estado)}</div>
          <div class="objetivo-progress">${
            i.plataforma || "Sin plataforma"
          }</div>
        </div>
      `
    )
    .join("");
}

function abrirModalEntretenimiento(id = null) {
  entretenimientoEditando = null;
  const form = document.getElementById("form-entretenimiento");
  if (form) form.reset();
  const hiddenId = document.getElementById("ent-id");
  if (hiddenId) hiddenId.value = "";
  const titleEl = document.getElementById("ent-modal-title");
  if (titleEl) titleEl.textContent = "Nuevo ├¡tem";
  if (id) editarEntretenimiento(id, true);
  openModal("modal-entretenimiento");
}

function editarEntretenimiento(id, skipOpen = false) {
  const item = state.entretenimiento.find((i) => i.id === id);
  if (!item) return;
  entretenimientoEditando = id;
  const titleEl = document.getElementById("ent-modal-title");
  if (titleEl) titleEl.textContent = "Editar ├¡tem";
  document.getElementById("ent-id").value = id;
  document.getElementById("ent-titulo").value = item.titulo;
  document.getElementById("ent-tipo").value = item.tipo;
  document.getElementById("ent-plataforma").value = item.plataforma || "";
  document.getElementById("ent-estado").value = item.estado;
  document.getElementById("ent-prioridad").value = item.prioridad || "media";
  document.getElementById("ent-rating").value = item.rating || "";
  document.getElementById("ent-fecha-inicio").value = item.fecha_inicio || "";
  document.getElementById("ent-fecha-fin").value = item.fecha_fin || "";
  document.getElementById("ent-enlace").value = item.enlace || "";
  document.getElementById("ent-notas").value = item.notas || "";
  if (!skipOpen) openModal("modal-entretenimiento");
}

function guardarEntretenimiento(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const id = entretenimientoEditando || Date.now();
  const item = {
    id,
    titulo: data.get("titulo"),
    tipo: data.get("tipo"),
    plataforma: data.get("plataforma") || "",
    estado: data.get("estado"),
    prioridad: data.get("prioridad") || "media",
    rating: data.get("rating") ? parseInt(data.get("rating"), 10) : null,
    fecha_inicio: data.get("fecha_inicio") || "",
    fecha_fin: data.get("fecha_fin") || "",
    enlace: data.get("enlace") || "",
    notas: data.get("notas") || "",
    created_at: entretenimientoEditando
      ? state.entretenimiento.find((i) => i.id === id)?.created_at || Date.now()
      : Date.now(),
  };

  if (item.estado === "terminado" && !item.fecha_fin) {
    item.fecha_fin = new Date().toISOString().split("T")[0];
  }

  const existe = state.entretenimiento.findIndex((i) => i.id === id);
  if (existe >= 0) {
    state.entretenimiento[existe] = item;
  } else {
    state.entretenimiento.push(item);
  }

  persistirEntretenimiento();
  renderEntretenimiento();
  closeModal("modal-entretenimiento");
  entretenimientoEditando = null;
}

function eliminarEntretenimiento(id) {
  if (!confirm("┬┐Eliminar este ├¡tem?")) return;
  state.entretenimiento = state.entretenimiento.filter((i) => i.id !== id);
  persistirEntretenimiento();
  renderEntretenimiento();
}

function marcarTerminadoEntretenimiento(id) {
  const idx = state.entretenimiento.findIndex((i) => i.id === id);
  if (idx === -1) return;
  state.entretenimiento[idx].estado = "terminado";
  if (!state.entretenimiento[idx].fecha_fin) {
    state.entretenimiento[idx].fecha_fin = new Date()
      .toISOString()
      .split("T")[0];
  }
  persistirEntretenimiento();
  renderEntretenimiento();
}

function formatEstadoEntretenimiento(estado) {
  const map = {
    pendiente: "ÔÅ│ Pendiente",
    en_curso: "­ƒÜÇ En curso",
    terminado: "Ô£à Terminado",
    recomendada: "Ô¡É Recomendada",
  };
  return map[estado] || estado;
}

function formatTipoEntretenimiento(tipo) {
  const map = {
    juego: "­ƒÄ« Juego",
    serie: "­ƒô║ Serie",
    pelicula: "­ƒÄ¼ Pel├¡cula",
  };
  return map[tipo] || tipo;
}

function formatFechasEntretenimiento(item) {
  const ini = item.fecha_inicio ? item.fecha_inicio : "-";
  const fin = item.fecha_fin ? item.fecha_fin : "-";
  if (ini === "-" && fin === "-") return "-";
  return `${ini} ÔåÆ ${fin}`;
}

// ==================== UTILIDADES ====================

function formatMoney(amount) {
  const value = Number(amount || 0);
  const formatted = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `$${formatted}`;
}

// Mapeo de metodos de pago a nombres legibles
const METODOS_PAGO_LABELS = {
  junaeb: "Junaeb",
  banco_santander: "Banco Santander",
  santander_cc_1: "Banco Santander CC 1",
  santander_cc_2: "Banco Santander CC 2",
  santander_ahorro: "Banco Santander Ahorro",
  banco_estado: "Banco Estado",
  banco_estado_rut: "Banco Estado CuentaRUT",
  banco_estado_ahorro: "Banco Estado Ahorro Premium",
  efectivo: "Efectivo",
  tenpo: "Tenpo",
  tenpo_credito: "Tenpo Credito",
  banco_chile: "Banco de Chile",
  mercadopago: "MercadoPago",
  binance: "Binance",
  paypal: "PayPal",
  mach: "Mach",
  bci_match: "Bci Match",
};

function normalizarTextoMetodo(valor) {
  return (valor || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "");
}

const METODOS_PAGO_NORMALIZADOS = Object.entries(METODOS_PAGO_LABELS).reduce(
  (acc, [key, label]) => {
    acc[normalizarTextoMetodo(key)] = key;
    acc[normalizarTextoMetodo(label)] = key;
    return acc;
  },
  {}
);

function normalizarMetodoPago(valor) {
  const normalizado = normalizarTextoMetodo(valor);
  return METODOS_PAGO_NORMALIZADOS[normalizado] || normalizado;
}


const TENPO_CREDITO_INFO = {
  limite: 200000,
  usado: 144534,
};

function formatMetodoPago(metodoPago) {
  return METODOS_PAGO_LABELS[metodoPago] || metodoPago || "Sin especificar";
}

function formatFechaLarga(dateString) {
  if (!dateString) return "";

  const date = new Date(
    dateString.includes("T") ? dateString : `${dateString}T00:00:00`
  );
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function esMismaFecha(dateString, dateObj) {
  if (!dateString || !dateObj) return false;
  const date = new Date(
    dateString.includes("T") ? dateString : `${dateString}T00:00:00`
  );
  if (isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === dateObj.getFullYear() &&
    date.getMonth() === dateObj.getMonth() &&
    date.getDate() === dateObj.getDate()
  );
}

function formatDate(dateString) {
  if (!dateString) return "";

  try {
    // Manejar tanto fechas simples como timestamps
    let date;
    if (dateString.includes("T")) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString + "T00:00:00");
    }

    // Verificar si la fecha es v├ílida
    if (isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formateando fecha:", dateString, error);
    return "";
  }
}


function ensureFeedbackModal() {
  let modal = document.getElementById("feedback-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "feedback-modal";
  modal.className = "feedback-modal";
  modal.innerHTML = `
    <div class="feedback-card" role="dialog" aria-live="polite">
      <div class="feedback-icon" id="feedback-icon"></div>
      <div class="feedback-title" id="feedback-title"></div>
      <div class="feedback-message" id="feedback-message"></div>
      <div class="feedback-actions">
        <button class="btn-primary feedback-accept" type="button">Aceptar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });

  const acceptBtn = modal.querySelector(".feedback-accept");
  acceptBtn.addEventListener("click", () => modal.classList.remove("active"));

  return modal;
}

function mostrarFeedback({ titulo, mensaje, tipo }) {
  const modal = ensureFeedbackModal();
  const titleEl = modal.querySelector("#feedback-title");
  const messageEl = modal.querySelector("#feedback-message");
  const iconEl = modal.querySelector("#feedback-icon");

  modal.classList.remove("success", "error");
  modal.classList.add("active", tipo);

  if (titleEl) titleEl.textContent = titulo || "Listo";
  if (messageEl) messageEl.textContent = mensaje || "";
  if (iconEl) {
    iconEl.textContent = tipo === "error" ? "!" : "✓";
  }
}

function mostrarExito(mensaje) {
  const titulo =
    mensaje && mensaje.toLowerCase().includes("movimiento")
      ? "Movimiento guardado"
      : "Listo";
  mostrarFeedback({ titulo, mensaje, tipo: "success" });
}

function mostrarError(mensaje) {
  mostrarFeedback({ titulo: "Error", mensaje, tipo: "error" });
}


// ==================== DRAG AND DROP ====================

let draggedHabitoId = null;

function handleDragStart(event, habitoId) {
  draggedHabitoId = habitoId;
  event.currentTarget.style.opacity = "0.4";
  event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  event.dataTransfer.dropEffect = "move";

  // A├▒adir indicador visual
  const target = event.currentTarget;
  if (target.classList.contains("habito-item")) {
    target.style.borderTop = "2px solid #4CAF50";
  }
  return false;
}

function handleDrop(event, targetHabitoId) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }

  event.currentTarget.style.borderTop = "";

  if (draggedHabitoId !== targetHabitoId) {
    reordenarHabitosDragDrop(draggedHabitoId, targetHabitoId);
  }

  return false;
}

function handleDragEnd(event) {
  event.currentTarget.style.opacity = "1";

  // Limpiar todos los indicadores visuales
  document.querySelectorAll(".habito-item").forEach((item) => {
    item.style.borderTop = "";
  });
}

async function reordenarHabitosDragDrop(draggedId, targetId) {
  try {
    // Obtener todos los h├íbitos actuales
    const res = await fetch(`${API_URL}/api/habitos`);
    const data = await res.json();

    if (!data.ok) {
      mostrarError("Error al obtener h├íbitos");
      return;
    }

    // Ordenar por campo orden
    let habitos = data.habitos.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Encontrar ├¡ndices
    const draggedIndex = habitos.findIndex((h) => h.id === draggedId);
    const targetIndex = habitos.findIndex((h) => h.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reordenar array
    const [removed] = habitos.splice(draggedIndex, 1);
    habitos.splice(targetIndex, 0, removed);

    // Crear nuevo orden
    const nuevoOrden = habitos.map((h, idx) => ({
      id: h.id,
      orden: idx + 1,
    }));

    // Enviar al backend
    const resUpdate = await fetch(`${API_URL}/api/habitos/reordenar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orden: nuevoOrden }),
    });

    const dataUpdate = await resUpdate.json();

    if (dataUpdate.ok) {
      // Recargar vista
      await cargarHabitosHoy();
      console.log("Ô£à Orden actualizado");
    } else {
      mostrarError(dataUpdate.error || "Error al reordenar");
    }
  } catch (error) {
    console.error("Error reordenando h├íbitos:", error);
    mostrarError("Error al reordenar h├íbitos");
  }
}

// Exponer funciones globales
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.guardarHabito = guardarHabito;
window.marcarHabito = marcarHabito;
window.toggleHabitoDia = toggleHabitoDia;
window.eliminarHabito = eliminarHabito;
window.moverHabito = moverHabito;
window.guardarTransaccion = guardarTransaccion;
window.guardarTransferencia = guardarTransferencia;
window.swapTransferenciaCuentas = swapTransferenciaCuentas;
window.resetTransferenciaForm = resetTransferenciaForm;
window.eliminarTransaccion = eliminarTransaccion;
window.resetFiltroMetodoFinanzas = resetFiltroMetodoFinanzas;
window.guardarObjetivo = guardarObjetivo;
window.eliminarObjetivo = eliminarObjetivo;
window.verDetallesObjetivo = verDetallesObjetivo;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;
window.toggleHito = toggleHito;
window.eliminarHito = eliminarHito;
window.editarObjetivo = editarObjetivo;
window.abrirModalHito = abrirModalHito;
window.guardarHitoDesdeFormulario = guardarHitoDesdeFormulario;
window.cargarSaldosPorMetodo = cargarSaldosPorMetodo;
window.cargarDeudas = cargarDeudas;
window.guardarDeuda = guardarDeuda;
window.abrirModalPagar = abrirModalPagar;
window.registrarPagoDeuda = registrarPagoDeuda;
window.eliminarDeuda = eliminarDeuda;
window.cargarAgenda = cargarAgenda;
window.cambiarMesAgenda = cambiarMesAgenda;
window.guardarEventoPersonal = guardarEventoPersonal;
window.eliminarEventoPersonal = eliminarEventoPersonal;
window.abrirModalEntretenimiento = abrirModalEntretenimiento;
window.guardarEntretenimiento = guardarEntretenimiento;
window.editarEntretenimiento = editarEntretenimiento;
window.eliminarEntretenimiento = eliminarEntretenimiento;
window.marcarTerminadoEntretenimiento = marcarTerminadoEntretenimiento;
window.renderEntretenimiento = renderEntretenimiento;
