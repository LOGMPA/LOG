// src/services/custosExcelService.js
import * as XLSX from "xlsx";

// Lê o arquivo BASE.xlsx em public/data/BASE.xlsx
async function loadCustosSheet() {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const res = await fetch(`${baseUrl}data/BASE.xlsx`);

  if (!res.ok) {
    throw new Error("Erro ao carregar BASE.xlsx em public/data/BASE.xlsx");
  }

  const arrayBuffer = await res.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets["CUSTOS"];

  if (!sheet) {
    throw new Error('Aba "CUSTOS" não encontrada na planilha BASE.xlsx');
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  return rows;
}

// Helpers
function toNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v
      .replace(/R\$\s*/gi, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const n = Number(s);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function findRowIndexContaining(rows, text) {
  const target = String(text).trim().toLowerCase();
  return rows.findIndex((row) =>
    row?.some(
      (cell) =>
        typeof cell === "string" &&
        cell.trim().toLowerCase() === target
    )
  );
}

function findAllCells(rows, text) {
  const target = String(text).trim().toLowerCase();
  const positions = [];
  rows.forEach((row, rIdx) => {
    row?.forEach((cell, cIdx) => {
      if (
        typeof cell === "string" &&
        cell.trim().toLowerCase() === target
      ) {
        positions.push({ rowIndex: rIdx, colIndex: cIdx });
      }
    });
  });
  return positions;
}

/* =============  MÁQUINAS (GRAFICOS 01–05)  ============= */

// GRAFICO 01: CUSTOS MÁQUINAS 2026 - META VS REAL
function parseGrafico01(rows) {
  const idx = findRowIndexContaining(rows, "MÉDIA DOS CUSTOS");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "TRATOR");
  if (startCol === -1) return [];

  const categorias = headerRow.slice(startCol).filter((c) => !!c);

  const metaRow = rows[idx + 1] || [];
  const mediaRow = rows[idx + 2] || [];

  return categorias.map((nome, i) => ({
    item: nome,
    meta: toNumber(metaRow[startCol + i]),
    mediaAtual: toNumber(mediaRow[startCol + i]),
  }));
}

// GRAFICO 02: SOMA TOTAL DOS TRANSPORTES DE MÁQUINA
function parseGrafico02(rows) {
  const idx = findRowIndexContaining(rows, "SOMA DOS CUSTOS");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "TRATOR");
  if (startCol === -1) return [];

  const categorias = headerRow.slice(startCol).filter((c) => !!c);

  const somaProprioRow = rows[idx + 1] || [];
  const somaTerceiroRow = rows[idx + 2] || [];
  const qtdFreteRow = rows[idx + 3] || [];

  return categorias.map((nome, i) => ({
    item: nome,
    somaProprio: toNumber(somaProprioRow[startCol + i]),
    somaTerceiro: toNumber(somaTerceiroRow[startCol + i]),
    qtdFrete: toNumber(qtdFreteRow[startCol + i]),
  }));
}

// GRAFICO 03: CUSTOS MÁQUINAS - TERCEIROS (POR FRETEIRO)
function parseGrafico03(rows) {
  const idx = findRowIndexContaining(rows, "POR FRETEIRO");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "POR FRETEIRO");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const nome = r[startCol];
    if (!nome) break;
    result.push({
      freteiro: nome,
      valor: toNumber(r[startCol + 1]),
      qtdViagem: toNumber(r[startCol + 2]),
      qtdKm: toNumber(r[startCol + 3]),
      valorKm: toNumber(r[startCol + 4]),
    });
  }
  return result;
}

// GRAFICO 04: CUSTOS MÁQUINAS - FROTA PRÓPRIA (POR PROPRIO)
function parseGrafico04(rows) {
  const idx = findRowIndexContaining(rows, "POR PROPRIO");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "POR PROPRIO");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const nome = r[startCol];
    if (!nome) break;
    result.push({
      frota: nome,
      valor: toNumber(r[startCol + 1]),
      qtdViagem: toNumber(r[startCol + 2]),
      qtdKm: toNumber(r[startCol + 3]),
      valorKm: toNumber(r[startCol + 4]),
    });
  }
  return result;
}

// GRAFICO 05: CUSTOS COM MUNCK - 2026
function parseGrafico05(rows) {
  const idx = findRowIndexContaining(rows, "MUNCK - PC");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "MUNCK - PC");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cidade = r[startCol];
    if (!cidade) break;
    result.push({
      cidade,
      valor: toNumber(r[startCol + 1]),
      qtd: toNumber(r[startCol + 2]),
    });
  }
  return result;
}

/* =============  PEÇAS (GRAFICOS 06–09)  ============= */

// GRAFICO 06: TRANSPORTE DE PEÇAS MOTOBOY - PC 2026
function parseGrafico06(rows) {
  const idx = findRowIndexContaining(rows, "MOTOBOY - PC");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "MOTOBOY - PC");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cidade = r[startCol];
    if (!cidade) break;
    result.push({
      cidade,
      valor: toNumber(r[startCol + 1]),
    });
  }
  return result;
}

