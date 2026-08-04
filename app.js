const TMDB_KEY = "1c90fb1c06e5d1be12b11c98ac3fe7f8";

const STR = {
  en: {
    docTitle: "Felipe's Blockbuster",
    brandTitle: "FELIPE'S BLOCKBUSTER",
    tagline: "Welcome to Felipe Walker's Blockbuster!",
    tabsNavAria: "Content type",
    langGroupAria: "Language",
    langEn: "USA",
    langPt: "BRASIL",
    tabMovies: "Movies",
    tabTv: "TV Shows",
    tabCartoons: "Cartoons",
    searchLabel: "Search catalog",
    searchPlaceholder: "Search titles here...",
    nowAvailable: "NEW RELEASES!",
    browseSubMovies: "Fresh hits & blockbusters",
    browseSubTv: "On the air — buzzworthy series",
    browseSubCartoons: "Animated series the whole crew will love",
    panelTop5: "My Top 5",
    panelTop5Hint: "Rank your favorites",
    btnTop5: "Top 5",
    btnRemoveTop5: "Remove from Top 5",
    msgTop5Full: "Screenshot and share your Top 5 with friends!",
    ariaMoveUp: "Move up",
    ariaMoveDown: "Move down",
    ariaRemove: "Remove",
    ariaCloseModal: "Close",
    ariaPrevImage: "Previous image",
    ariaNextImage: "Next image",
    modalLoading: "Loading images...",
    modalError: "Couldn't load images",
    loadErrorTitle: "Couldn't load titles",
    loadErrorBody: "Check your connection and try again.",
    searchFailedSub: "Something went wrong — try again.",
    searchErrorTitle: "Search error",
    searchErrorBody: "Check your connection and try again.",
    noMatchesTitle: "No matches",
    noMatchesBodyHtml:
      "Try another title or clear search to see <strong>Now Available!</strong>",
    maintenanceTitle: "We are currently undergoing maintenance!",
  },
  pt: {
    docTitle: "Locadora do Felipe",
    brandTitle: "LOCADORA DO FELIPE",
    tagline: "BEM-VINDO À LOCADORA DO FELIPE WALKER!",
    tabsNavAria: "Tipo de conteúdo",
    langGroupAria: "Idioma",
    langEn: "USA",
    langPt: "BRASIL",
    tabMovies: "Filmes",
    tabTv: "Séries",
    tabCartoons: "Desenhos",
    searchLabel: "Buscar no catálogo",
    searchPlaceholder: "Buscar títulos aqui...",
    nowAvailable: "LANÇAMENTOS!",
    browseSubMovies: "Grandes estreias e sucessos",
    browseSubTv: "No ar — séries em destaque",
    browseSubCartoons: "Animações para assistir em família",
    panelTop5: "Meu Top 5",
    panelTop5Hint: "Organize seus favoritos",
    btnTop5: "Top 5",
    btnRemoveTop5: "Remover do Top 5",
    msgTop5Full: "Capture a tela e mostre seu Top 5 aos amigos!",
    ariaMoveUp: "Subir",
    ariaMoveDown: "Descer",
    ariaRemove: "Remover",
    ariaCloseModal: "Fechar",
    ariaPrevImage: "Imagem anterior",
    ariaNextImage: "Próxima imagem",
    modalLoading: "Carregando imagens...",
    modalError: "Não foi possível carregar as imagens",
    loadErrorTitle: "Não foi possível carregar",
    loadErrorBody: "Verifique sua conexão e tente de novo.",
    searchFailedSub: "Algo deu errado — tente novamente.",
    searchErrorTitle: "Erro na busca",
    searchErrorBody: "Verifique sua conexão e tente de novo.",
    noMatchesTitle: "Nada encontrado",
    noMatchesBodyHtml:
      "Tente outro título ou limpe a busca para ver <strong>Agora disponível!</strong>",
    maintenanceTitle: "Estamos em manutenção no momento!",
  },
};

const storedLang = localStorage.getItem("hub-lang");
let currentLang = storedLang === "pt" ? "pt" : "en";

function t(key) {
  const row = STR[currentLang];
  return row[key] ?? STR.en[key] ?? key;
}

function tmdbLocale() {
  return currentLang === "pt"
    ? "language=pt-BR&region=BR"
    : "language=en-US&region=US";
}

function resultsForLine(q) {
  return currentLang === "pt" ? `Resultados para “${q}”` : `Results for “${q}”`;
}

