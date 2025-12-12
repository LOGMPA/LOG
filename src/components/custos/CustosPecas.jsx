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
} from "recharts";
import { loadCustosPecas } from "@/services/custosExcelService";

const VERDE = "#007233";
const VERDE_CLARO = "#76B947";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function CustosPecas({ mes = null }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosPecas(mes);
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de peças:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, [mes]);

  if (status === "loading") {
    return (
      <div className="text-sm text-slate-500">
        Carregando dados de custos de peças...
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="text-sm text-red-600">
        Erro ao carregar dados de custos de peças.
      </div>
    );
  }

  const {
    grafico06MotoBoyPC = [],
    grafico07TranspPC = [],
    grafico08PorMotoBoy = [],
    grafico09PorTransportadora = [],
  } = data;

  // Quebra o nome da empresa em 2 linhas pra não ficar uma bíblia embaixo da barra
  const grafico08Formatado = grafico08PorMotoBoy.map((item) => ({
    ...item,
    empresaFormatada: item.empresa.replace(
      /\s(COURIER|TR PEÇA)$/i,
      "\n$1"
    ),
  }));

  const grafico09Formatado = grafico09PorTransportadora.map((item) => ({
    ...item,
    empresaFormatada: item.empresa.replace(
      /\s(-TR PEÇA)$/i,
      "\n$1"
    ),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* GRÁFICO 06 – CUSTO COURIER POR LOJA */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            TRANSPORTE PEÇAS - CUSTO COURIER POR LOJA
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico06MotoBoyPC}
              barCategoryGap={30}
              margin={{ bottom: 20 }}
            >
              <XAxis
                dataKey="cidade"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={0}
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#000",
                }}
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

      {/* GRÁFICO 07 – CUSTO TRANSPORTADORA POR LOJA */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            TRANSPORTE PEÇAS - CUSTO TRANSPORTADORA POR LOJA
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico07TranspPC}
              barCategoryGap={30}
              margin={{ bottom: 20 }}
            >
              <XAxis
                dataKey="cidade"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={0}
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "#000",
                }}
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

      {/* GRÁFICO 08 – CUSTO COURIER (POR EMPRESA) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            TRANSPORTE PEÇAS - CUSTO COURIER
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico08Formatado}
              barCategoryGap={40}
              margin={{ bottom: 70 }}
            >
              <XAxis
                dataKey="empresaFormatada"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={70}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const lines = String(payload.value || "").split("\n");
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {lines.map((line, index) => (
                        <text
                          key={index}
                          x={0}
                          y={0}
                          dy={index * 12 + 8}
                          textAnchor="middle"
                          fontSize={9}
                          fontWeight={600}
                          fill="#000"
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                }}
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
                barSize={36}
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

      {/* GRÁFICO 09 – CUSTO TRANSPORTADORA (POR EMPRESA) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold uppercase">
            TRANSPORTE PEÇAS - CUSTO TRANSPORTADORA
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={grafico09Formatado}
              barCategoryGap={40}
              margin={{ bottom: 70 }}
            >
              <XAxis
                dataKey="empresaFormatada"
                tickLine={false}
                axisLine={false}
                interval={0}
                height={70}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const lines = String(payload.value || "").split("\n");
                  return (
                    <g transform={`translate(${x},${y})`}>
                      {lines.map((line, index) => (
                        <text
                          key={index}
                          x={0}
                          y={0}
                          dy={index * 12 + 8}
                          textAnchor="middle"
                          fontSize={9}
                          fontWeight={600}
                          fill="#000"
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                }}
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
                barSize={36}
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
