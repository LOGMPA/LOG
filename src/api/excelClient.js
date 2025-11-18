// src/api/excelClient.js
import * as XLSX from "xlsx";

/* ---------------- CONFIG: BASE.xlsx ---------------- */

// Arquivo BASE.xlsx servido pelo próprio GitHub Pages
export const EXCEL_URL = "https://logmpa.github.io/LOG/data/BASE.xlsx";

// Nome exato da guia que vamos usar dentro do BASE.xlsx
const SHEET_NAME = "FRETE MÁQUINAS";

/* ---------------- helpers ---------------- */

const READ_OPTS = {
  type: "array",
  cellDates: true,
  dense: true,
};

function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return Number(String(v).replace(/[^0-9,-.]/g, "").replace(".", "").replace(",", ".")) || 0;
}

function parseDateBR(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;

  const s = String(v).trim();
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
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toKey(d) {
  if (!d || isNaN(d)) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function splitChassi(v) {
  return String(v || "")
    .split(/[,\n;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normUp(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

/* ---------------- normalização de linha ---------------- */

function normalizeRow(row, idx) {
  const r = { ...row };

  const status = String(r["STATUS"] || "").trim();
  const frete = String(r["FRETE"] || "").trim();
  const hr = r["HR"];
  const km = toNumber(r["KM"]);
  const valorProp = toNumber(r["R$ PROP"]);
  const valorTerc = toNumber(r["R$ TERC"]);
  const chassiLista = splitChassi(r["CHASSI"]);
  const prevRaw = r["PREV"];
  const realRaw = r["REAL"];
  const nota = String(r["CLIENTE/NOTA"] || "").trim();
  const solicitante = String(r["SOLICITANTE"] || "").trim();
  const esta = String(r["ESTÁ:"] || "").trim();
  const vai = String(r["VAI:"] || "").trim();
  const tipo = String(r["TIPO"] || "").trim();
  const estaoEm = String(r["ESTÁ EM:"] || "").trim();
  const vaiPara = String(r["VAI PARA:"] || "").trim();
  const obs = String(r["OBS"] || "").trim();
  const custoCidade = String(r["FILIAL CUSTOS"] || "").trim();

  const dPrev = parseDateBR(prevRaw);
  const dReal = parseDateBR(realRaw);

  const statusUp = normUp(status);
  const statusBase = statusUp.replace(/\s*\(D\)\s*/g, "");
  const isDemo = statusUp.includes("(D)");

  // Link: pega de ESTÁ EM / VAI PARA se tiver http
  let loc = null;
  if (estaoEm.startsWith("http")) loc = estaoEm;
  else if (vaiPara.startsWith("http")) loc = vaiPara;

  return {
    // campos brutos / display
    status,
    frete,
    hr,
    km,
    valor_prop: valorProp,
    valor_terc: valorTerc,
    chassi_lista: chassiLista,
    previsao_raw: prevRaw,
    real_raw: realRaw,
    previsao_br: toBR(dPrev),
    real_br: toBR(dReal),
    nota,
    solicitante,
    esta,
    vai,
    tipo,
    estao_em: estaoEm,
    vai_para: vaiPara,
    obs,
    custo_cidade: custoCidade,
    loc,

    // metadados usados nos filtros/telas
    _status_up: statusUp,
    _status_base: statusBase,
    is_demo: isDemo,
    _previsao_date: dPrev,
    _real_date: dReal,
    _previsao_key: toKey(dPrev),

    id: idx + 1,
  };
}

/* ---------------- loader público ---------------- */

export async function loadSolicitacoesFromExcel() {
  console.info("[excelClient] Buscando BASE.xlsx em:", EXCEL_URL);

  const resp = await fetch(EXCEL_URL, { cache: "no-store" });
  if (!resp.ok) {
    const msg = `Falha ao buscar ${EXCEL_URL} (HTTP ${resp.status}).`;
    console.error("[excelClient]", msg);
    throw new Error(msg);
  }

  const buf = await resp.arrayBuffer();
  const wb = XLSX.read(buf, READ_OPTS);

  const ws =
    wb.Sheets[SHEET_NAME] ||
    wb.Sheets[wb.SheetNames.find((n) => n === SHEET_NAME)] ||
    wb.Sheets[wb.SheetNames[0]];

  if (!ws) {
    const msg = `Guia "${SHEET_NAME}" não encontrada no BASE.xlsx.`;
    console.error("[excelClient]", msg);
    throw new Error(msg);
  }

  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

  const out = rows
    .map((row, i) => normalizeRow(row, i))
    .filter((r) => {
      // joga fora linha totalmente vazia
      return (
        r.status ||
        r.nota ||
        (r.chassi_lista && r.chassi_lista.length) ||
        r.previsao_br
      );
    });

  console.info("[excelClient] Linhas carregadas:", out.length);
  return out;
}
