import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { loadCustosFrota } from "@/services/custosExcelService";

export default function CustosFrota() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosFrota();
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de frota:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, []);

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
    grafico10GastosVW,
    grafico11GastosDAF,
    grafico12Aproveitamento,
  } = data;

  // Converter aproveitamento para porcentagem legível
  const aproveitamentoData = grafico12Aproveitamento.map((item) => ({
    ...item,
    aproveitamentoPercent: (item.aproveitamento || 0) * 100,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* GRAFICO 10 – GASTOS VW */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Gastos Frota Própria - Caminhão VW ATV6639
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico10GastosVW}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 11 – GASTOS DAF */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Gastos Frota Própria - Caminhão DAF SDY9A72
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico11GastosDAF}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 12 – APROVEITAMENTO FROTA */}
      <Card className="shadow-sm lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Aproveitamento Frota Própria
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aproveitamentoData}>
              <XAxis dataKey="frota" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Aproveitamento (%)") {
                    return [`${value.toFixed(2)}%`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey="aproveitamentoPercent"
                name="Aproveitamento (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
