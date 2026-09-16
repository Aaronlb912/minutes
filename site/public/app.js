const STORE = "minutes-desk-v1";

const q = document.getElementById("q");
const form = document.getElementById("search-form");
const rows = document.getElementById("rows");
const status = document.getElementById("status");
const empty = document.getElementById("empty");
const detail = document.getElementById("detail");
const recordForm = document.getElementById("record-form");
const recordTitle = document.getElementById("record-form-title");
const recordErr = document.getElementById("record-err");
const recordSave = document.getElementById("record-save");
const recordCancel = document.getElementById("record-cancel");
const deskForm = document.getElementById("desk-form");
const deskErr = document.getElementById("desk-err");
const fileMsg = document.getElementById("file-msg");
const loadFile = document.getElementById("load-file");

let fixture = { clerk: {}, records: [] };
let clerk = {};
let records = [];
let selectedId = null;
let editingId = null;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(u8) {
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concatBytes(parts) {
  const len = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const local = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      file.data,
    ]);
    locals.push(local);
    centrals.push(
      concatBytes([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(file.data.length),
        u32(file.data.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ])
    );
    offset += local.length;
  }
  const localBlob = concatBytes(locals);
  const centralBlob = concatBytes(centrals);
  return concatBytes([
    localBlob,
    centralBlob,
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralBlob.length),
    u32(localBlob.length),
    u16(0),
  ]);
}

