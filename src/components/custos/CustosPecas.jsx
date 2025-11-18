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
import { loadCustosPecas } from "@/services/custosExcelService";

export default function CustosPecas() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosPecas();
        setData(res);
        setStatus("ok");
      } catch (err) {
        console.error("Erro ao carregar custos de peças:", err);
        setStatus("error");
      }
    }
    fetchData();
  }, []);

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
    grafico06MotoBoyPC,
    grafico07TranspPC,
    grafico08PorMotoBoy,
    grafico09PorTransportadora,
  } = data;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* GRAFICO 06 – MOTOBOY - PC POR CIDADE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Transporte de Peças - Motoboy (PC) 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico06MotoBoyPC}>
              <XAxis dataKey="cidade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 07 – TRANSPORTADORAS - PC POR CIDADE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Transporte de Peças - Transportadoras (PC) 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico07TranspPC}>
              <XAxis dataKey="cidade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 08 – CUSTOS COM MOTOBOY (POR MOTOBOY) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos com Motoboy - 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico08PorMotoBoy}>
              <XAxis dataKey="empresa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 09 – CUSTOS COM TRANSPORTADORA (POR TRANSPORTADORA) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos com Transportadoras - 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico09PorTransportadora}>
              <XAxis dataKey="empresa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