// GRAFICO 07: TRANSPORTE DE PEÇAS TRANSPORTADORAS - PC 2026
function parseGrafico07(rows) {
  const idx = findRowIndexContaining(rows, "TRANSPORTADORAS - PC");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "TRANSPORTADORAS - PC");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const cidade = r[startCol];
    if (!cidade) break;
    result.push({
      cidade,
      valor: toNumber(r[startCol + 1]),
    });
  }
  return result;
}

// GRAFICO 08: CUSTOS COM MOTOBOY (POR MOTOBOY)
function parseGrafico08(rows) {
  const idx = findRowIndexContaining(rows, "POR MOTOBOY");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "POR MOTOBOY");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const empresa = r[startCol];
    if (!empresa) break;
    result.push({
      empresa,
      valor: toNumber(r[startCol + 1]),
    });
  }
  return result;
}

// GRAFICO 09: CUSTOS COM TRANSPORTADORA (POR TRANSPORTADORA)
function parseGrafico09(rows) {
  const idx = findRowIndexContaining(rows, "POR TRANSPORTADORA");
  if (idx === -1) return [];
  const headerRow = rows[idx];
  const startCol = headerRow.findIndex((c) => c === "POR TRANSPORTADORA");
  if (startCol === -1) return [];

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const empresa = r[startCol];
    if (!empresa) break;
    result.push({
      empresa,
      valor: toNumber(r[startCol + 1]),
    });
  }
  return result;
}

/* =============  FROTA (GRAFICOS 10–12)  ============= */

// GRAFICO 10 & 11: GASTOS COM FROTA PRÓPRIA (VW / DAF)
function parseGastosVWDAF(rows) {
  const positions = findAllCells(rows, "GASTOS VW (c/PC)");
  if (positions.length < 1) return { vw: [], daf: [] };

  const parseVertical = (rowIndex, colIndex) => {
    const result = [];
    for (let i = rowIndex + 1; i < rows.length; i++) {
      const r = rows[i] || [];
      const item = r[colIndex];
      const val = r[colIndex + 1];
      if (!item && !val) break;
      if (!item) continue;
      result.push({
        item,
        valor: toNumber(val),
      });
    }
    return result;
  };

  const vw = positions[0]
    ? parseVertical(positions[0].rowIndex, positions[0].colIndex)
    : [];
  const daf = positions[1]
    ? parseVertical(positions[1].rowIndex, positions[1].colIndex)
    : [];

  return { vw, daf };
}

// GRAFICO 12: APROVEITAMENTO FROTA PRÓPRIA
function parseGrafico12(rows) {
  const idx = findRowIndexContaining(rows, "FROTA");
  if (idx === -1) return [];
  const headerRow = rows[idx];

  const colFrota = headerRow.findIndex((c) => c === "FROTA");
  const colKm = headerRow.findIndex((c) => c === "QTD KM");
  const colDias = headerRow.findIndex((c) => c === "QTD D/DIAS");
  const colApr = headerRow.findIndex((c) => c === "APROVEITAMENTO");

  if (colFrota === -1 || colKm === -1 || colDias === -1 || colApr === -1) {
    return [];
  }

  const result = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const frota = r[colFrota];
    if (!frota) break;

    let apro = r[colApr];
    if (typeof apro === "string" && apro.includes("%")) {
      apro = apro.replace("%", "").replace(",", ".");
      apro = Number(apro) / 100;
    }

    result.push({
      frota,
      qtdKm: toNumber(r[colKm]),
      qtdDias: toNumber(r[colDias]),
      aproveitamento: typeof apro === "number" ? apro : toNumber(apro),
    });
  }
  return result;
}

/* =============  FUNÇÕES PÚBLICAS PARA OS COMPONENTES  ============= */

export async function loadCustosMaquinas() {
  const rows = await loadCustosSheet();
  return {
    grafico01MetaVsReal: parseGrafico01(rows),
    grafico02SomaCustos: parseGrafico02(rows),
    grafico03Terceiros: parseGrafico03(rows),
    grafico04Proprio: parseGrafico04(rows),
    grafico05Munck: parseGrafico05(rows),
  };
}

export async function loadCustosPecas() {
  const rows = await loadCustosSheet();
  return {
    grafico06MotoBoyPC: parseGrafico06(rows),
    grafico07TranspPC: parseGrafico07(rows),
    grafico08PorMotoBoy: parseGrafico08(rows),
    grafico09PorTransportadora: parseGrafico09(rows),
  };
}

export async function loadCustosFrota() {
  const rows = await loadCustosSheet();
  const { vw, daf } = parseGastosVWDAF(rows);
  return {
    grafico10GastosVW: vw,
    grafico11GastosDAF: daf,
    grafico12Aproveitamento: parseGrafico12(rows),
  };
}
