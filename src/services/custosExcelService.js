// src/services/custosExcelService.js
// Painel Custos (GitHub Pages): lê direto do arquivo public/data/LOGISTICA.2026.xlsx
// e calcula os gráficos a partir das guias MAQUINAS e PEDIDOS.

import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.BASE_URL || "/";

// Arquivo publicado no GitHub Pages
const EXCEL_URL = `${BASE_URL}data/LOGISTICA.2026.xlsx`;

// Nomes esperados das guias (como você descreveu)
const SHEET_MAQUINAS = "MAQUINAS";
const SHEET_PEDIDOS = "PEDIDOS";

const READ_OPTS = {
  type: "array",
  cellDates: true,
  dense: true,
};

/* ---------------- helpers ---------------- */

function toNumber(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isNaN(v) ? 0 : v;
  const s = String(v)
    .replace(/R\$\s*/gi, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function normUp(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

function toDate(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;
  // Excel às vezes vem como número serial
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  // BR dd/mm/yyyy
  const s = String(v).trim();
  const m = s.match(/^\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(+yyyy, +mm - 1, +dd);
    return isNaN(d) ? null : d;
  }
  const d2 = new Date(s);
  return isNaN(d2) ? null : d2;
}

function toMonthKey(d) {
  if (!d || isNaN(d)) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function isConcluido(status) {
  const s = normUp(status);
  return s === "CONCLUIDO" || s === "CONCLUIDO (D)";
}

/* ---------------- workbook cache ---------------- */

let _wbPromise = null;

async function loadWorkbook() {
  if (_wbPromise) return _wbPromise;

  _wbPromise = (async () => {
    const resp = await fetch(EXCEL_URL, { cache: "no-store" });
    if (!resp.ok) {
      throw new Error(`Falha ao buscar ${EXCEL_URL} (HTTP ${resp.status}).`);
    }
    const buf = await resp.arrayBuffer();
    return XLSX.read(buf, READ_OPTS);
  })();

  return _wbPromise;
}

function getSheet(wb, name) {
  return wb.Sheets[name] || wb.Sheets[wb.SheetNames.find((n) => n === name)];
}

/* ---------------- loaders por guia ---------------- */

// GUIA MAQUINAS
// B STATUS | C DATA | D FRETE | E KM | F PROPRIO | G TERCEIRO | H FILIAL CUSTOS | I EQUIP | R TIPO
async function loadMaquinasRows() {
  const wb = await loadWorkbook();
  const ws = getSheet(wb, SHEET_MAQUINAS);
  if (!ws) throw new Error(`Guia "${SHEET_MAQUINAS}" não encontrada.`);

  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
  if (!matrix.length) return [];

  const out = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const status = String(row[1] || "").trim();
    const data = toDate(row[2]);
    const frete = String(row[3] || "").trim();
    const km = toNumber(row[4]);
    const proprio = toNumber(row[5]);
    const terceiro = toNumber(row[6]);
    const filial_custos = String(row[7] || "").trim();
    const equip = String(row[8] || "").trim();
    const tipo = String(row[17] || "").trim();

    // ignora linha totalmente vazia
    if (!status && !data && !frete && !km && !proprio && !terceiro && !filial_custos && !equip && !tipo) {
      continue;
    }

    out.push({
      status,
      data,
      mes: toMonthKey(data),
      frete,
      km,
      proprio,
      terceiro,
      filial_custos,
      equip,
      tipo,
    });
  }
  return out;
}

// GUIA PEDIDOS
// A TIPO | B FILIAL | C DATA | F FORNECEDOR | G VALOR
async function loadPedidosRows() {
  const wb = await loadWorkbook();
  const ws = getSheet(wb, SHEET_PEDIDOS);
  if (!ws) throw new Error(`Guia "${SHEET_PEDIDOS}" não encontrada.`);

  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
  if (!matrix.length) return [];

  const out = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const tipo = String(row[0] || "").trim();
    const filial = String(row[1] || "").trim();
    const data = toDate(row[2]);
    const fornecedor = String(row[5] || "").trim();
    const valor = toNumber(row[6]);

    if (!tipo && !filial && !data && !fornecedor && !valor) continue;

    out.push({
      tipo,
      filial,
      data,
      mes: toMonthKey(data),
      fornecedor,
      valor,
    });
  }
  return out;
}

/* ---------------- API pública (usada pelos componentes) ---------------- */

/**
 * Custos Máquinas
 * - Usa MAQUINAS (fretes concluídos) para os gráficos principais
 * - Usa PEDIDOS (Munck) para o gráfico de Munck
 */
export async function loadCustosMaquinas(mes = null) {
  const [maquinasAll, pedidosAll] = await Promise.all([
    loadMaquinasRows(),
    loadPedidosRows(),
  ]);

  const maquinas = maquinasAll
    .filter((m) => isConcluido(m.status))
    .filter((m) => (mes ? m.mes === mes : true));

  const pedidos = pedidosAll.filter((p) => (mes ? p.mes === mes : true));

  // ---------- Gráfico 01: "Meta vs Real" (aqui = média real por EQUIP)
  // Você não passou uma tabela de metas, então "meta" fica 0.
  const byEquip = {};
  for (const m of maquinas) {
    const k = String(m.equip || "OUTROS").trim() || "OUTROS";
    if (!byEquip[k]) byEquip[k] = { equip: k, total: 0, qtd: 0 };
    byEquip[k].total += (m.proprio || 0) + (m.terceiro || 0);
    byEquip[k].qtd += 1;
  }

  const grafico01MetaVsReal = Object.values(byEquip)
    .map((g) => ({
      item: g.equip,
      meta: 0,
      mediaAtual: g.qtd ? g.total / g.qtd : 0,
    }))
    .sort((a, b) => toNumber(b.mediaAtual) - toNumber(a.mediaAtual));

  // ---------- Gráfico 02: Soma custos + qtd por EQUIP
  const grafico02SomaCustos = Object.values(byEquip)
    .map((g) => {
      const proprio = maquinas
        .filter((m) => (String(m.equip || "OUTROS").trim() || "OUTROS") === g.equip)
        .reduce((acc, m) => acc + (m.proprio || 0), 0);
      const terceiro = maquinas
        .filter((m) => (String(m.equip || "OUTROS").trim() || "OUTROS") === g.equip)
        .reduce((acc, m) => acc + (m.terceiro || 0), 0);
      return {
        item: g.equip,
        somaProprio: proprio,
        somaTerceiro: terceiro,
        qtdFrete: g.qtd,
      };
    })
    .sort((a, b) => (toNumber(b.somaProprio) + toNumber(b.somaTerceiro)) - (toNumber(a.somaProprio) + toNumber(a.somaTerceiro)));

  // ---------- Gráfico 03: Terceiros (Top 10 por empresa/freteiro)
  const byFreteiro = {};
  for (const m of maquinas) {
    if (!m.frete) continue;
    const k = m.frete;
    if (!byFreteiro[k]) byFreteiro[k] = { transportadora: k, valor: 0, km: 0 };
    byFreteiro[k].valor += m.terceiro || 0;
    byFreteiro[k].km += m.km || 0;
  }
  const grafico03Terceiros = Object.values(byFreteiro)
    .filter((t) => toNumber(t.valor) > 0)
    .sort((a, b) => toNumber(b.valor) - toNumber(a.valor))
    .slice(0, 10);

  // ---------- Gráfico 05: Munck (vem da guia PEDIDOS)
  const grafico05Munck = Object.values(
    pedidos
      .filter((p) => normUp(p.tipo) === "MUNCK")
      .reduce((acc, p) => {
        const k = p.filial || "(Sem filial)";
        if (!acc[k]) acc[k] = { cidade: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  ).sort((a, b) => toNumber(b.valor) - toNumber(a.valor));

  return {
    grafico01MetaVsReal,
    grafico02SomaCustos,
    grafico03Terceiros,
    // no layout atual não tem gráfico 04
    grafico05Munck,
  };
}

/**
 * Custos Peças
 * - PEDIDOS: "Frete Peças M" (Motoboy/Courier) e "Frete Peças T" (Transportadoras)
 */
export async function loadCustosPecas(mes = null) {
  const pedidosAll = await loadPedidosRows();
  const pedidos = pedidosAll.filter((p) => (mes ? p.mes === mes : true));

  const isPecasM = (t) => normUp(t) === "FRETE PECAS M";
  const isPecasT = (t) => normUp(t) === "FRETE PECAS T";

  // 1) Motoboy por loja
  const grafico06MotoBoyPC = Object.values(
    pedidos
      .filter((p) => isPecasM(p.tipo))
      .reduce((acc, p) => {
        const k = p.filial || "(Sem filial)";
        if (!acc[k]) acc[k] = { cidade: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  ).sort((a, b) => toNumber(b.valor) - toNumber(a.valor));

  // 2) Transportadora por loja
  const grafico07TranspPC = Object.values(
    pedidos
      .filter((p) => isPecasT(p.tipo))
      .reduce((acc, p) => {
        const k = p.filial || "(Sem filial)";
        if (!acc[k]) acc[k] = { cidade: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  ).sort((a, b) => toNumber(b.valor) - toNumber(a.valor));

  // 3) Motoboy por fornecedor
  const grafico08PorMotoBoy = Object.values(
    pedidos
      .filter((p) => isPecasM(p.tipo))
      .reduce((acc, p) => {
        const k = p.fornecedor || "(Sem fornecedor)";
        if (!acc[k]) acc[k] = { empresa: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  )
    .sort((a, b) => toNumber(b.valor) - toNumber(a.valor))
    .slice(0, 12);

  // 4) Transportadora por fornecedor
  const grafico09PorTransportadora = Object.values(
    pedidos
      .filter((p) => isPecasT(p.tipo))
      .reduce((acc, p) => {
        const k = p.fornecedor || "(Sem fornecedor)";
        if (!acc[k]) acc[k] = { empresa: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  )
    .sort((a, b) => toNumber(b.valor) - toNumber(a.valor))
    .slice(0, 12);

  return {
    grafico06MotoBoyPC,
    grafico07TranspPC,
    grafico08PorMotoBoy,
    grafico09PorTransportadora,
  };
}

/**
 * Custos Frota
 * - PEDIDOS: tudo que começa com "DAF" e "VW".
 */
export async function loadCustosFrota(mes = null) {
  const pedidosAll = await loadPedidosRows();
  const pedidos = pedidosAll.filter((p) => (mes ? p.mes === mes : true));

  const grafico11GastosDAF = Object.values(
    pedidos
      .filter((p) => normUp(p.tipo).startsWith("DAF"))
      .reduce((acc, p) => {
        const k = p.tipo || "DAF";
        if (!acc[k]) acc[k] = { item: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  ).sort((a, b) => toNumber(b.valor) - toNumber(a.valor));

  const grafico10GastosVW = Object.values(
    pedidos
      .filter((p) => normUp(p.tipo).startsWith("VW"))
      .reduce((acc, p) => {
        const k = p.tipo || "VW";
        if (!acc[k]) acc[k] = { item: k, valor: 0 };
        acc[k].valor += p.valor || 0;
        return acc;
      }, {})
  ).sort((a, b) => toNumber(b.valor) - toNumber(a.valor));

  // Aproveitamento: depende de dados de horas/dias rodados que não estão nas colunas fixas informadas.
  const grafico12Aproveitamento = [];
  const graficoValorKm = [];

  return {
    grafico10GastosVW,
    grafico11GastosDAF,
    grafico12Aproveitamento,
    graficoValorKm,
  };
}
