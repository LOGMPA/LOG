// src/api/excelClient.js
import * as XLSX from "xlsx";

/**
 * Objetivo:
 * - Ler Excel mais rápido (dense + menos formatação)
 * - Datas em pt-BR (dd/MM/aaaa) -> Date, BR string e chave yyyy-MM-dd
 * - Cidades: casar com e sem acento e exibir com acento correto
 * - Pré-computar campos para filtros/sorts (evitar parse a cada render)
 */

const READ_OPTS = {
  type: "array",
  dense: true,
  cellDates: true,
  cellNF: false,
  cellText: false,
};

// Cabeçalhos -> chaves internas
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

/* =========================
   Normalização e Utilitários
   ========================= */
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
    .map((s) => s.trim())
    .filter(Boolean);
}

// Datas BR
function parseBRDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value)) return value;
  const s = String(value).trim();

  // dd/MM/yyyy
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d) ? null : d;
  }

  // fallback: tentar Date
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

/* =========================
   Cidades: casar com e sem acento,
   exibir com acento oficial
   ========================= */
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

// Mapa: normalizado -> rótulo com acento bonito
const CIDADES_MAP = (() => {
  const map = new Map();
  for (const label of CIDADES_DISPLAY) {
    map.set(normalizar(label), label);
  }
  return map;
})();

function extrairCidadeCanon(textoLivre) {
  if (!textoLivre) return null;
  const T = normalizar(textoLivre);
  for (const [norm, label] of CIDADES_MAP.entries()) {
    if (T.includes(norm)) return label; // retorna rótulo com acento correto
  }
  return null;
}

/* =========================
   Loader principal
   ========================= */
export async function loadSolicitacoesFromExcel() {
  // Ajuste a URL conforme seu build/host
  const resp = await fetch("/data/solicitacoes.xlsx");
  const buf = await resp.arrayBuffer();

  const wb = XLSX.read(buf, READ_OPTS);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

  const out = rows.map((row, idx) => {
    const o = {};

    // Mapeia colunas base
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

    // Datas BR: previsao/real
    const dPrev = parseBRDate(o.previsao_raw);
    const dReal = parseBRDate(o.real_raw);
    o._previsao_date = dPrev;
    o._real_date = dReal;
    o.previsao_br = toBR(dPrev);
    o.real_br = toBR(dReal);
    o._previsao_key = toKey(dPrev);
    o._real_key = toKey(dReal);

    // Status: auxiliares
    o._status_up = normalizar(o.status);
    o._status_base = o._status_up.replace(/\s*\(D\)\s*/g, "");

    // Cidades: casar com/sem acento e exibir com acento correto
    const estaCanon = extrairCidadeCanon(o.esta || o.estao_em);
    const vaiCanon = extrairCidadeCanon(o.vai || o.vai_para);
    o.esta = estaCanon || o.esta || o.estao_em || "";
    o.vai = vaiCanon || o.vai || o.vai_para || "";

    o.id = idx + 1;
    return o;
  });

  return out;
}
