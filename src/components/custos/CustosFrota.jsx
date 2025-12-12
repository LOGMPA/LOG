import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { loadCustosFrota } from "@/services/custosExcelService";

const VERDE = "#007233";
const VERDE_CLARO = "#76B947";
const AMARELO = "#FFC800";
const PIE_COLORS = [VERDE_CLARO, AMARELO];

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function CustosFrota({ mes = null }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosFrota(mes);
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de frota:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, [mes]);

  if (status === "loading") {
    return (
      <div className="text-sm text-slate-500">
        Carregando dados de custos de frota...
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="text-sm text-red-600">
        Erro ao carregar dados de custos de frota.
      </div>
    );
  }

  const {
    grafico10GastosVW = [],
    grafico11GastosDAF = [],
    grafico12Aproveitamento = [],
    graficoValorKm = [],
  } = data;

  // aproveitamento em % para DAF e VW
  const aproveitamentoData = [
    {
      frota: "DAF",
      percent:
        grafico12Aproveitamento[0]?.aproveitamento > 1
          ? grafico12Aproveitamento[0]?.aproveitamento
          : (grafico12Aproveitamento[0]?.aproveitamento || 0) * 100,
    },
    {
      frota: "VW",
      percent:
        grafico12Aproveitamento[1]?.aproveitamento > 1
          ? grafico12Aproveitamento[1]?.aproveitamento
          : (grafico12Aproveitamento[1]?.aproveitamento || 0) * 100,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* APROVEITAMENTO DIÁRIO - PIZZA */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase text-center">
            APROVEITAMENTO DIÁRIO DA FROTA - 8H/DIA
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(0)}%`}
                labelFormatter={() => ""}
              />
              <Pie
                data={aproveitamentoData}
                dataKey="percent"
                nameKey="frota"
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent.toFixed(0)}%`
                }
              >
                {aproveitamentoData.map((entry, index) => (
                  <Cell
                    key={`cell-aprov-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* VALOR APROXIMADO DE CUSTOS VS KM RODADO */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            VALOR APROXIMADO DE CUSTOS COM TRANSPORTE VS KM RODADO
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graficoValorKm}
              layout="vertical"
              margin={{ left: 140, right: 40, top: 10, bottom: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="frota"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fontWeight: 600,
                  fill: "#000",
                }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="valor"
                name="Valor (R$)"
                fill={VERDE_CLARO}
                barSize={50}
                radius={[0, 4, 4, 0]}
              >
                <LabelList
                  dataKey="valor"
                  position="insideRight"
                  formatter={formatCurrency}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: "#000",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CUSTOS DAF 2026 */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase text-center">
            CUSTOS DAF 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico11GastosDAF}
              barCategoryGap={30}
              margin={{ bottom: 40 }}
            >
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                tick={{
                  fontSize: 10,
                  fontWeight: 600,
                  fill: "#000",
                }}
                height={40}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="valor"
                name="Valor (R$)"
                fill={VERDE}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="valor"
                  position="top"
                  formatter={formatCurrency}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "#000",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CUSTOS VW 2026 */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase text-center">
            CUSTOS VW 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico10GastosVW}
              barCategoryGap={30}
              margin={{ bottom: 40 }}
            >
              <XAxis
                dataKey="item"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                tick={{
                  fontSize: 10,
                  fontWeight: 600,
                  fill: "#000",
                }}
                height={40}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="valor"
                name="Valor (R$)"
                fill={VERDE_CLARO}
                barSize={40}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="valor"
                  position="top"
                  formatter={formatCurrency}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "#000",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
