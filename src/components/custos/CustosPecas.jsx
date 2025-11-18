import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import custosData from "@/data/custos.json";

const COLORS = {
  verde: "#047857",
  verdeClaro: "#10b981",
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
            <span className="font-medium text-gray-700">
              {entry.payload.cidade || entry.payload.nome}:
            </span>{" "}
            <span className="font-semibold text-emerald-700">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomBarLabel = ({ x, y, width, height, value }) => {
  if (!value || value === 0) return null;
  return (
    <g>
      <rect
        x={x + 6}
        y={y + height / 2 - 14}
        width={Math.max(100, width * 0.4)}
        height={28}
        fill={COLORS.verde}
        rx={6}
      />
      <text
        x={x + 12}
        y={y + height / 2}
        fill="white"
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
      >
        {formatCurrency(value)}
      </text>
    </g>
  );
};

const CustomColumnLabel = ({ x, y, width, value }) => {
  return (
    <g>
      <rect
        x={x + width / 2 - 60}
        y={y - 35}
        width={120}
        height={28}
        fill={COLORS.verde}
        rx={6}
      />
      <text
        x={x + width / 2}
        y={y - 20}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight="600"
      >
        {formatCurrency(value)}
      </text>
    </g>
  );
};

// Dados vindos do src/data/custos.json
const dadosMotoboy = custosData?.pecas?.motoboyPorCidade ?? [];
const dadosTransportadora = custosData?.pecas?.transportadoraPorCidade ?? [];
const dadosCustosMotoboy = custosData?.pecas?.custosMotoboy ?? [];
const dadosCustosTransportadora =
  custosData?.pecas?.custosTransportadora ?? [];

export default function CustosPecas() {
  return (
    <div className="space-y-6">
      {/* Gráficos 1 e 2 - Motoboy e Transportadora lado a lado */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico 1 - Motoboy */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              TRANSPORTE DE PEÇAS MOTOBOY - PC 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosMotoboy} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="cidade"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill={COLORS.verde}
                  radius={[0, 8, 8, 0]}
                  label={<CustomBarLabel />}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2 - Transportadora */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-light text-gray-900">
              TRANSPORTE DE PEÇAS TRANSPORTADORAS - PC 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={dadosTransportadora}
                layout="vertical"
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <YAxis
                  type="category"
                  dataKey="cidade"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill={COLORS.verde}
                  radius={[0, 8, 8, 0]}
                  label={<CustomBarLabel />}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3 - Custos com Motoboy (card inteiro) */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            CUSTOS COM MOTOBOY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosCustosMotoboy} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="nome"
                tick={{
                  fill: "#6b7280",
                  fontSize: 10,
                  angle: -45,
                  textAnchor: "end",
                }}
                axisLine={{ stroke: "#e5e7eb" }}
                height={100}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="valor"
                fill={COLORS.verde}
                radius={[8, 8, 0, 0]}
                label={<CustomColumnLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 4 - Custos com Transportadora */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-light text-gray-900">
            CUSTOS COM TRANSPORTADORA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosCustosTransportadora} barSize={80}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="nome"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={{ stroke: "#e5e7eb" }}
                height={80}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="valor"
                fill={COLORS.verde}
                radius={[8, 8, 0, 0]}
                label={<CustomColumnLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
