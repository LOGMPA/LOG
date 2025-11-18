import fs from "fs";
import * as XLSX from "xlsx";

const workbook = XLSX.readFile("public/data/BASE.xlsx");
const sheet = workbook.Sheets["CUSTOS"];

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Helper: pega linha cujo texto na coluna 2 (índice 2) bate
const findRowByLabel = (label) =>
  rows.find((r) => String(r[2] || "").trim() === label);

// ----------------- GRÁFICO 01 - MÉDIA DOS CUSTOS -----------------
(function buildGrafico01() {
  const header = rows[0]; // linha com TRATOR, PLANTADEIRA, etc. nas colunas 3..7
  const maquinas = header.slice(3, 8); // D..H

  const rowMeta = findRowByLabel("META FRETE 2026");
  const rowAtual = findRowByLabel("MÉDIA ATUAL (P+T)");

  globalThis.grafico01 = maquinas.map((maquina, i) => ({
    maquina,
    meta: Number(rowMeta[3 + i] || 0),
    atual: Number(rowAtual[3 + i] || 0),
  }));
})();

// ----------------- GRÁFICO 02 - SOMA TOTAL -----------------
(function buildGrafico02() {
  const headerIndex = rows.findIndex(
    (r) => String(r[2] || "").trim() === "SOMA DOS CUSTOS"
  );
  const header = rows[headerIndex + 0]; // mesma linha, colunas 3..7 são máquinas
  const maquinas = header.slice(3, 8);

  const rowProprio = rows[headerIndex + 1]; // SOMA PROPRIO
  const rowTerceiro = rows[headerIndex + 2]; // SOMA TERCEIRO
  const rowQtd = rows[headerIndex + 3]; // QTD FRETE

  globalThis.grafico02 = maquinas.map((maquina, i) => ({
    maquina,
    proprio: Number(rowProprio[3 + i] || 0),
    terceiro: Number(rowTerceiro[3 + i] || 0),
    qtdFrete: Number(rowQtd[3 + i] || 0),
  }));
})();

// ----------------- GRÁFICO MOTOBOY (PEÇAS) -----------------
(function buildMotoboy() {
  // bloco "MOTOBOY - PC" (GRAFICO 06)
  const startIndex = rows.findIndex(
    (r) => String(r[12] || "").trim() === "MOTOBOY - PC"
  );

  const motoboyRows = [];
  for (let i = startIndex + 1; i < rows.length; i++) {
    const cidade = rows[i][12];
    const valor = rows[i][13];
    if (!cidade || String(cidade).includes("GRAFICO")) break;
    motoboyRows.push({ cidade: String(cidade).trim(), valor: Number(valor || 0) });
  }

  globalThis.motoboyPorCidade = motoboyRows;

  // bloco "POR MOTOBOY" (mesmos dados dos teus dadosCustosMotoboy)
  const startPorMotoboy = rows.findIndex(
    (r) => String(r[12] || "").trim() === "POR MOTOBOY"
  );
  const motoboyCustoRows = [];
  for (let i = startPorMotoboy + 1; i < rows.length; i++) {
    const nome = rows[i][14];
    const valor = rows[i][16];
    if (!nome) break;
    motoboyCustoRows.push({ nome: String(nome).trim(), valor: Number(valor || 0) });
  }

  globalThis.custosMotoboy = motoboyCustoRows;
})();

// ----------------- GRÁFICO TRANSPORTADORA (PEÇAS) -----------------
(function buildTransportadora() {
  // bloco "TRANSPORTADORA - PC" não está literal, mas os valores
  // que você usa vêm da mesma região do "GRAFICO 05" (colunas 16..)
  // Aqui vou pegar as cidades em col 17 e valores em col 16.
  const startIndex = rows.findIndex(
    (r) => String(r[18] || "").trim() === "MUNCK - PC"
  );

  const cidades = [];
  for (let i = startIndex + 1; i < rows.length; i++) {
    const cidade = rows[i][18];
    const valor = rows[i][16];
    if (!cidade || String(cidade).includes("GRAFICO")) break;
    cidades.push({ cidade: String(cidade).trim(), valor: Number(valor || 0) });
  }

  globalThis.transportadoraPorCidade = cidades;

  // bloco "POR FRETEIRO" (teus dadosTerceiros)
  const startPorFreteiro = rows.findIndex(
    (r) => String(r[18] || "").trim() === "POR FRETEIRO"
  );
  const freteiros = [];
  for (let i = startPorFreteiro + 1; i < rows.length; i++) {
    const nome = rows[i][19];
    const valor = rows[i][21];
    if (!nome) break;
    freteiros.push({ nome: String(nome).trim(), valor: Number(valor || 0) });
  }

  globalThis.custosFreteiros = freteiros;
})();

