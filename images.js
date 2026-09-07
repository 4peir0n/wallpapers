const allNames = Array.isArray(window.WALLPAPER_LIST) ? window.WALLPAPER_LIST : [];
const gallery = document.getElementById("gallery");
const count = document.getElementById("count");
const lede = document.getElementById("lede");
const search = document.getElementById("search");
const loadMore = document.getElementById("load-more");
const empty = document.getElementById("empty");
const sentinel = document.getElementById("sentinel");

const perPage = 14;
let ordered = allNames.slice();
let visible = 0;

function urlOf(name) {
  return "images/" + encodeURIComponent(name);
}
function thumbUrl(name) {
  return "thumbs/" + encodeURIComponent(name.replace(/\.[^.]+$/, "") + ".webp");
}

function updateCount() {
  const label = ordered.length === 1 ? "1 fondo" : ordered.length + " fondos";
  count.textContent = label;
  lede.textContent = ordered.length + " wallpapers a tamaño completo · clic para ver";
}

function renderBatch() {
  const end = Math.min(visible + perPage, ordered.length);
  for (let i = visible; i < end; i++) {
    const name = ordered[i];
    const w = document.createElement("div");
    w.className = "w";
    w.style.animationDelay = ((i - visible) % 10) * 25 + "ms";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = thumbUrl(name);
    img.alt = name;
    img.onload = () => w.classList.add("loaded");
    img.onerror = () => {
      if (img.dataset.tried) { w.classList.add("off"); return; }
      img.dataset.tried = "1";
      img.src = urlOf(name);
    };
    if (img.complete && img.naturalWidth > 0) w.classList.add("loaded");
    const cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = name;
    w.append(img, cap);
    w.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(w);
  }
  visible = end;
  loadMore.hidden = visible >= ordered.length;
  empty.hidden = ordered.length !== 0;
  updateCount();
}

function resetFlow(list) {
  ordered = list;
  gallery.innerHTML = "";
  visible = 0;
  renderBatch();
}

search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  const list = q ? allNames.filter(n => n.toLowerCase().includes(q)) : allNames.slice();
  resetFlow(list);
});

loadMore.addEventListener("click", renderBatch);

new IntersectionObserver(entries => {
  if (entries.some(e => e.isIntersecting)) renderBatch();
}, { rootMargin: "900px" }).observe(sentinel);

renderBatch();

const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbName = document.getElementById("lb-name");
const lbCount = document.getElementById("lb-count");
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  updateLightbox();
  lb.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = "";
}
function updateLightbox() {
  const name = ordered[lbIndex];
  const url = urlOf(name);
  lbImg.classList.remove("loaded");
  lbImg.dataset.tried = "";
  lbImg.onload = () => lbImg.classList.add("loaded");
  lbImg.onerror = () => { if (lbImg.dataset.tried) return; lbImg.dataset.tried = "1"; lbImg.src = thumbUrl(name); };
  lbImg.src = url;
  lbName.textContent = name;
  lbCount.textContent = (lbIndex + 1) + " / " + ordered.length;
  document.getElementById("lb-download").href = url;
}
function nav(delta) {
  lbIndex = (lbIndex + delta + ordered.length) % ordered.length;
  updateLightbox();
}

document.getElementById("lb-close").addEventListener("click", closeLightbox);
document.getElementById("lb-prev").addEventListener("click", () => nav(-1));
document.getElementById("lb-next").addEventListener("click", () => nav(1));
document.addEventListener("keydown", ev => {
  if (lb.hidden) return;
  if (ev.key === "Escape") closeLightbox();
  else if (ev.key === "ArrowLeft") nav(-1);
  else if (ev.key === "ArrowRight") nav(1);
});
lb.addEventListener("click", ev => { if (ev.target === lb) closeLightbox(); });