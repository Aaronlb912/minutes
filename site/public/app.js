const q = document.getElementById("q");
const form = document.getElementById("search-form");
const rows = document.getElementById("rows");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const detail = document.getElementById("detail");

let records = [];
let selectedId = null;

function haystack(rec) {
  return [rec.type, rec.number, rec.date, rec.title, rec.body]
    .join(" ")
    .toLowerCase();
}

function matches(rec, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = haystack(rec);
  return words.every((w) => hay.includes(w));
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderDetail(rec) {
  if (!rec) {
    detail.innerHTML = `<p class="detail-hint">Click a row to read it here.</p>`;
    return;
  }
  detail.innerHTML = `
    <p class="meta">${rec.type} ${rec.number} · ${formatDate(rec.date)}</p>
    <h2>${rec.title}</h2>
    <p>${rec.body}</p>
  `;
}

function render() {
  const query = q.value;
  const shown = records.filter((r) => matches(r, query));
  const still = shown.find((r) => r.id === selectedId);
  if (!still) {
    selectedId = null;
    renderDetail(null);
  }

  rows.replaceChildren();
  for (const rec of shown) {
    const tr = document.createElement("tr");
    tr.tabIndex = 0;
    tr.dataset.id = rec.id;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", `${rec.type} ${rec.number}: ${rec.title}`);
    tr.setAttribute("aria-selected", rec.id === selectedId ? "true" : "false");
    tr.innerHTML = `
      <td>${rec.type}</td>
      <td>${rec.number}</td>
      <td>${formatDate(rec.date)}</td>
      <td>${rec.title}</td>
    `;
    tr.addEventListener("click", () => select(rec.id));
    tr.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(rec.id);
      }
    });
    rows.appendChild(tr);
  }

  empty.hidden = shown.length > 0;
  if (shown.length === 0) {
    const quoted = query.trim() ? `“${query.trim()}”` : "your search";
    empty.textContent = `No records match ${quoted}.`;
  }

  if (!query.trim()) {
    status.textContent = `${records.length} records. Type a word to filter.`;
  } else if (shown.length === 0) {
    status.textContent = "0 matches.";
  } else if (shown.length === 1) {
    status.textContent = `1 match for “${query.trim()}”.`;
  } else {
    status.textContent = `${shown.length} matches for “${query.trim()}”.`;
  }
}

function select(id) {
  selectedId = id;
  const rec = records.find((r) => r.id === id);
  renderDetail(rec);
  for (const tr of rows.querySelectorAll("tr")) {
    tr.setAttribute("aria-selected", tr.dataset.id === id ? "true" : "false");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  render();
});

q.addEventListener("input", render);

const data = await fetch("records.json").then((r) => {
  if (!r.ok) throw new Error("records.json missing");
  return r.json();
});

records = data.records.slice().sort((a, b) => b.date.localeCompare(a.date));
render();
