import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import custosData from "@/data/custos.json";

const COLORS = {
  verde: "#047857",
  verdeClaro: "#10b981",
  amarelo: "#f59e0b",
  azul: "#3b82f6",
  cinza: "#6b7280",
};

const COLORS_PIE = ["#047857", "#10b981", "#059669", "#34d399"];

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        {payload.map((entry, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>{" "}
            <span className="font-semibold">
              {typeof entry.value === "number" && entry.name !== "QTD FRETE"
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill={COLORS.azul} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={13}
        fontWeight="700"
      >
        {payload.qtdFrete}
      </text>
    </g>
  );
};

// Dados vindos do src/data/custos.json (gerado a partir do BASE.xlsx)
const dadosMetaVsReal = custosData?.maquinas?.metaVsReal ?? [];
const dadosSomaTotal = custosData?.maquinas?.somaTotal ?? [];
const dadosTerceiros = custosData?.maquinas?.terceiros ?? [];
const dadosPropria = custosData?.maquinas?.frotaPropria ?? [];
const dadosMunck = custosData?.maquinas?.munck ?? [];

export default function CustosMaquinas() {
  return (
    <div className="space-y-6">
      {/* Gráfico 1 - Meta vs Real */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            CUSTOS MÁQUINAS 2026 - META VS REAL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosMetaVsReal} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="maquina"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                dataKey="meta"
                name="META FRETE 2026"
                fill={COLORS.verde}
                radius={[8, 8, 0, 0]}
                label={{
                  position: "top",
                  fill: COLORS.verde,
                  fontSize: 11,
                  formatter: formatCurrency,
                }}
              />
              <Bar
                dataKey="atual"
                name="MÉDIA ATUAL (P*T)"
                fill={COLORS.amarelo}
                radius={[8, 8, 0, 0]}
                label={{
                  position: "top",
                  fill: COLORS.amarelo,
                  fontSize: 11,
                  formatter: formatCurrency,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2 - Soma Total */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            CUSTOS MÁQUINAS 2026 - SOMA TOTAL DOS TRANSPORTES DE MÁQUINA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={dadosSomaTotal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="maquina"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                yAxisId="left"
                dataKey="proprio"
                name="SOMA PRÓPRIO"
                stackId="a"
                fill={COLORS.verde}
                radius={[0, 0, 0, 0]}
                label={{
                  position: "inside",
                  fill: "white",
                  fontSize: 11,
                  formatter: formatCurrency,
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="terceiro"
                name="SOMA TERCEIRO"
                stackId="a"
                fill={COLORS.amarelo}
                radius={[8, 8, 0, 0]}
                label={{
                  position: "inside",
                  fill: "white",
                  fontSize: 11,
                  formatter: formatCurrency,
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="qtdFrete"
                name="QTD FRETE"
                stroke="transparent"
                strokeWidth={0}
                dot={<CustomDot />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos 3 e 4 - Terceiros e Própria lado a lado */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico 3 - Terceiros */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              CUSTOS MÁQUINAS - TERCEIROS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosTerceiros} layout="vertical" barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill={COLORS.verde}
                  radius={[0, 8, 8, 0]}
                  label={{
                    position: "right",
                    fill: COLORS.verde,
                    fontSize: 11,
                    formatter: formatCurrency,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 4 - Frota Própria */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              CUSTOS MÁQUINAS - FROTA PRÓPRIA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosPropria} layout="vertical" barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill={COLORS.verde}
                  radius={[0, 8, 8, 0]}
                  label={{
                    position: "right",
                    fill: COLORS.verde,
                    fontSize: 11,
                    formatter: formatCurrency,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 5 - Munck */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            CUSTOS COM MUNCK - 2026
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dadosMunck}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ nome, valor, percent }) =>
                  `${nome}: ${formatCurrency(valor)} (${(percent * 100).toFixed(
                    0
                  )}%)`
                }
                outerRadius={140}
                fill="#8884d8"
                dataKey="valor"
              >
                {dadosMunck.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_PIE[index % COLORS_PIE.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
