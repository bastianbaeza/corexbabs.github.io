// Frontend: js/publicidad.js

const API_PATH = "/api";
const API_BASES = ["http://127.0.0.1:3000", "http://127.0.0.1:3001"];
let apiBase = null;

function normalizeBase(base) {
  return base ? base.replace(/\/$/, "") : null;
}

function getApiCandidates() {
  const candidates = [];
  const resolved =
    window.__backendBaseResolved ||
    localStorage.getItem("backendBaseResolved") ||
    localStorage.getItem("backendBase");
  if (resolved) candidates.push(resolved);

  const origin = (window.location && window.location.origin) || "";
  if (origin.includes(":3000") || origin.includes(":3001")) {
    candidates.push(origin);
  }

  for (const base of API_BASES) {
    candidates.push(base);
  }

  return [...new Set(candidates.map(normalizeBase))].filter(Boolean);
}

async function apiFetch(path, options) {
  if (!apiBase) {
    const candidates = getApiCandidates();
    let lastError = null;
    for (const base of candidates) {
      try {
        const response = await fetch(`${base}${API_PATH}${path}`, options);
        apiBase = base;
        return response;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Backend no disponible");
  }

  try {
    return await fetch(`${apiBase}${API_PATH}${path}`, options);
  } catch (err) {
    apiBase = null;
    return apiFetch(path, options);
  }
}

let editingPostId = null;

function syncRecurrenciaUi() {
  const value = (recurrenciaSelect && recurrenciaSelect.value) || "ninguna";
  if (recurrenciaDiaWrap) recurrenciaDiaWrap.style.display = value === "semanal" ? "block" : "none";
}

function syncEditRecurrenciaUi() {
  const value = (editRecurrencia && editRecurrencia.value) || "ninguna";
  if (editRecurrenciaDiaWrap) editRecurrenciaDiaWrap.style.display = value === "semanal" ? "block" : "none";
}

function getNowDateAndTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return { fecha: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${mi}` };
}

// Elementos del DOM
const titleInput = document.getElementById("titulo");
const descInput = document.getElementById("descripcion");
const imagenInput = document.getElementById("imagen");
const preview = document.getElementById("preview");
const redSocialSelect = document.getElementById("red-social");
const tipoPublicacionSelect = document.getElementById("tipo-publicacion");
const recurrenciaSelect = document.getElementById("recurrencia");
const diaSemanaSelect = document.getElementById("dia-semana");
const recurrenciaDiaWrap = document.getElementById("recurrencia-dia-wrap");
const fechaInput = document.getElementById("fecha-programada");
const horaInput = document.getElementById("hora-programada");
const btnCrear = document.getElementById("btn-crear-post");
const btnPublicarAhora = document.getElementById("btn-publicar-ahora");
const btnLimpiar = document.getElementById("btn-limpiar");
const postsTbody = document.getElementById("posts-tbody");

const modal = document.getElementById("modal-editar");
const modalClose = document.querySelector(".modal-close");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnGuardarEdicion = document.getElementById("btn-guardar-edicion");

const editTitulo = document.getElementById("edit-titulo");
const editDescripcion = document.getElementById("edit-descripcion");
const editTipoPublicacion = document.getElementById("edit-tipo-publicacion");
const editRecurrencia = document.getElementById("edit-recurrencia");
const editDiaSemana = document.getElementById("edit-dia-semana");
const editRecurrenciaDiaWrap = document.getElementById("edit-recurrencia-dia-wrap");
const editFecha = document.getElementById("edit-fecha");
const editHora = document.getElementById("edit-hora");

// Vista previa de imagen
imagenInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// Limpiar formulario
btnLimpiar.addEventListener("click", () => {
  titleInput.value = "";
  descInput.value = "";
  imagenInput.value = "";
  preview.style.display = "none";
  preview.src = "";
  fechaInput.value = "";
  horaInput.value = "";
  redSocialSelect.value = "instagram";
  tipoPublicacionSelect.value = "historia";

// UI recurrencia
if (recurrenciaSelect) {
  recurrenciaSelect.addEventListener("change", syncRecurrenciaUi);
  syncRecurrenciaUi();
}
if (editRecurrencia) {
  editRecurrencia.addEventListener("change", syncEditRecurrenciaUi);
}

});

// Crear post
async function createPost(publishNow = false) {
  const titulo = titleInput.value.trim();
  const descripcion = descInput.value.trim();
  const redSocial = redSocialSelect.value;
  const tipoPublicacion = tipoPublicacionSelect.value;
  const recurrencia = (recurrenciaSelect && recurrenciaSelect.value) || "ninguna";
  const diaSemana = (diaSemanaSelect && diaSemanaSelect.value) || "";

  if (!titulo || !descripcion || !imagenInput.files[0]) {
    showAlert("alert-create", "Por favor completa titulo, descripcion e imagen", "error");
    return;
  }

  let fecha = fechaInput.value;
  let hora = horaInput.value;
  if (publishNow) {
    const now = getNowDateAndTime();
    fecha = now.fecha;
    hora = now.hora;
  }

  if (!fecha || !hora) {
    showAlert(
      "alert-create",
      "Por favor completa fecha y hora (o usa Publicar ahora)",
      "error"
    );
    return;
  }

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("descripcion", descripcion);
  formData.append("imagen", imagenInput.files[0]);
  formData.append("fecha_programada", fecha);
  formData.append("hora_programada", hora);
  formData.append("red_social", redSocial);
  formData.append("tipo_publicacion", tipoPublicacion);
  formData.append("recurrencia", recurrencia);
  if (recurrencia === "semanal") formData.append("dia_semana", diaSemana);

  try {
    const response = await apiFetch("/posts-publicidad", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      showAlert("alert-create", data.error || "Error al crear post", "error");
      return;
    }

    if (publishNow) {
      const publishResp = await apiFetch(
        `/posts-publicidad/${data.post.id}/publicar`,
        { method: "POST" }
      );
      const publishData = await publishResp.json();

      if (publishResp.ok && publishData.ok) {
        showAlert("alert-create", "Publicado en Instagram", "success");
      } else {
        showAlert(
          "alert-create",
          publishData.error || "Se cre? el post, pero fall? la publicaci?n",
          "error"
        );
      }
    } else {
      showAlert("alert-create", "Post creado exitosamente", "success");
    }

    btnLimpiar.click();
    loadPosts();
  } catch (err) {
    showAlert(
      "alert-create",
      `Error: ${err.message} - Verifica que el backend est? corriendo`,
      "error"
    );
  }
}

btnCrear.addEventListener("click", () => createPost(false));
btnPublicarAhora.addEventListener("click", () => createPost(true));


// Cargar posts
async function loadPosts() {
  try {
    const response = await apiFetch("/posts-publicidad");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.ok && Array.isArray(data.posts)) {
      if (data.posts.length === 0) {
        postsTbody.innerHTML =
          '<tr><td colspan="6" style="text-align: center; color: var(--muted);">No hay posts aún</td></tr>';
        return;
      }

      postsTbody.innerHTML = data.posts
        .map(
          (post) => `
        <tr>
          <td>${post.titulo}</td>
          <td>${post.red_social}</td>
          <td>${post.tipo_publicacion || "post"}</td>
          <td>${post.fecha_programada} ${post.hora_programada}${post.recurrencia && post.recurrencia !== "ninguna" ? ` (${post.recurrencia})` : ""}</td>
          <td><span class="status-badge status-${post.estado}">${
            post.estado
          }</span></td>
          <td>
            ${
              post.estado === "pendiente"
                ? `<button class="btn-delete" onclick="openEditModal(${post.id})">Editar</button>`
                : ""
            }
            ${
              post.estado === "pendiente" || post.estado === "error"
                ? `<button class="btn-publish" onclick="publishPost(${post.id})" style="margin-left: 5px;">Publicar ahora</button>`
                : ""
            }
            <button class="btn-delete" onclick="deletePost(${
              post.id
            })" style="margin-left: 5px;">Eliminar</button>
          </td>
        </tr>
      `
        )
        .join("");
    } else {
      postsTbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center; color: var(--muted);">Error al cargar posts</td></tr>';
    }
  } catch (err) {
    console.error("Error cargando posts:", err);
    postsTbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: red;">⚠️ Backend no disponible. Inicia el servidor backend.</td></tr>';
  }
}

// Abrir modal de edición
async function openEditModal(postId) {
  try {
    const response = await apiFetch(`/posts-publicidad/${postId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.ok) {
      const post = data.post;
      editTitulo.value = post.titulo;
      editDescripcion.value = post.descripcion;
      editTipoPublicacion.value = post.tipo_publicacion || "post";
      editFecha.value = post.fecha_programada;
      editHora.value = post.hora_programada;

      editingPostId = postId;
      modal.style.display = "block";
    }
  } catch (err) {
    console.error("Error cargando post:", err);
    alert(`Error: ${err.message}`);
  }
}