// ----------------- GASTOS VW / DAF (FROTA) -----------------
(function buildFrota() {
  // VW
  const vwBlockIndex = rows.findIndex(
    (r) => String(r[24] || "").trim() === "GASTOS VW (c/PC)"
  );
  const vwRows = rows.slice(vwBlockIndex + 1, vwBlockIndex + 9);
  const dadosVW = vwRows
    .map((r) => ({ nome: String(r[24] || "").trim(), valor: Number(r[25] || 0) }))
    .filter((r) => r.nome && !r.nome.startsWith("GRAFICO"));

  const totalVW = dadosVW.reduce((acc, d) => acc + d.valor, 0);
  globalThis.dadosVW = dadosVW.map((d) => ({
    ...d,
    percentual: totalVW ? (d.valor / totalVW) * 100 : 0,
  }));

  // DAF (GRAFICO 11, mesmo bloco de colunas)
  const dafBlockIndex = vwBlockIndex + 10;
  const dafRows = rows.slice(dafBlockIndex + 1, dafBlockIndex + 9);
  const dadosDAF = dafRows
    .map((r) => ({ nome: String(r[24] || "").trim(), valor: Number(r[25] || 0) }))
    .filter((r) => r.nome && !r.nome.startsWith("GRAFICO"));

  const totalDAF = dadosDAF.reduce((acc, d) => acc + d.valor, 0);
  globalThis.dadosDAF = dadosDAF.map((d) => ({
    ...d,
    percentual: totalDAF ? (d.valor / totalDAF) * 100 : 0,
  }));
})();

// ----------------- APROVEITAMENTO FROTA PRÓPRIA -----------------
(function buildAproveitamento() {
  // Final da tabela de CUSTOS tem as linhas de aproveitamento
  const aproxIndex = rows.findIndex(
    (r) => String(r[31] || "").trim() === "APROVEITAMENTO"
  );

  const kmVW = Number(rows[aproxIndex - 2][30] || 0);
  const kmDAF = Number(rows[aproxIndex - 1][30] || 0);
  const diasVW = Number(rows[aproxIndex - 2][29] || 0);
  const diasDAF = Number(rows[aproxIndex - 1][29] || 0);
  const apVW = Number(rows[aproxIndex][30] || 0);
  const apDAF = Number(rows[aproxIndex][31] || 0);

  globalThis.aproveitamentoFrota = [
    {
      nome: "PROPRIO DAF",
      km: kmDAF,
      dias: diasDAF,
      aproveitamento: apDAF * 100,
    },
    {
      nome: "PROPRIO VW",
      km: kmVW,
      dias: diasVW,
      aproveitamento: apVW * 100,
    },
  ];
})();

// ----------------- SALVAR JSON -----------------
const output = {
  maquinas: {
    metaVsReal: globalThis.grafico01,
    somaTotal: globalThis.grafico02,
  },
  pecas: {
    motoboyPorCidade: globalThis.motoboyPorCidade,
    custosMotoboy: globalThis.custosMotoboy,
    transportadoraPorCidade: globalThis.transportadoraPorCidade,
    custosFreteiros: globalThis.custosFreteiros,
  },
  frota: {
    vw: globalThis.dadosVW,
    daf: globalThis.dadosDAF,
    aproveitamento: globalThis.aproveitamentoFrota,
  },
};

fs.writeFileSync("src/data/custos.json", JSON.stringify(output, null, 2), "utf-8");
console.log("✅ src/data/custos.json gerado a partir de BASE.xlsx");