function saveBlob(filename, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

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
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortRecords() {
  records.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function persist() {
  localStorage.setItem(STORE, JSON.stringify({ clerk, records }));
}

function placeLine() {
  const city = clerk.city || "";
  const state = clerk.state || "";
  const zip = clerk.zip || "";
  return [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
}

function parsePlace(text) {
  const t = text.trim();
  const m = t.match(/^(.*),\s*([^,]+?)\s+(\d[\d-]*)$/);
  if (m) return { city: m[1].trim(), state: m[2].trim(), zip: m[3].trim() };
  const m2 = t.match(/^(.*),\s*([^,]+)$/);
  if (m2) return { city: m2[1].trim(), state: m2[2].trim(), zip: "" };
  return { city: t, state: "", zip: "" };
}

function paintDesk() {
  document.getElementById("village-line").textContent = clerk.village || "";
  document.getElementById("desk-line").textContent = clerk.desk || "Village Clerk";
  document.title = `Minutes and ordinances | ${clerk.desk || "Village Clerk"}`;
  const addr = [clerk.desk || "Village Clerk", clerk.street, placeLine()]
    .filter(Boolean)
    .join(", ");
  document.getElementById("foot-addr").textContent = addr;
  document.getElementById("foot-contact").textContent = [clerk.phone, clerk.email]
    .filter(Boolean)
    .join(" - ");
  document.getElementById("foot-hours").textContent = clerk.hours || "";
  document.getElementById("desk-village").value = clerk.village || "";
  document.getElementById("desk-name").value = clerk.desk || "";
  document.getElementById("desk-street").value = clerk.street || "";
  document.getElementById("desk-place").value = placeLine();
  document.getElementById("desk-phone").value = clerk.phone || "";
  document.getElementById("desk-email").value = clerk.email || "";
  document.getElementById("desk-hours").value = clerk.hours || "";
}

function renderDetail(rec) {
  if (!rec) {
    detail.innerHTML = `<p class="detail-hint">Click a row to read it here.</p>`;
    return;
  }
  detail.innerHTML = `
    <p class="meta">${esc(rec.type)} ${esc(rec.number)} · ${esc(formatDate(rec.date))}</p>
    <h2>${esc(rec.title)}</h2>
    <p>${esc(rec.body)}</p>
    <p class="detail-actions">
      <button type="button" id="edit-btn">Edit</button>
      <button type="button" class="secondary" id="remove-btn">Remove</button>
    </p>
  `;
  document.getElementById("edit-btn").addEventListener("click", () => startEdit(rec));
  document.getElementById("remove-btn").addEventListener("click", () => removeRecord(rec.id));
}

function render() {
  const query = q.value;
  const shown = records.filter((r) => matches(r, query));
  const still = shown.find((r) => r.id === selectedId);
  if (!still) {
    selectedId = null;
    renderDetail(null);
  } else {
    renderDetail(still);
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
      <td>${esc(rec.type)}</td>
      <td>${esc(rec.number)}</td>
      <td>${esc(formatDate(rec.date))}</td>
      <td>${esc(rec.title)}</td>
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
  render();
}

function newId() {
  return `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function clearRecordForm() {
  editingId = null;
  recordTitle.textContent = "Add a record";
  recordSave.textContent = "Add to the list";
  recordCancel.hidden = true;
  recordErr.hidden = true;
  recordErr.textContent = "";
  document.getElementById("rec-type").value = "Minutes";
  document.getElementById("rec-number").value = "";
  document.getElementById("rec-date").value = "";
  document.getElementById("rec-title").value = "";
  document.getElementById("rec-body").value = "";
}

function startEdit(rec) {
  editingId = rec.id;
  recordTitle.textContent = "Edit this record";
  recordSave.textContent = "Save changes";
  recordCancel.hidden = false;
  recordErr.hidden = true;
  document.getElementById("rec-type").value = rec.type === "Ordinance" ? "Ordinance" : "Minutes";
  document.getElementById("rec-number").value = rec.number;
  document.getElementById("rec-date").value = rec.date;
  document.getElementById("rec-title").value = rec.title;
  document.getElementById("rec-body").value = rec.body;
  recordForm.scrollIntoView({ block: "start" });
}

function readRecordFields() {
  return {
    type: document.getElementById("rec-type").value,
    number: document.getElementById("rec-number").value.trim(),
    date: document.getElementById("rec-date").value,
    title: document.getElementById("rec-title").value.trim(),
    body: document.getElementById("rec-body").value.trim(),
  };
}

function removeRecord(id) {
  const rec = records.find((r) => r.id === id);
  if (!rec) return;
  if (!confirm(`Remove “${rec.title}”?`)) return;
  records = records.filter((r) => r.id !== id);
  if (selectedId === id) selectedId = null;
  if (editingId === id) clearRecordForm();
  persist();
  render();
}

function normalizeRecord(raw, i) {
  if (!raw || typeof raw !== "object") return null;
  const type = raw.type === "Ordinance" ? "Ordinance" : "Minutes";
  const number = String(raw.number ?? "").trim();
  const date = String(raw.date ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const body = String(raw.body ?? "").trim();
  if (!number || !date || !title || !body) return null;
  return {
    id: String(raw.id ?? `imported-${i}`),
    type,
    number,
    date,
    title,
    body,
  };
}

function applyBundle(bundle, mode) {
  if (bundle.clerk && typeof bundle.clerk === "object") {
    clerk = { ...clerk, ...bundle.clerk };
  }
  const incoming = (bundle.records || [])
    .map((r, i) => normalizeRecord(r, i))
    .filter(Boolean);
  if (mode === "replace") {
    records = incoming;
  } else {
    records = incoming;
  }
  sortRecords();
  selectedId = null;
  clearRecordForm();
  paintDesk();
  persist();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  render();
});

q.addEventListener("input", render);

recordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = readRecordFields();
  const missing = [];
  if (!fields.number) missing.push("number");
  if (!fields.date) missing.push("date");
  if (!fields.title) missing.push("title");
  if (!fields.body) missing.push("text");
  if (missing.length) {
    recordErr.textContent = `Fill ${missing.join(", ")} before saving.`;
    recordErr.hidden = false;
    return;
  }
  recordErr.hidden = true;
  if (editingId) {
    const rec = records.find((r) => r.id === editingId);
    if (rec) Object.assign(rec, fields);
    selectedId = editingId;
  } else {
    const rec = { id: newId(), ...fields };
    records.push(rec);
    selectedId = rec.id;
    q.value = "";
  }
  sortRecords();
  persist();
  render();
  clearRecordForm();
});

recordCancel.addEventListener("click", () => {
  clearRecordForm();
});

deskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const village = document.getElementById("desk-village").value.trim();
  const desk = document.getElementById("desk-name").value.trim();
  if (!village || !desk) {
    deskErr.textContent = "Village line and desk name are required.";
    deskErr.hidden = false;
    return;
  }
  deskErr.hidden = true;
  const place = parsePlace(document.getElementById("desk-place").value);
  clerk = {
    village,
    desk,
    street: document.getElementById("desk-street").value.trim(),
    city: place.city,
    state: place.state,
    zip: place.zip,
    phone: document.getElementById("desk-phone").value.trim(),
    email: document.getElementById("desk-email").value.trim(),
    hours: document.getElementById("desk-hours").value.trim(),
  };
  persist();
  paintDesk();
  fileMsg.textContent = "Desk saved in this browser.";
});

document.getElementById("download-btn").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify({ clerk, records }, null, 2)],
    { type: "application/json" }
  );
  saveBlob("records.json", blob);
  fileMsg.textContent = "Downloaded records.json. Put it next to index.html in your copy of the folder.";
});

document.getElementById("kit-btn").addEventListener("click", async () => {
  const enc = new TextEncoder();
  try {
    const [html, css, js, readme] = await Promise.all([
      fetch("index.html").then((r) => {
        if (!r.ok) throw new Error("html");
        return r.text();
      }),
      fetch("styles.css").then((r) => {
        if (!r.ok) throw new Error("css");
        return r.text();
      }),
      fetch("app.js").then((r) => {
        if (!r.ok) throw new Error("js");
        return r.text();
      }),
      fetch("README.txt").then((r) => (r.ok ? r.text() : "")),
    ]);
    const json = JSON.stringify({ clerk, records }, null, 2) + "\n";
    const zip = zipStore([
      { name: "minutes/index.html", data: enc.encode(html) },
      { name: "minutes/styles.css", data: enc.encode(css) },
      { name: "minutes/app.js", data: enc.encode(js) },
      { name: "minutes/records.json", data: enc.encode(json) },
      { name: "minutes/README.txt", data: enc.encode(readme) },
    ]);
    saveBlob("minutes-search.zip", new Blob([zip], { type: "application/zip" }));
    fileMsg.textContent = "Downloaded minutes-search.zip. Unzip and copy the minutes folder into your site.";
  } catch {
    fileMsg.textContent = "Could not build the folder download. Copy site/public/ from the repo instead.";
  }
});

document.getElementById("load-btn").addEventListener("click", () => {
  loadFile.click();
});

loadFile.addEventListener("change", async () => {
  const file = loadFile.files[0];
  loadFile.value = "";
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const bundle = Array.isArray(parsed) ? { records: parsed } : parsed;
    const list = bundle.records;
    if (!Array.isArray(list)) throw new Error("no records array");
    const cleaned = list.map((r, i) => normalizeRecord(r, i)).filter(Boolean);
    if (!cleaned.length) {
      fileMsg.textContent = "That file had no usable records. Each one needs number, date, title, and text.";
      return;
    }
    applyBundle({ clerk: bundle.clerk, records: cleaned }, "replace");
    fileMsg.textContent = `Loaded ${cleaned.length} records from ${file.name}.`;
  } catch {
    fileMsg.textContent = "Could not read that file. Use a JSON export from this page.";
  }
});

document.getElementById("restore-btn").addEventListener("click", () => {
  if (!confirm("Replace what is in this browser with the sample Minerva records?")) return;
  localStorage.removeItem(STORE);
  clerk = structuredClone(fixture.clerk);
  records = structuredClone(fixture.records);
  sortRecords();
  selectedId = null;
  clearRecordForm();
  paintDesk();
  persist();
  render();
  fileMsg.textContent = "Sample records restored.";
});

const data = await fetch("records.json").then((r) => {
  if (!r.ok) throw new Error("records.json missing");
  return r.json();
});

fixture = {
  clerk: data.clerk || {},
  records: (data.records || []).map((r, i) => normalizeRecord(r, i)).filter(Boolean),
};

let stored = null;
try {
  stored = JSON.parse(localStorage.getItem(STORE) || "null");
} catch {
  stored = null;
}

if (stored && Array.isArray(stored.records) && stored.records.length) {
  clerk = { ...fixture.clerk, ...(stored.clerk || {}) };
  records = stored.records.map((r, i) => normalizeRecord(r, i)).filter(Boolean);
} else {
  clerk = structuredClone(fixture.clerk);
  records = structuredClone(fixture.records);
}

sortRecords();
paintDesk();
render();