function applyI18n() {
  document.documentElement.lang = currentLang === "pt" ? "pt-BR" : "en";
  document.title = t("docTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.setLang === currentLang);
  });

  // Update modal static labels
  const closeBtn = document.getElementById("modal-close");
  if (closeBtn) closeBtn.setAttribute("aria-label", t("ariaCloseModal"));
  const prevBtn = document.getElementById("carousel-prev");
  if (prevBtn) prevBtn.setAttribute("aria-label", t("ariaPrevImage"));
  const nextBtn = document.getElementById("carousel-next");
  if (nextBtn) nextBtn.setAttribute("aria-label", t("ariaNextImage"));
  const loading = document.getElementById("carousel-loading");
  if (loading) loading.textContent = t("modalLoading");
  const error = document.getElementById("carousel-error");
  if (error) error.textContent = t("modalError");
  const addBtn = document.getElementById("modal-add");
  if (addBtn) addBtn.textContent = t("btnTop5");
  const removeBtn = document.getElementById("modal-remove");
  if (removeBtn) removeBtn.textContent = t("btnRemoveTop5");
}

function emptyHubHtml(titleKey, bodyHtmlKey) {
  return `<div class="hub-empty"><p class="hub-empty-title">${esc(t(titleKey))}</p><p>${t(bodyHtmlKey)}</p></div>`;
}

let tab = "movies";

let maintenanceMode = false;

const state = JSON.parse(localStorage.getItem("hub")) || {
  movies: { top: [] },
  tv: { top: [] },
  cartoons: { top: [] },
};

const save = () => localStorage.setItem("hub", JSON.stringify(state));

const browseSubKey = {
  movies: "browseSubMovies",
  tv: "browseSubTv",
  cartoons: "browseSubCartoons",
};

function setBrowseSub() {
  const el = document.getElementById("browse-sub");
  if (el) el.textContent = t(browseSubKey[tab] || "browseSubMovies");
}

function updateTabButtons() {
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.setLang === "pt" ? "pt" : "en";
    localStorage.setItem("hub-lang", currentLang);
    applyI18n();
    setBrowseSub();
    updateTabButtons();
    render();
    const searchEl = document.getElementById("search");
    if (searchEl.value.trim()) search({ target: searchEl });
    else loadNowAvailable();
  });
});

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.onclick = () => {
    tab = btn.dataset.tab;
    document.getElementById("search").value = "";
    updateTabButtons();
    setBrowseSub();
    render();
    loadNowAvailable();
  };
});

document
  .getElementById("search")
  .addEventListener("input", debounce(search, 400));

async function loadNowAvailable() {
  const q = document.getElementById("search").value.trim();
  if (q) return;

  if (maintenanceMode) {
    showMaintenance();
    return;
  }

  setBrowseSub();
  let items = [];
  const loc = tmdbLocale();

  try {
    if (tab === "movies") {
      const d = await tmdbFetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&${loc}&page=1`,
      );
      items = (d.results || []).filter((i) => i.vote_count >= 50).map(mapMedia);
    } else if (tab === "tv") {
      const d = await tmdbFetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_KEY}&${loc}&page=1`,
      );
      items = (d.results || []).filter((i) => i.vote_count >= 50).map(mapMedia);
    } else if (tab === "cartoons") {
      const d = await tmdbFetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&${loc}&with_genres=16&sort_by=popularity.desc&vote_count.gte=100&page=1`,
      );
      items = (d.results || []).map(mapMedia);
    }
  } catch {
    showMaintenance();
    return;
  }

  renderGrid(items);
}

async function search(e) {
  const q = e.target.value.trim();
  if (!q) {
    loadNowAvailable();
    return;
  }

  if (maintenanceMode) {
    showMaintenance();
    return;
  }

  let items = [];
  const loc = tmdbLocale();

  try {
    const type = tab === "movies" ? "movie" : "tv";

    const d = await tmdbFetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&${loc}&query=${encodeURIComponent(q)}`,
    );

    items = (d.results || [])
      .filter((i) => i.vote_average >= 3 && i.vote_count >= 500)
      .map(mapMedia);

    if (tab === "cartoons") {
      items = items.filter((i) => i.genres?.includes(16));
    }
  } catch {
    showMaintenance();
    return;
  }

  const sub = document.getElementById("browse-sub");
  if (sub) sub.textContent = resultsForLine(q);

  renderGrid(items, {
    emptyHtml:
      items.length === 0
        ? `<div class="hub-empty"><p class="hub-empty-title">${esc(t("noMatchesTitle"))}</p><p>${t("noMatchesBodyHtml")}</p></div>`
        : "",
  });
}

function mapMedia(i) {
  return {
    id: i.id,
    title: i.title || i.name,
    year: (i.release_date || i.first_air_date || "").split("-")[0],
    image: i.poster_path
      ? "https://image.tmdb.org/t/p/w500" + i.poster_path
      : "",
    genres: i.genre_ids,
  };
}

