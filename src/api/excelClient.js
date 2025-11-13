// src/api/excelClient.js
import * as XLSX from "xlsx";

/* ---------------- URL pública respeitando BASE_URL OU <base href> --------------- */
function getBase() {
  // Vite injeta BASE_URL em build (ex.: "/LOG/"). Em dev é "/".
  const viteBase = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/";
  const htmlBase = (typeof document !== "undefined" && document.querySelector("base")?.getAttribute("href")) || "/";
  const b = (viteBase || htmlBase || "/").trim();
  return b.endsWith("/") ? b.slice(0, -1) : b;
}
function publicUrl(path) {
  const base = getBase();
  const p = String(path).replace(/^\/+/, "");
  return `${base}/${p}`; // ex.: /LOG/data/Solicitacoes.xlsx
}

/* ---------------- mapeamento de colunas ---------------- */
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
  "CIDADE CUSTOS": "custo_cidade",
};

/* ---------------- leitura/normalização ---------------- */
const READ_OPTS = { type: "array", dense: true, cellDates: true, cellNF: false, cellText: false };

function normalizar(t){return String(t||"").normalize("NFD").replace(/\p{Diacritic}/gu,"").toUpperCase().trim();}
function num(v){if(v==null)return 0;if(typeof v==="number")return v;return Number(String(v).replace(/[^0-9.-]/g,""))||0;}
function splitChassi(v){return String(v||"").split(/[,\n;/|]+/).map(s=>s.trim()).filter(Boolean);}
function parseBRDate(val){
  if(!val) return null;
  if(val instanceof Date && !isNaN(val)) return val;
  const s=String(val).trim(); const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(m){const [,dd,mm,yyyy]=m; const d=new Date(+yyyy, +mm-1, +dd); return isNaN(d)?null:d;}
  const d2=new Date(s); return isNaN(d2)?null:d2;
}
function toBR(d){if(!d||isNaN(d))return"";return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;}
function toKey(d){if(!d||isNaN(d))return"";return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}

const CIDADES_DISPLAY = ["PONTA GROSSA","CASTRO","ARAPOTI","TIBAGI","IRATI","PRUDENTÓPOLIS","GUARAPUAVA","QUEDAS DO IGUAÇU"];
const CIDADES_MAP = new Map(CIDADES_DISPLAY.map(lbl => [normalizar(lbl), lbl]));
function extrairCidadeCanon(txt){
  const T = normalizar(txt||"");
  for (const [norm,label] of CIDADES_MAP) if (T.includes(norm)) return label;
  return null;
}

function normalizeRow(row, idx){
  const o = {};
  for(const [col,key] of Object.entries(headerMap)){
    const v=row[col];
    if(key==="km"||key==="valor_prop"||key==="valor_terc") o[key]=num(v);
    else if(key==="chassi_lista") o[key]=splitChassi(v);
    else o[key]=typeof v==="string"?v.trim():v;
  }
  // SEMPRE PREV; REAL ignorado
  const dPrev = parseBRDate(o.previsao_raw);
  const dReal = parseBRDate(o.real_raw);
  o._previsao_date = dPrev;
  o._real_date = dReal;
  o.previsao_br = toBR(dPrev);
  o.real_br = toBR(dReal);
  o._previsao_key = toKey(dPrev); // local, sem UTC

  o._status_up = normalizar(o.status);
  o._status_base = o._status_up.replace(/\s*\(D\)\s*/g, "");

  const estaCanon = extrairCidadeCanon(o.esta || o.estao_em);
  const vaiCanon  = extrairCidadeCanon(o.vai  || o.vai_para);
  o.esta = estaCanon || o.esta || o.estao_em || "";
  o.vai  = vaiCanon  || o.vai  || o.vai_para  || "";

  o.id = idx+1;
  return o;
}

/* ---------------- loader público: SEMPRE public/data/Solicitacoes.xlsx ---------------- */
export async function loadSolicitacoesFromExcel(){
  const url = publicUrl("data/Solicitacoes.xlsx");
  // logar pra você ver no Network a URL exata
  console.info("[solicitacoes] fetch:", url);

  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) {
    const msg = `Falha ao buscar ${url} (HTTP ${resp.status}). Verifique se o arquivo existe nesse caminho, com S maiúsculo.`;
    console.error("[solicitacoes]", msg);
    throw new Error(msg);
  }

  const buf = await resp.arrayBuffer();
  const wb = XLSX.read(buf, READ_OPTS);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
  const out  = rows.map((row,i)=>normalizeRow(row,i));
  if (!out.length) console.warn("[solicitacoes] Planilha sem linhas ou cabeçalhos divergentes.");
  return out;
}
