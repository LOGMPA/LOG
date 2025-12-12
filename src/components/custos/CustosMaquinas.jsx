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

const VERDE_ESCURO = "#2A5E20";
const VERDE_MEDIO = "#387C2B";
const AMARELO = "#FCDC01";
const AMARELO_LEGENDA = "#E0B800";

const PIE_COLORS = [
  "#FFC800",
  "#007233",
  "#76B947",
  "#4A7729",
  "#A1C935",
  "#265C1B",
];
const PIE_LABEL_COLORS = [
  "#A66A00",
  "#00451C",
  "#476F1F",
  "#2E4F17",
  "#617A1D",
  "#15380F",
];

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isNaN(value) ? 0 : value;
  if (typeof value === "string") {
    const cleaned = value
      .replace(/[^\d,-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const formatCurrency = (value) => {
  const num = toNumber(value);
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

function filterEmptyRows(data, numericKeys) {
  if (!Array.isArray(data)) return [];
  return data.filter((item) =>
    numericKeys.some((key) => {
      const v = toNumber(item[key]);
      return v !== 0 && !Number.isNaN(v);
    })
  );
}

export default function CustosMaquinas({ mes = null }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosMaquinas(mes);
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de máquinas:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, [mes]);

  const {
    grafico01MetaVsReal = [],
    grafico02SomaCustos = [],
    grafico03Terceiros = [],
    grafico05Munck = [],
  } = data || {};

  const dadosGrafico01 = useMemo(
    () =>
      filterEmptyRows(grafico01MetaVsReal, ["meta", "mediaAtual"]).map(
        (item) => ({
          ...item,
          metaNum: toNumber(item.meta),
          mediaNum: toNumber(item.mediaAtual),
        })
      ),
    [grafico01MetaVsReal]
  );

  const dadosGrafico02 = useMemo(
    () =>
      filterEmptyRows(grafico02SomaCustos, [
        "somaProprio",
        "somaTerceiro",
        "qtdFrete",
      ]).map((item) => {
        const proprio = toNumber(item.somaProprio);
        const terceiro = toNumber(item.somaTerceiro);
        const total = proprio + terceiro;
        return {
          ...item,
          proprioNum: total > 0 ? (proprio / total) * 100 : 0,
          terceiroNum: total > 0 ? (terceiro / total) * 100 : 0,
          proprioValor: proprio,
          terceiroValor: terceiro,
          qtdFreteNum: toNumber(item.qtdFrete),
          // sempre 100 só pra empurrar o label pro topo do gráfico
          qtdFreteBar: 100,
        };
      }),
    [grafico02SomaCustos]
  );

  const dadosGrafico03 = useMemo(() => {
    const base = filterEmptyRows(grafico03Terceiros, ["valor", "km"]);
    const total = base.reduce((sum, item) => sum + toNumber(item.valor), 0);
    return base.map((item) => {
      const valor = toNumber(item.valor);
      return {
        ...item,
        valorNum: total > 0 ? (valor / total) * 100 : 0,
        valorReal: valor,
        kmNum: toNumber(item.km),
      };
    });
  }, [grafico03Terceiros]);

  const dadosGrafico05 = useMemo(
    () => filterEmptyRows(grafico05Munck, ["valor"]),
    [grafico05Munck]
  );

  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const item = dadosGrafico05[index];
    const color = PIE_LABEL_COLORS[index % PIE_LABEL_COLORS.length];

    return (
      <text
        x={x}
        y={y}
        fill={color}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
      >
        <tspan x={x} dy="-0.4em">
          {item?.cidade}
        </tspan>
        <tspan x={x} dy="1.2em">
          {`${formatCurrency(value)} - ${(percent * 100).toFixed(0)}%`}
        </tspan>
      </text>
    );
  };

  if (status === "loading") {
    return (
      <div className="text-sm font-bold" style={{ color: VERDE_ESCURO }}>
        Carregando dados de custos de máquinas...
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="text-sm font-bold text-red-700">
        Erro ao carregar dados de custos de máquinas.
      </div>
    );
  }

  // LABELS – CUSTO POR TIPO
  const ProprioStackLabel = (props) => {
    const { x, y, width, height, index, value } = props;
    const item = dadosGrafico02[index];
    if (!item || !item.proprioValor || !value) return null;

    const percent = item.proprioNum.toFixed(0);
    const text = `${formatCurrency(item.proprioValor)} (${percent}%)`;

    const charW = 6;
    const boxPaddingX = 8;
    const boxH = 18;
    const boxW = text.length * charW + boxPaddingX * 2;

    const cx = x + width / 2;
    const cy = y + height / 2;

    return (
      <g>
        <rect
          x={cx - boxW / 2}
          y={cy - boxH / 2}
          width={boxW}
          height={boxH}
          rx={4}
          ry={4}
          fill={VERDE_MEDIO}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#FFFFFF"
        >
          {text}
        </text>
      </g>
    );
  };

  const TerceiroStackLabel = (props) => {
    const { x, y, width, height, index, value } = props;
    const item = dadosGrafico02[index];
    if (!item || !item.terceiroValor || !value) return null;

    const percent = item.terceiroNum.toFixed(0);
    const text = `${formatCurrency(item.terceiroValor)} (${percent}%)`;

    const charW = 6;
    const boxPaddingX = 8;
    const boxH = 18;
    const boxW = text.length * charW + boxPaddingX * 2;

    const cx = x + width / 2;
    const cy = y + height / 2;

    return (
      <g>
        <rect
          x={cx - boxW / 2}
          y={cy - boxH / 2}
          width={boxW}
          height={boxH}
          rx={4}
          ry={4}
          fill={AMARELO}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={VERDE_ESCURO}
        >
          {text}
        </text>
      </g>
    );
  };

  const QtdFreteTopLabel = (props) => {
    const { x, y, index } = props;
    const item = dadosGrafico02[index];
    const value = item?.qtdFreteNum;
    if (value === null || value === undefined) return null;
    return (
      <text
        x={x}
        y={y - 6}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="#000"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* GRÁFICO 1 - META VS REAL */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle
            className="text-base font-bold uppercase"
            style={{ color: VERDE_ESCURO }}
          >
            TRANSPORTE MÁQUINAS - META VS REAL
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico01}
              barCategoryGap={35}
              barGap={-18}
              margin={{ top: 40, right: 30, left: 20, bottom: 35 }}
            >
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: "#000",
                }}
              />
              <YAxis hide domain={[0, (dataMax) => dataMax * 1.25]} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: VERDE_ESCURO,
                  paddingBottom: 4,
                }}
                payload={[
                  {
                    id: "meta-leg",
                    value: "Meta",
                    type: "square",
                    color: VERDE_ESCURO,
                  },
                  {
                    id: "real-leg",
                    value: "Real",
                    type: "square",
                    color: AMARELO_LEGENDA,
                  },
                ]}
              />
              <Bar
                dataKey="metaNum"
                name="Meta"
                fill={VERDE_ESCURO}
                barSize={42}
                radius={[4, 4, 0, 0]}
                minPointSize={6}
              >
                <LabelList
                  dataKey="metaNum"
                  content={({ x, y, value }) => {
                    if (!value) return null;
                    return (
                      <g>
                        <path
                          d={`M ${x - 55} ${y - 12} L ${x - 55} ${y + 8} L ${x} ${
                            y + 8
                          } L ${x} ${y - 2} L ${x + 5} ${y - 2} L ${x} ${
                            y - 6
                          } L ${x} ${y - 12} Z`}
                          fill={VERDE_ESCURO}
                        />
                        <text
                          x={x - 28}
                          y={y - 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#FFFFFF",
                          }}
                        >
                          {formatCurrency(value)}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
              <Bar
                dataKey="mediaNum"
                name="Real"
                fill={AMARELO}
                barSize={28}
                radius={[4, 4, 0, 0]}
                minPointSize={6}
              >
                <LabelList
                  dataKey="mediaNum"
                  content={({ x, y, value }) => {
                    if (!value) return null;
                    return (
                      <g>
                        <rect
                          x={x + 10}
                          y={y - 12}
                          width="60"
                          height="20"
                          fill={AMARELO}
                          rx="4"
                        />
                        <text
                          x={x + 40}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: VERDE_ESCURO,
                          }}
                        >
                          {formatCurrency(value)}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO 2 - CUSTO POR TIPO */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle
            className="text-base font-bold uppercase"
            style={{ color: VERDE_ESCURO }}
          >
            TRANSPORTE MÁQUINAS - CUSTO POR TIPO
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico02}
              barCategoryGap={30}
              margin={{ top: 40, right: 30, left: 20, bottom: 40 }}
            >
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: "#000",
                }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                formatter={(value, name, info) => {
                  const payload = info?.payload || {};
                  if (name === "Qtd Frete") return value;
                  if (info.dataKey === "proprioNum") {
                    return formatCurrency(payload.proprioValor || 0);
                  }
                  if (info.dataKey === "terceiroNum") {
                    return formatCurrency(payload.terceiroValor || 0);
                  }
                  return formatCurrency(value);
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: VERDE_ESCURO,
                  paddingBottom: 10,
                }}
                payload={[
                  {
                    id: "prop-leg",
                    value: "Próprio",
                    type: "square",
                    color: VERDE_MEDIO,
                  },
                  {
                    id: "terc-leg",
                    value: "Terceiro",
                    type: "square",
                    color: AMARELO_LEGENDA,
                  },
                ]}
              />
              <Bar
                dataKey="proprioNum"
                name="Próprio"
                fill={VERDE_MEDIO}
                barSize={55}
                stackId="tipo"
                minPointSize={6}
              >
                <LabelList content={ProprioStackLabel} />
              </Bar>
              <Bar
                dataKey="terceiroNum"
                name="Terceiro"
                fill={AMARELO}
                barSize={55}
                stackId="tipo"
                radius={[6, 6, 0, 0]}
                minPointSize={6}
              >
                <LabelList content={TerceiroStackLabel} />
              </Bar>
              {/* Bar fantasma só pra posicionar a QTD no topo */}
              <Bar
                dataKey="qtdFreteBar"
                name="Qtd Frete"
                fill="transparent"
                barSize={55}
                isAnimationActive={false}
              >
                <LabelList content={QtdFreteTopLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO 3 - CUSTO COM TERCEIROS */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle
            className="text-sm font-bold uppercase"
            style={{ color: VERDE_ESCURO }}
          >
            TRANSPORTE MÁQUINAS - CUSTO COM TERCEIROS
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[430px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico03}
              layout="vertical"
              barCategoryGap={10}
              margin={{ left: 130, right: 40, top: 10, bottom: 10 }}
            >
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                dataKey="freteiro"
                type="category"
                width={170}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "#000",
                }}
              />
              <Tooltip
                formatter={(value, name, info) => {
                  const payload = info?.payload || {};
                  if (name === "KM") return `${toNumber(value)} km`;
                  return formatCurrency(payload.valorReal || 0);
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="valorNum"
                name="Valor Total"
                fill={VERDE_MEDIO}
                barSize={38}
                radius={[0, 6, 6, 0]}
                minPointSize={10}
              >
                <LabelList
                  content={({ x, y, width, height, index }) => {
                    const item = dadosGrafico03[index];
                    if (!item || !item.valorReal) return null;

                    const percent = item.valorNum.toFixed(0);
                    const label = `${formatCurrency(
                      item.valorReal
                    )} (${percent}%)`;
                    const kmText = `${item.kmNum} km`;

                    const charW = 6;
                    const paddingX = 8;
                    const boxH = 18;
                    const boxW = label.length * charW + paddingX * 2;

                    const centerY = y + height / 2;
                    let boxX;
                    let textX;
                    let kmX;

                    if (width >= boxW + 10) {
                      // caixa dentro da barra, km depois da barra
                      boxX = x + width / 2 - boxW / 2;
                      textX = x + width / 2;
                      kmX = x + width + 10;
                    } else {
                      // caixa fora da barra, km depois da caixa
                      boxX = x + width + 6;
                      textX = boxX + boxW / 2;
                      kmX = boxX + boxW + 14;
                    }

                    const boxY = centerY - boxH / 2;

                    return (
                      <g>
                        <rect
                          x={boxX}
                          y={boxY}
                          width={boxW}
                          height={boxH}
                          rx={4}
                          ry={4}
                          fill={VERDE_MEDIO}
                        />
                        <text
                          x={textX}
                          y={centerY + 4}
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={700}
                          fill="#FFFFFF"
                        >
                          {label}
                        </text>
                        <text
                          x={kmX}
                          y={centerY + 4}
                          textAnchor="start"
                          fontSize={10}
                          fontWeight={700}
                          fill="#000000"
                        >
                          {kmText}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO 4 - MUNCK */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle
            className="text-base font-bold uppercase text-center"
            style={{ color: VERDE_ESCURO }}
          >
            CUSTOS - UTILIZAÇÃO DE MUNCK
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