// Guardar edición
btnGuardarEdicion.addEventListener("click", async () => {
  if (!editingPostId) return;

  const titulo = editTitulo.value.trim();
  const descripcion = editDescripcion.value.trim();
  const fecha = editFecha.value;
  const hora = editHora.value;
  const tipoPublicacion = editTipoPublicacion.value;

  if (!titulo || !descripcion || !fecha || !hora) {
    showAlert("alert-edit", "Por favor completa todos los campos", "error");
    return;
  }

  try {
    const response = await apiFetch(`/posts-publicidad/${editingPostId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descripcion,
        fecha_programada: fecha,
        hora_programada: hora,
        tipo_publicacion: tipoPublicacion,
        recurrencia: (editRecurrencia && editRecurrencia.value) || "ninguna",
        dia_semana: (editDiaSemana && editDiaSemana.value) || null,
      }),
    });
    const data = await response.json();

    if (data.ok) {
      showAlert("alert-edit", "Post actualizado exitosamente", "success");
      modal.style.display = "none";
      loadPosts();
    } else {
      showAlert(
        "alert-edit",
        data.error || "Error al actualizar post",
        "error"
      );
    }
  } catch (err) {
    showAlert("alert-edit", err.message, "error");
  }
});

async function publishPost(postId) {
  if (!confirm("?Publicar este post ahora en Instagram?")) return;

  try {
    const response = await apiFetch(`/posts-publicidad/${postId}/publicar`, {
      method: "POST",
    });
    const data = await response.json();

    if (response.ok && data.ok) {
      showAlert("alert-list", "Post publicado", "success");
      loadPosts();
      return;
    }
    showAlert("alert-list", data.error || "Error publicando", "error");
  } catch (err) {
    showAlert("alert-list", err.message, "error");
  }
}

// Eliminar post
async function deletePost(postId) {
  if (!confirm("¿Estás seguro de que deseas eliminar este post?")) return;

  try {
    const response = await apiFetch(`/posts-publicidad/${postId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.ok) {
      showAlert("alert-list", "Post eliminado exitosamente", "success");
      loadPosts();
    } else {
      showAlert("alert-list", data.error || "Error al eliminar post", "error");
    }
  } catch (err) {
    showAlert(
      "alert-list",
      `Error: ${err.message} - Verifica el backend`,
      "error"
    );
  }
}

// Mostrar alertas
function showAlert(elementId, message, type) {
  const alertEl = document.getElementById(elementId);
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = "block";

  setTimeout(() => {
    alertEl.style.display = "none";
  }, 4000);
}

// Cerrar modal
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

btnCerrarModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Establecer fecha mínima (hoy)
const today = new Date().toISOString().split("T")[0];
fechaInput.min = today;
editFecha.min = today;

// Cargar posts al iniciar
loadPosts();

// Recargar posts cada minuto
setInterval(loadPosts, 60000);

