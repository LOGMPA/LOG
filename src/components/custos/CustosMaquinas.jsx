import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { loadCustosMaquinas } from "@/services/custosExcelService";

const VERDE = "#007233";
const AMARELO = "#FFC800";
const VERDE_CLARO = "#76B947";
const PIE_COLORS = [AMARELO, VERDE, VERDE_CLARO, "#4A7729", "#A1C935", "#265C1B"];

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ignora linhas em que TODOS os campos numéricos estão vazios/null/NaN
function filterEmptyRows(data, numericKeys) {
  if (!Array.isArray(data)) return [];
  return data.filter((item) =>
    numericKeys.some((key) => {
      const v = item[key];
      if (v === 0) return true;
      return v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));
    })
  );
}

export default function CustosMaquinas() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosMaquinas();
        // boa prática: logar uma vez pra conferir se os dados batem
        console.log("Custos Máquinas (bruto):", res);
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de máquinas:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, []);

  if (status === "loading") {
    return (
      <div className="text-sm text-slate-500">
        Carregando dados de custos de máquinas...
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="text-sm text-red-600">
        Erro ao carregar dados de custos de máquinas.
      </div>
    );
  }

  const {
    grafico01MetaVsReal,
    grafico02SomaCustos,
    grafico03Terceiros,
    grafico04Proprio,
    grafico05Munck,
  } = data;

  // aplica filtro de linhas vazias pra cada dataset
  const dadosGrafico01 = useMemo(
    () => filterEmptyRows(grafico01MetaVsReal, ["meta", "mediaAtual"]),
    [grafico01MetaVsReal]
  );

  const dadosGrafico02 = useMemo(
    () =>
      filterEmptyRows(grafico02SomaCustos, [
        "somaProprio",
        "somaTerceiro",
        "qtdFrete",
      ]),
    [grafico02SomaCustos]
  );

  const dadosGrafico03 = useMemo(
    () => filterEmptyRows(grafico03Terceiros, ["valor"]),
    [grafico03Terceiros]
  );

  const dadosGrafico04 = useMemo(
    () => filterEmptyRows(grafico04Proprio, ["valor"]),
    [grafico04Proprio]
  );

  const dadosGrafico05 = useMemo(
    () => filterEmptyRows(grafico05Munck, ["valor"]),
    [grafico05Munck]
  );

  // label da pizza igual modelo (CIDADE + VALOR + %)
  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const item = dadosGrafico05[index];

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
      >
        {item?.cidade} {formatCurrency(value)} {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* GRAFICO 01 – META VS REAL */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            CUSTOS MÁQUINAS 2026 - META VS REAL
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico01} barCategoryGap={40}>
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: 11, marginTop: -10 }}
              />
              <Bar
                dataKey="meta"
                name="META FRETE 2026"
                fill={AMARELO}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="meta"
                  position="top"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#000" }}
                />
              </Bar>
              <Bar
                dataKey="mediaAtual"
                name="MÉDIA ATUAL (P+T)"
                fill={VERDE}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="mediaAtual"
                  position="top"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#000" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 02 – SOMA PROPRIO x TERCEIRO + QTD FRETE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            CUSTOS MÁQUINAS 2026 - SOMA TOTAL DOS TRANSPORTES
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico02} barCategoryGap={40}>
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "QTD FRETE") return value;
                  return formatCurrency(value);
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: 11, marginTop: -10 }}
              />
              <Bar
                dataKey="somaProprio"
                name="SOMA PRÓPRIO"
                fill={VERDE}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="somaProprio"
                  position="insideTop"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#FFFFFF" }}
                />
              </Bar>
              <Bar
                dataKey="somaTerceiro"
                name="SOMA TERCEIRO"
                fill={AMARELO}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="somaTerceiro"
                  position="insideTop"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#000000" }}
                />
              </Bar>
              {/* QTD FRETE em cima das categorias */}
              <Bar
                dataKey="qtdFrete"
                name="QTD FRETE"
                fill="transparent"
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="qtdFrete"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 600, fill: "#000" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 03 – TERCEIROS (HORIZONTAL) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            CUSTOS MÁQUINAS - TERCEIROS
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico03}
              layout="vertical"
              margin={{ left: 120, right: 30, top: 10, bottom: 10 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="freteiro"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="valor"
                name="Valor (R$)"
                fill={VERDE_CLARO}
                barSize={24}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="valor"
                  position="insideRight"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#FFFFFF" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 04 – FROTA PRÓPRIA (HORIZONTAL) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            CUSTOS MÁQUINAS - FROTA PRÓPRIA
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico04}
              layout="vertical"
              margin={{ left: 80, right: 30, top: 10, bottom: 10 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="frota"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="valor"
                name="Valor (R$)"
                fill={VERDE}
                barSize={26}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="valor"
                  position="insideRight"
                  formatter={formatCurrency}
                  style={{ fontSize: 11, fontWeight: 600, fill: "#FFFFFF" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 05 – MUNCK (PIZZA) */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase text-center">
            CUSTOS COM MUNCK - 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Pie
                data={dadosGrafico05}
                dataKey="valor"
                nameKey="cidade"
                cx="50%"
                cy="55%"
                outerRadius={120}
                labelLine={false}
                label={renderPieLabel}
              >
                {dadosGrafico05.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
