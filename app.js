const TMDB_KEY = "1c90fb1c06e5d1be12b11c98ac3fe7f8";
const RAWG_KEY = "b7b2e7daa8f44458b52095d09ad0aee5";

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
    tabGames: "Games",
    panelRentals: "My rentals",
    panelRentalsHint: "Up to 10 per category",
    searchLabel: "Search catalog",
    searchPlaceholder: "Search titles, cast, genres…",
    nowAvailable: "NEW RELEASES!",
    browseSubMovies: "Fresh hits & blockbusters",
    browseSubTv: "On the air — buzzworthy series",
    browseSubCartoons: "Animated series the whole crew will love",
    browseSubGames: "Recently released & highly rated titles",
    panelTop5: "My Top 5",
    panelTop5Hint: "Rank your favorites",
    btnRent: "Rent",
    btnTop5: "Top 5",
    btnReturn: "Return",
    msgTop5Full: "Screenshot and share your Top 5 with friends!",
    ariaMoveUp: "Move up",
    ariaMoveDown: "Move down",
    ariaRemove: "Remove",
    gamesCatalogTitle: "Games catalog",
    gamesCatalogBodyHtml:
      "Add your RAWG API key in <code>app.js</code> (<code>RAWG_KEY</code>) to load new releases here.",
    loadErrorTitle: "Couldn't load titles",
    loadErrorBody: "Check your connection and try again.",
    searchUnavailableTitle: "Search unavailable",
    searchUnavailableBodyHtml: "Add a RAWG API key to search games.",
    searchFailedSub: "Something went wrong — try again.",
    searchErrorTitle: "Search error",
    searchErrorBody: "Check your connection and try again.",
    noMatchesTitle: "No matches",
    noMatchesBodyHtml:
      "Try another title or clear search to see <strong>Now Available!</strong>",
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
    tabGames: "Jogos",
    panelRentals: "Minhas locações",
    panelRentalsHint: "Até 10 por categoria",
    searchLabel: "Buscar no catálogo",
    searchPlaceholder: "Buscar títulos, elenco, gêneros…",
    nowAvailable: "LANÇAMENTOS!",
    browseSubMovies: "Grandes estreias e sucessos",
    browseSubTv: "No ar — séries em destaque",
    browseSubCartoons: "Animações para assistir em família",
    browseSubGames: "Lançamentos recentes e bem avaliados",
    panelTop5: "Meu Top 5",
    panelTop5Hint: "Organize seus favoritos",
    btnRent: "Alugar",
    btnTop5: "Top 5",
    btnReturn: "Devolver",
    msgTop5Full: "Capture a tela e mostre seu Top 5 aos amigos!",
    ariaMoveUp: "Subir",
    ariaMoveDown: "Descer",
    ariaRemove: "Remover",
    gamesCatalogTitle: "Catálogo de jogos",
    gamesCatalogBodyHtml:
      "Adicione sua chave da API RAWG em <code>app.js</code> (<code>RAWG_KEY</code>) para carregar lançamentos aqui.",
    loadErrorTitle: "Não foi possível carregar",
    loadErrorBody: "Verifique sua conexão e tente de novo.",
    searchUnavailableTitle: "Busca indisponível",
    searchUnavailableBodyHtml:
      "Adicione uma chave da API RAWG para buscar jogos.",
    searchFailedSub: "Algo deu errado — tente novamente.",
    searchErrorTitle: "Erro na busca",
    searchErrorBody: "Verifique sua conexão e tente de novo.",
    noMatchesTitle: "Nada encontrado",
    noMatchesBodyHtml:
      "Tente outro título ou limpe a busca para ver <strong>Agora disponível!</strong>",
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

const state = JSON.parse(localStorage.getItem("hub")) || {
  movies: { rental: [], top: [] },
  tv: { rental: [], top: [] },
  cartoons: { rental: [], top: [] },
  games: { rental: [], top: [] },
};

const save = () => localStorage.setItem("hub", JSON.stringify(state));