async function tmdbFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`TMDB HTTP ${r.status}`);
  const d = await r.json();
  if (!d || typeof d !== "object" || !Array.isArray(d.results)) {
    throw new Error("TMDB invalid payload");
  }
  return d;
}

function showMaintenance() {
  maintenanceMode = true;
  const grid = document.getElementById("grid");
  grid.innerHTML = `<div class="hub-maintenance"><p class="hub-maintenance-title">${esc(t("maintenanceTitle"))}</p></div>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/"/g, "\u0026quot;");
}

let currentGridItems = [];

function renderGrid(items, opts = {}) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  currentGridItems = items;

  if (opts.emptyHtml && (!items || items.length === 0)) {
    grid.innerHTML = opts.emptyHtml;
    return;
  }

  const topIds = new Set((state[tab]?.top || []).map((i) => i.id));
  const topFull = (state[tab]?.top || []).length >= 5;

  items.forEach((item) => {
    const inTop = topIds.has(item.id);
    const addDisabled = topFull || inTop;
    const removeDisabled = !inTop;

    const el = document.createElement("div");
    el.className = "card";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `${item.title} — open images`);
    el.dataset.itemId = item.id;

    el.innerHTML = `
      <div class="card-media">
        <img loading="lazy" alt="${esc(item.title)}" src="${item.image ? esc(item.image) : ""}">
        ${!item.image ? `<div class="card-placeholder">${esc(item.title)}</div>` : ""}
      </div>
      <div class="overlay">
        <p class="card-title">${esc(item.title)}</p>
        ${item.year ? `<p class="card-meta">${esc(item.year)}</p>` : ""}
        <div class="card-actions">
          <button type="button" class="btn btn-top3 btn-top${addDisabled ? " disabled" : ""}" ${addDisabled ? "disabled" : ""} data-item-id="${item.id}">${esc(t("btnTop5"))}</button>
          <button type="button" class="btn btn-remove${removeDisabled ? " disabled" : ""}" ${removeDisabled ? "disabled" : ""} data-item-id="${item.id}">${esc(t("btnRemoveTop5"))}</button>
        </div>
      </div>
    `;

    const addButton = el.querySelector(".btn-top");
    if (!addDisabled) {
      addButton.onclick = (e) => {
        e.stopPropagation();
        addTop(item);
      };
    }

    const removeButton = el.querySelector(".btn-remove");
    if (!removeDisabled) {
      removeButton.onclick = (e) => {
        e.stopPropagation();
        removeTop(item.id);
      };
    }

    el.addEventListener("click", () => openModal(item));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(item);
      }
    });

    grid.appendChild(el);
  });
}

function updateGridButtons() {
  const topIds = new Set((state[tab]?.top || []).map((i) => i.id));
  const topFull = topIds.size >= 5;

  document.querySelectorAll(".card .btn-top").forEach((button) => {
    const itemId = Number(button.dataset.itemId);
    const disabled = topFull || topIds.has(itemId);
    button.classList.toggle("disabled", disabled);
    button.disabled = disabled;

    if (disabled) {
      button.onclick = null;
    } else {
      const item = currentGridItems.find((i) => i.id === itemId);
      if (item) {
        button.onclick = (e) => {
          e.stopPropagation();
          addTop(item);
        };
      }
    }
  });

  document.querySelectorAll(".card .btn-remove").forEach((button) => {
    const itemId = Number(button.dataset.itemId);
    const disabled = !topIds.has(itemId);
    button.classList.toggle("disabled", disabled);
    button.disabled = disabled;

    if (disabled) {
      button.onclick = null;
    } else {
      button.onclick = (e) => {
        e.stopPropagation();
        removeTop(itemId);
      };
    }
  });
}

function addTop(item) {
  const list = state[tab].top;
  if (list.length >= 5) return;
  if (!list.find((i) => i.id === item.id)) {
    list.push(item);
    save();
    render();
    updateGridButtons();
    updateModalButtons();
  }
}

function render() {
  updateTabButtons();
  renderTop();
}

function renderTop() {
  const el = document.getElementById("top");
  const msg = document.getElementById("msg");
  el.innerHTML = "";

  state[tab].top.forEach((i, index) => {
    const medal = ["🥇", "🥈", "🥉", "🏆", "🏆"][index] || "";

    el.innerHTML += `
      <div class="item item-ranked">
        <span class="item-title">${medal} ${index + 1}. ${esc(i.title)}${i.year ? ` <span class="item-year">(${esc(i.year)})</span>` : ""}</span>
        <div class="item-actions">
          <button type="button" class="btn btn-icon" onclick="move(${index},-1)" aria-label="${esc(t("ariaMoveUp"))}">↑</button>
          <button type="button" class="btn btn-icon" onclick="move(${index},1)" aria-label="${esc(t("ariaMoveDown"))}">↓</button>
          <button type="button" class="btn btn-icon danger" onclick="removeTop(${i.id})" aria-label="${esc(t("ariaRemove"))}">×</button>
        </div>
      </div>`;
  });

  msg.innerText = state[tab].top.length === 5 ? t("msgTop5Full") : "";
}

function move(i, d) {
  const list = state[tab].top;
  const ni = i + d;
  if (ni < 0 || ni >= list.length) return;
  [list[i], list[ni]] = [list[ni], list[i]];
  save();
  render();
}

function removeTop(id) {
  state[tab].top = state[tab].top.filter((i) => i.id !== id);
  save();
  render();
  updateGridButtons();
  updateModalButtons();
}

function debounce(fn, ms) {
  let id;
  return (...a) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...a), ms);
  };
}

/* —— Modal & Carousel —— */

let modalItem = null;
let modalImages = [];
let modalIndex = 0;
let modalLoading = false;

const modalEl = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalAddBtn = document.getElementById("modal-add");
const modalRemoveBtn = document.getElementById("modal-remove");
const modalCloseBtn = document.getElementById("modal-close");
const carouselImg = document.getElementById("carousel-img");
const carouselLoading = document.getElementById("carousel-loading");
const carouselError = document.getElementById("carousel-error");
const carouselCount = document.getElementById("carousel-count");
const carouselPrev = document.getElementById("carousel-prev");
const carouselNext = document.getElementById("carousel-next");

function mediaType() {
  return tab === "movies" ? "movie" : "tv";
}

async function fetchImages(item) {
  const type = mediaType();
  const url = `https://api.themoviedb.org/3/${type}/${item.id}/images?api_key=${TMDB_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`TMDB images HTTP ${r.status}`);
  const d = await r.json();
  const posters = d.posters || [];
  return posters
    .map((p) => (p.file_path ? "https://image.tmdb.org/t/p/w500" + p.file_path : null))
    .filter(Boolean);
}

