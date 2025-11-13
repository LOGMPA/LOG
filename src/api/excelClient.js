// src/api/excelClient.js
import * as XLSX from "xlsx";

/* =============== helpers de caminho público (base href safe) =============== */
function publicUrl(path) {
  const base = document.querySelector('base')?.getAttribute('href') || '/';
  const a = base.replace(/\/+$/, '');
  const b = String(path).replace(/^\/+/, '');
  return `${a}/${b}`;
}

/* ======================= XLSX read: rápido e enxuto ======================= */
const READ_OPTS = {
  type: "array",
  dense: true,
  cellDates: true,
  cellNF: false,
  cellText: false,
};

/* ======================= header map esperado na planilha ======================= */
const headerMap = {
  "STATUS": "status",
  "FRETE": "frete",
  "HR": "hr",
  "KM": "km",
  "R$ PROP": "valor_prop",
  "R$ TERC": "valor_terc",
  "CHASSI": "chassi_lista",
  "PREV": "previsao_raw",
  "REAL": "real_raw",
  "CLIENTE/NOTA": "nota",
  "SOLICITANTE": "solicitante",
  "ESTÁ:": "esta",
  "VAI:": "vai",
  "TIPO": "tipo",
  "ESTÁ EM:": "estao_em",
  "VAI PARA:": "vai_para",
  "OBS": "obs",
  "LOC": "loc",
};

/* ======================= utils ======================= */
function normalizar(txt) {
  return String(txt || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}
function num(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
}
function splitChassi(v) {
  if (!v) return [];
  return String(v)
    .split(/[,\n;/|]+/)
    .map(s => s.trim())
    .filter(Boolean);
}
// dd/MM/yyyy -> Date local (sem UTC)
function parseBRDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value)) return value;
  const s = String(value).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d) ? null : d;
  }
  const d2 = new Date(s);
  return isNaN(d2) ? null : d2;
}
function toBR(d) {
  if (!d || isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function toKey(d) {
  if (!d || isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ======================= cidades com acento bonito ======================= */
const CIDADES_DISPLAY = [
  "PONTA GROSSA",
  "CASTRO",
  "ARAPOTI",
  "TIBAGI",
  "IRATI",
  "PRUDENTÓPOLIS",
  "GUARAPUAVA",
  "QUEDAS DO IGUAÇU",
];
const CIDADES_MAP = (() => {
  const map = new Map();
  for (const label of CIDADES_DISPLAY) map.set(normalizar(label), label);
  return map;
})();
function extrairCidadeCanon(textoLivre) {
  if (!textoLivre) return null;
  const T = normalizar(textoLivre);
  for (const [norm, label] of CIDADES_MAP.entries()) {
    if (T.includes(norm)) return label;
  }
  return null;
}

/* ======================= carrega de XLSX OU JSON ======================= */
async function fetchArrayBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ao buscar ${url}`);
  return await r.arrayBuffer();
}
async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ao buscar ${url}`);
  return await r.json();
}

/* ======================= normalização de um item ======================= */
function normalizeRow(row, idx) {
  const o = {};
  for (const [col, key] of Object.entries(headerMap)) {
    const v = row[col];
    if (key === "km" || key === "valor_prop" || key === "valor_terc") {
      o[key] = num(v);
    } else if (key === "chassi_lista") {
      o[key] = splitChassi(v);
    } else {
      o[key] = typeof v === "string" ? v.trim() : v;
    }
  }

  // datas: SEMPRE usa PREV como base da UI
  const dPrev = parseBRDate(o.previsao_raw);
  const dReal = parseBRDate(o.real_raw);
  o._previsao_date = dPrev;
  o._real_date = dReal;
  o.previsao_br = toBR(dPrev);
  o.real_br = toBR(dReal);
  o._previsao_key = toKey(dPrev); // local key yyyy-MM-dd (sem UTC)

  // status helpers
  o._status_up = normalizar(o.status);
  o._status_base = o._status_up.replace(/\s*\(D\)\s*/g, "");

  // cidades canônicas com acento correto
  const estaCanon = extrairCidadeCanon(o.esta || o.estao_em);
  const vaiCanon = extrairCidadeCanon(o.vai || o.vai_para);
  o.esta = estaCanon || o.esta || o.estao_em || "";
  o.vai = vaiCanon || o.vai || o.vai_para || "";

  o.id = idx + 1;
  return o;
}

/* ======================= API pública ======================= */
export async function loadSolicitacoesFromExcel() {
  const xlsxUrl = publicUrl("data/solicitacoes.xlsx");
  const jsonUrl = publicUrl("data/solicitacoes.json");

  // 1) tenta XLSX
  try {
    const buf = await fetchArrayBuffer(xlsxUrl);
    const wb = XLSX.read(buf, READ_OPTS);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
    const out = rawRows.map((row, i) => normalizeRow(row, i));
    if (!out.length) console.warn("[solicitacoes] XLSX sem linhas… confere o cabeçalho.");
    return out;
  } catch (errX) {
    console.warn("[solicitacoes] Falha no XLSX, tentando JSON…", errX);
  }

  // 2) fallback JSON (mesmo shape de colunas do headerMap)
  try {
    const raw = await fetchJson(jsonUrl);
    if (!Array.isArray(raw)) throw new Error("JSON não é array");
    const out = raw.map((row, i) => normalizeRow(row, i));
    if (!out.length) console.warn("[solicitacoes] JSON sem linhas…");
    return out;
  } catch (errJ) {
    console.error("[solicitacoes] Falha geral ao carregar XLSX e JSON.", errJ);
    throw errJ;
  }
}