const browseSubKey = {
  movies: "browseSubMovies",
  tv: "browseSubTv",
  cartoons: "browseSubCartoons",
  games: "browseSubGames",
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

  setBrowseSub();
  let items = [];
  const loc = tmdbLocale();

  try {
    if (tab === "games") {
      if (!RAWG_KEY || RAWG_KEY.includes("CHAVE")) {
        renderGrid([], {
          emptyHtml: emptyHubHtml("gamesCatalogTitle", "gamesCatalogBodyHtml"),
        });
        return;
      }
      const r = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_KEY}&ordering=-released&page_size=24`,
      );
      const d = await r.json();
      items = (d.results || []).map(mapGame);
    } else if (tab === "movies") {
      const r = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&${loc}&page=1`,
      );
      const d = await r.json();
      items = (d.results || []).filter((i) => i.vote_count >= 50).map(mapMedia);
    } else if (tab === "tv") {
      const r = await fetch(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${TMDB_KEY}&${loc}&page=1`,
      );
      const d = await r.json();
      items = (d.results || []).filter((i) => i.vote_count >= 50).map(mapMedia);
    } else if (tab === "cartoons") {
      const r = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&${loc}&with_genres=16&sort_by=popularity.desc&vote_count.gte=100&page=1`,
      );
      const d = await r.json();
      items = (d.results || []).map(mapMedia);
    }
  } catch {
    renderGrid([], {
      emptyHtml: emptyHubHtml("loadErrorTitle", "loadErrorBody"),
    });
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

  let items = [];
  const loc = tmdbLocale();

  try {
    if (tab === "games") {
      if (!RAWG_KEY || RAWG_KEY.includes("CHAVE")) {
        renderGrid([], {
          emptyHtml: emptyHubHtml(
            "searchUnavailableTitle",
            "searchUnavailableBodyHtml",
          ),
        });
        return;
      }
      const r = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(q)}&page_size=24`,
      );
      const d = await r.json();
      items = (d.results || []).map(mapGame);
    } else {
      const type = tab === "movies" ? "movie" : "tv";

      const r = await fetch(
        `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_KEY}&${loc}&query=${encodeURIComponent(q)}`,
      );
      const d = await r.json();

      items = (d.results || [])
        .filter((i) => i.vote_average >= 3 && i.vote_count >= 500)
        .map(mapMedia);

      if (tab === "cartoons") {
        items = items.filter((i) => i.genres?.includes(16));
      }
    }
  } catch {
    const sub = document.getElementById("browse-sub");
    if (sub) sub.textContent = t("searchFailedSub");
    renderGrid([], {
      emptyHtml: emptyHubHtml("searchErrorTitle", "searchErrorBody"),
    });
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

function mapGame(i) {
  return {
    id: i.id,
    title: i.name,
    year: i.released?.split("-")[0],
    image: i.background_image,
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function renderGrid(items, opts = {}) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  if (opts.emptyHtml && (!items || items.length === 0)) {
    grid.innerHTML = opts.emptyHtml;
    return;
  }

  items.forEach((item) => {
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
          <button type="button" class="btn btn-primary btn-rent">${esc(t("btnRent"))}</button>
          <button type="button" class="btn btn-ghost btn-top">${esc(t("btnTop5"))}</button>
        </div>
      </div>
    `;

    el.querySelector(".btn-rent").onclick = () => rent(item);
    el.querySelector(".btn-top").onclick = () => addTop(item);

    grid.appendChild(el);
  });
}

function rent(item) {
  const list = state[tab].rental;
  if (list.length >= 10) return;
  if (!list.find((i) => i.id === item.id)) {
    list.push(item);
    save();
    render();
  }
}

function addTop(item) {
  const list = state[tab].top;
  if (list.length >= 5) return;
  if (!list.find((i) => i.id === item.id)) {
    list.push(item);
    save();
    render();
  }
}

function render() {
  updateTabButtons();
  renderRental();
  renderTop();
}

function renderRental() {
  const el = document.getElementById("rental");
  el.innerHTML = "";

  state[tab].rental.forEach((i) => {
    el.innerHTML += `
      <div class="item">
        <span class="item-title">${esc(i.title)}</span>
        <button type="button" class="btn btn-small" onclick="removeRental(${i.id})">${esc(t("btnReturn"))}</button>
      </div>`;
  });
}

function removeRental(id) {
  state[tab].rental = state[tab].rental.filter((i) => i.id !== id);
  save();
  render();
}

function renderTop() {
  const el = document.getElementById("top");
  const msg = document.getElementById("msg");
  el.innerHTML = "";

  state[tab].top.forEach((i, index) => {
    const medal = ["🥇", "🥈", "🥉"][index] || "";

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
