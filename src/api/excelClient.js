// src/api/excelClient.js
import * as XLSX from "xlsx";

const headerMap = {
  "STATUS": "status",
  "FRETE": "frete",
  "HR": "hr",
  "KM": "km",
  "R$ PROP": "valor_prop",
  "R$ TERC": "valor_terc",
  "CHASSI": "chassi_lista",
  "PREV": "previsao",
  "REAL": "real",
  "CLIENTE/NOTA": "nota",
  "SOLICITANTE": "solicitante",
  "ESTÁ:": "esta",
  "VAI:": "vai",
  "TIPO": "tipo",
  "ESTÁ EM:": "estao_em",
  "VAI PARA:": "vai_para",
  "OBS": "obs",
  "LOC": "loc"
};

function toDateString(v) {
  if (!v) return "";
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    const dt = new Date(Date.UTC(d.y, d.m - 1, d.d));
    return dt.toISOString().slice(0,10);
  }
  try {
    const dt = new Date(v);
    if (!isNaN(dt)) return dt.toISOString().slice(0,10);
  } catch {}
  return String(v);
}

function splitChassi(val) {
  if (!val) return [];
  return String(val).split(/[;,\n\r]+/).map(s => s.trim()).filter(Boolean);
}

async function fetchFirst(paths) {
  for (const p of paths) {
    const res = await fetch(p);
    if (res.ok) return { res, path: p };
  }
  throw new Error("Nenhum arquivo de dados encontrado nas opções: " + paths.join(", "));
}

export async function loadSolicitacoesFromExcel() {
  // tenta xlsx e csv, com e sem acento, e variações de caixa
  const candidates = [
    "data/Solicitacoes.xlsx",
    "data/solicitacoes.xlsx",
    "data/Solicitações.xlsx",
    "data/solicitações.xlsx",
    "data/Solicitacoes.csv",
    "data/solicitacoes.csv",
    "data/Solicitações.csv",
    "data/solicitações.csv",
  ];
  const { res, path } = await fetchFirst(candidates);
  const buf = await res.arrayBuffer();

  let wb;
  if (path.toLowerCase().endsWith(".csv")) {
    const text = new TextDecoder("utf-8").decode(new Uint8Array(buf));
    wb = XLSX.read(text, { type: "string" });
  } else {
    wb = XLSX.read(buf, { type: "array" });
  }

  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const mapped = rows.map((row, idx) => {
    const obj = {};
    Object.entries(row).forEach(([k, v]) => {
      const key = headerMap[k?.trim()];
      if (!key) return;
      if (key === "previsao" || key === "real") obj[key] = toDateString(v);
      else if (key === "km") obj[key] = Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      else if (key === "valor_prop" || key === "valor_terc") obj[key] = Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
      else if (key === "chassi_lista") obj[key] = splitChassi(v);
      else obj[key] = typeof v === "string" ? v.trim() : v;
    });
    obj.id = idx + 1;
    if (!obj.esta && row["ESTÁ EM:"]) obj.esta = String(row["ESTÁ EM:"]).trim();
    if (!obj.vai && row["VAI PARA:"]) obj.vai = String(row["VAI PARA:"]).trim();
    return obj;
  });

  return mapped;
}
