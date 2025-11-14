// src/api/excelClient.js
import * as XLSX from "xlsx";

/* ---------------- CONFIG: BASE.xlsx NO ONEDRIVE ---------------- */

// URL PÚBLICA do BASE.xlsx (espelhado pelo Power Automate)
const EXCEL_URL =
  "https://1drv.ms/x/c/4b504997c31a5c11/EePSIm4WTQZIivVHJe986k0BTZe_W-1ddMjAwvRXlFwOlg?download=1";

// Nome exato da guia que vamos usar dentro do BASE.xlsx
const SHEET_NAME = "FRETE MÁQUINAS";

/* ---------------- mapeamento de colunas ---------------- */
/**
 * Aqui o header **exato** da planilha vira uma chave mais amigável.
 * IMPORTANTE: "FILIAL CUSTOS" agora entra como custo_cidade (pra não quebrar gráfico antigo).
 */
const headerMap = {
  "STATUS": "status",
  "FRETE": "frete",
  "HR": "hr",
  "KM": "km",
  "R$ PROP": "valor_prop",
  "R$ TERC": "valor_terc",
  "CHASSI": "chassi_lista",
  "PREV": "previsao_raw",
  "REAL": "real_raw",              // ignorado na lógica, mas mantido pra compat
  "CLIENTE/NOTA": "nota",
  "SOLICITANTE": "solicitante",
  "ESTÁ:": "esta",
  "VAI:": "vai",
  "TIPO": "tipo",
  "ESTÁ EM:": "estao_em",
  "VAI PARA:": "vai_para",
  "OBS": "obs",
  "FILIAL CUSTOS": "custo_cidade",
};

/* ---------------- helpers numéricos / datas / normalização ---------------- */

const READ_OPTS = {
  type: "array",
  dense: true,
  cellDates: true,
  cellNF: false,
  cellText: false,
};

function normalizar(t) {
  return String(t || "")
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
  return String(v || "")
    .split(/[,\n;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBRDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val)) return val;

  const s = String(val).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(+yyyy, +mm - 1, +dd);
    return isNaN(d) ? null : d;
  }

  const d2 = new Date(s);
  return isNaN(d2) ? null : d2;
}

function toBR(d) {
  if (!d || isNaN(d)) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function toKey(d) {
  if (!d || isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------------- cidades / display ---------------- */

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
const CIDADES_MAP = new Map(
  CIDADES_DISPLAY.map((lbl) => [normalizar(lbl), lbl])
);

function extrairCidadeCanon(txt) {
  const T = normalizar(txt || "");
  for (const [norm, label] of CIDADES_MAP) {
    if (T.includes(norm)) return label;
  }
  return null;
}

/* ---------------- normalização de cada linha ---------------- */

function normalizeRow(row, idx) {
  const o = {};

  // mapeia cabeçalhos -> chaves internas
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

  // DATA: SEMPRE PREV (REAL ignorado pra painel, mas mantido br/keys)
  const dPrev = parseBRDate(o.previsao_raw);
  const dReal = parseBRDate(o.real_raw);

  o._previsao_date = dPrev;
  o._real_date = dReal;
  o.previsao_br = toBR(dPrev);
  o.real_br = toBR(dReal);
  o._previsao_key = toKey(dPrev); // pra ordenação local

  // STATUS: com e sem (D)
  o._status_up = normalizar(o.status);
  o._status_base = o._status_up.replace(/\s*\(D\)\s*/g, "");
  o.is_demo = o._status_up.includes("(D)");

  // CIDADES x LINKS:
  // ESTÁ: / VAI: -> texto humano (PONTA GROSSA / CLIENTE...)
  // ESTÁ EM: / VAI PARA: -> "MPA" ou link (https)
  const estaCanon = extrairCidadeCanon(o.esta);
  const vaiCanon = extrairCidadeCanon(o.vai);

  // cidade para display (origem/destino)
  o.esta = estaCanon || o.esta || "";
  o.vai = vaiCanon || o.vai || "";

  // links brutos
  const estaEmRaw = String(o.estao_em || "").trim();
  const vaiParaRaw = String(o.vai_para || "").trim();
  const estaEmUp = normalizar(estaEmRaw);
  const vaiParaUp = normalizar(vaiParaRaw);

  // flags MPA
  o.origem_mpa = estaEmUp === "MPA";
  o.destino_mpa = vaiParaUp === "MPA";

  // links finais (null se vazio ou MPA)
  o.origem_link =
    !estaEmRaw || o.origem_mpa || !estaEmRaw.startsWith("http")
      ? null
      : estaEmRaw;
  o.destino_link =
    !vaiParaRaw || o.destino_mpa || !vaiParaRaw.startsWith("http")
      ? null
      : vaiParaRaw;

  // transferência entre filiais = MPA/MPA
  o.is_transferencia = o.origem_mpa && o.destino_mpa;

  // ID estável
  o.id = idx + 1;

  return o;
}

/* ---------------- loader público: agora via BASE.xlsx no OneDrive ---------------- */

export async function loadSolicitacoesFromExcel() {
  const url = EXCEL_URL;
  console.info("[solicitacoes] fetch BASE.xlsx:", url);

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    const msg = `Falha ao buscar ${url} (HTTP ${resp.status}). Verifique se o link público do BASE.xlsx está correto.`;
    console.error("[solicitacoes]", msg);
    throw new Error(msg);
  }

  const buf = await resp.arrayBuffer();
  const wb = XLSX.read(buf, READ_OPTS);

  // Tenta usar FRETE MÁQUINAS; se alguém renomear, cai na primeira aba
  const ws = wb.Sheets[SHEET_NAME] || wb.Sheets[wb.SheetNames[0]];
  if (!ws) {
    const msg = `Guia "${SHEET_NAME}" não encontrada no BASE.xlsx.`;
    console.error("[solicitacoes]", msg);
    throw new Error(msg);
  }

  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
  const out = rows
    .map((row, i) => normalizeRow(row, i))
    // filtra o lixo 100% vazio
    .filter((r) => normalizar(r.status) || (r.chassi_lista && r.chassi_lista.length));

  if (!out.length) {
    console.warn(
      "[solicitacoes] FRETE MÁQUINAS sem linhas úteis ou cabeçalho divergente."
    );
  }

  return out;
}