function showCarouselState() {
  const hasImages = modalImages.length > 0;
  carouselImg.hidden = !hasImages;
  carouselLoading.hidden = modalLoading || hasImages;
  carouselError.hidden = !(!modalLoading && !hasImages);
  carouselCount.hidden = !hasImages;

  if (hasImages) {
    carouselImg.src = modalImages[modalIndex];
    carouselImg.alt = modalItem ? modalItem.title : "";
    carouselCount.textContent = `${modalIndex + 1} / ${modalImages.length}`;
  }

  carouselPrev.disabled = !hasImages || modalIndex <= 0;
  carouselNext.disabled = !hasImages || modalIndex >= modalImages.length - 1;
}

async function openModal(item) {
  modalItem = item;
  modalImages = [];
  modalIndex = 0;
  modalLoading = true;

  modalTitle.textContent = item.title;
  modalMeta.textContent = item.year ? item.year : "";
  modalEl.hidden = false;
  document.body.style.overflow = "hidden";

  showCarouselState();
  updateModalButtons();

  try {
    modalImages = await fetchImages(item);
    if (!modalImages.length && item.image) {
      modalImages = [item.image];
    }
  } catch {
    modalImages = item.image ? [item.image] : [];
  } finally {
    modalLoading = false;
    showCarouselState();
  }
}

function closeModal() {
  modalEl.hidden = true;
  document.body.style.overflow = "";
  modalItem = null;
  modalImages = [];
  modalIndex = 0;
  carouselImg.src = "";
}

function updateModalButtons() {
  if (!modalItem) return;
  const inTop = (state[tab]?.top || []).some((i) => i.id === modalItem.id);
  const topFull = (state[tab]?.top || []).length >= 5;

  modalAddBtn.disabled = topFull || inTop;
  modalAddBtn.classList.toggle("disabled", topFull || inTop);
  modalRemoveBtn.disabled = !inTop;
}

modalAddBtn.addEventListener("click", () => {
  if (modalItem) addTop(modalItem);
});

modalRemoveBtn.addEventListener("click", () => {
  if (modalItem) removeTop(modalItem.id);
});

modalCloseBtn.addEventListener("click", closeModal);

modalEl.addEventListener("click", (e) => {
  if (e.target === modalEl) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (modalEl.hidden) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft") showPrevImage();
  if (e.key === "ArrowRight") showNextImage();
});

function showPrevImage() {
  if (modalIndex > 0) {
    modalIndex--;
    showCarouselState();
  }
}

function showNextImage() {
  if (modalIndex < modalImages.length - 1) {
    modalIndex++;
    showCarouselState();
  }
}

carouselPrev.addEventListener("click", showPrevImage);
carouselNext.addEventListener("click", showNextImage);

applyI18n();
setBrowseSub();
updateTabButtons();
render();
loadNowAvailable();