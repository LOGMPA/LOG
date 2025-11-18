import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import custosData from "@/data/custos.json";

const COLORS = {
  verde: "#047857",
  verdeClaro: "#10b981",
  amarelo: "#f59e0b",
  cinza: "#9ca3af",
  cinzaClaro: "#d1d5db",
};

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
              {typeof entry.value === "number" &&
              !entry.name.includes("KM") &&
              !entry.name.includes("DIAS")
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

const COLORS_PIE_VW = [COLORS.verde, COLORS.cinza, COLORS.cinzaClaro, "#e5e7eb"];
const COLORS_PIE_DAF = [COLORS.verde, COLORS.cinza, "#e5e7eb"];

const RADIAN = Math.PI / 180;

const renderCustomLabelVW = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  nome,
  valor,
}) => {
  const positions = [
    { radiusMultiplier: 1.4, angleOffset: 0 },
    { radiusMultiplier: 1.4, angleOffset: 0 },
    { radiusMultiplier: 1.5, angleOffset: 15 },
    { radiusMultiplier: 1.5, angleOffset: -15 },
  ];

  const position = positions[index] || { radiusMultiplier: 1.4, angleOffset: 0 };
  const adjustedAngle = midAngle + position.angleOffset;
  const radius = outerRadius * position.radiusMultiplier;
  const x = cx + radius * Math.cos(-adjustedAngle * RADIAN);
  const y = cy + radius * Math.sin(-adjustedAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="500"
    >
      <tspan x={x} dy="0">
        {nome}
      </tspan>
      <tspan x={x} dy="1.2em" fontSize={9} fill="#6b7280">
        {formatCurrency(valor)} ({(percent * 100).toFixed(0)}%)
      </tspan>
    </text>
  );
};

const renderCustomLabelDAF = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  nome,
  valor,
}) => {
  const positions = [
    { radiusMultiplier: 1.4, angleOffset: 0 },
    { radiusMultiplier: 1.4, angleOffset: 0 },
    { radiusMultiplier: 1.5, angleOffset: 10 },
  ];

  const position = positions[index] || { radiusMultiplier: 1.4, angleOffset: 0 };
  const adjustedAngle = midAngle + position.angleOffset;
  const radius = outerRadius * position.radiusMultiplier;
  const x = cx + radius * Math.cos(-adjustedAngle * RADIAN);
  const y = cy + radius * Math.sin(-adjustedAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="500"
    >
      <tspan x={x} dy="0">
        {nome}
      </tspan>
      <tspan x={x} dy="1.2em" fontSize={9} fill="#6b7280">
        {formatCurrency(valor)} ({(percent * 100).toFixed(0)}%)
      </tspan>
    </text>
  );
};

const CustomBarComponent = (props) => {
  const { fill, x, y, width, height, payload } = props;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={8} />
      {/* Bloco amarelo para dias */}
      <rect
        x={x + width / 2 - 25}
        y={y + height / 2 - 20}
        width={50}
        height={40}
        fill={COLORS.amarelo}
        rx={6}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={14}
        fontWeight="700"
      >
        {payload.dias}
      </text>
      {/* Aproveitamento na base */}
      <rect
        x={x + 10}
        y={y + height - 35}
        width={width - 20}
        height={28}
        fill={COLORS.verdeClaro}
        rx={6}
      />
      <text
        x={x + width / 2}
        y={y + height - 21}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={13}
        fontWeight="700"
      >
        {payload.aproveitamento.toFixed(2)}%
      </text>
      {/* KM no topo */}
      <text
        x={x + width / 2}
        y={y - 10}
        textAnchor="middle"
        fill={COLORS.verde}
        fontSize={14}
        fontWeight="700"
      >
        {payload.km} km
      </text>
    </g>
  );
};

// Dados vindos do src/data/custos.json
const dadosVW = custosData?.frota?.vw ?? [];
const dadosDAF = custosData?.frota?.daf ?? [];
const dadosAproveitamento = custosData?.frota?.aproveitamento ?? [];

export default function CustosFrota() {
  return (
    <div className="space-y-6">
      {/* Gráficos 1 e 2 - Pizza VW e DAF lado a lado */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico 1 - VW */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              GASTOS COM FROTA PRÓPRIA - CAMINHÃO VW ATV6639
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={dadosVW}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomLabelVW}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosVW.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_PIE_VW[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2 - DAF */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              GASTOS COM FROTA PRÓPRIA - CAMINHÃO DAF SDY9A72
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={dadosDAF}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomLabelDAF}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosDAF.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_PIE_DAF[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3 - Aproveitamento */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            APROVEITAMENTO FROTA PRÓPRIA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={dadosAproveitamento} barSize={150}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="nome"
                tick={{ fill: "#6b7280", fontSize: 13 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: "Quilometragem (km)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6b7280",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="rect"
                payload={[
                  { value: "QTD KM", type: "rect", color: COLORS.verde },
                  { value: "QTD D/DIAS", type: "rect", color: COLORS.amarelo },
                  {
                    value: "APROVEITAMENTO",
                    type: "rect",
                    color: COLORS.verdeClaro,
                  },
                ]}
              />
              <Bar
                dataKey="km"
                fill={COLORS.verde}
                shape={<CustomBarComponent />}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
