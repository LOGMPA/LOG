// src/api/excelClient.js
import * as XLSX from "xlsx";

/* ===================== base pública (respeita <base href>) ===================== */
function publicUrl(path) {
  const base = document.querySelector("base")?.getAttribute("href") || "/";
  const a = base.replace(/\/+$/, "");
  const b = String(path).replace(/^\/+/, "");
  return `${a}/${b}`;
}

/* ===================== mapeamento de colunas da planilha ===================== */
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

/* ===================== leitura enxuta do XLSX ===================== */
const READ_OPTS = {
  type: "array",
  dense: true,
  cellDates: true,
  cellNF: false,
  cellText: false,
};

/* ===================== utils rápidos ===================== */
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
  return String(v).split(/[,\n;/|]+/).map(s => s.trim()).filter(Boolean);
}
// dd/MM/yyyy -> Date local (sem UTC, sem D-1)
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
  return `${y}-${m}-${day}`; // yyyy-MM-dd local
}

/* ===================== cidades oficiais com acento certo ===================== */
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

/* ===================== normaliza uma linha ===================== */
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

  // SEMPRE PREV (REAL ignorado), com chave local (mata D-1)
  const dPrev = parseBRDate(o.previsao_raw);
  const dReal = parseBRDate(o.real_raw);
  o._previsao_date = dPrev;
  o._real_date = dReal;
  o.previsao_br = toBR(dPrev);
  o.real_br = toBR(dReal);
  o._previsao_key = toKey(dPrev);

  // status helpers
  o._status_up = normalizar(o.status);
  o._status_base = o._status_up.replace(/\s*\(D\)\s*/g, "");

  // cidades oficiais com acento correto
  const estaCanon = extrairCidadeCanon(o.esta || o.estao_em);
  const vaiCanon = extrairCidadeCanon(o.vai || o.vai_para);
  o.esta = estaCanon || o.esta || o.estao_em || "";
  o.vai = vaiCanon || o.vai || o.vai_para || "";

  o.id = idx + 1;
  return o;
}

/* ===================== loader público ===================== */
export async function loadSolicitacoesFromExcel() {
  // usa exatamente LOG/public/data/Solicitacoes.xlsx (considerando <base href>)
  const url = publicUrl("data/Solicitacoes.xlsx");

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`Falha ao buscar ${url} (HTTP ${resp.status}). Confere se o arquivo está em public/data/Solicitacoes.xlsx e com S maiúsculo.`);
  }

  const buf = await resp.arrayBuffer();
  const wb = XLSX.read(buf, READ_OPTS);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
  const out = rows.map((row, i) => normalizeRow(row, i));

  if (!out.length) {
    console.warn("[solicitacoes] Planilha lida porém sem linhas. Revise cabeçalhos.");
  }
  return out;
}
