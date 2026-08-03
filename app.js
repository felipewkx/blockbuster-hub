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
    msgTop5Full: "Screenshot and share your Top 5 with friends!",
    ariaMoveUp: "Move up",
    ariaMoveDown: "Move down",
    ariaRemove: "Remove",
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
    msgTop5Full: "Capture a tela e mostre seu Top 5 aos amigos!",
    ariaMoveUp: "Subir",
    ariaMoveDown: "Descer",
    ariaRemove: "Remover",
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
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
    const disabled = topFull || topIds.has(item.id);
    const el = document.createElement("div");
    el.className = "card";

    el.innerHTML = `
      <div class="card-media">
        <img loading="lazy" alt="${esc(item.title)}" src="${item.image ? esc(item.image) : ""}">
        ${!item.image ? `<div class="card-placeholder">${esc(item.title)}</div>` : ""}
      </div>
      <div class="overlay">
        <p class="card-title">${esc(item.title)}</p>
        ${item.year ? `<p class="card-meta">${esc(item.year)}</p>` : ""}
        <div class="card-actions">
          <button type="button" class="btn btn-top3 btn-top${disabled ? " disabled" : ""}" ${disabled ? "disabled" : ""} data-item-id="${item.id}">${esc(t("btnTop5"))}</button>
        </div>
      </div>
    `;

    const button = el.querySelector(".btn-top");
    if (!disabled) {
      button.onclick = () => addTop(item);
    }

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
      if (item) button.onclick = () => addTop(item);
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
}

function debounce(fn, ms) {
  let id;
  return (...a) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...a), ms);
  };
}

applyI18n();
setBrowseSub();
updateTabButtons();
render();
loadNowAvailable();
