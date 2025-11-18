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
import { loadCustosMaquinas } from "@/services/custosExcelService";

export default function CustosMaquinas() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await loadCustosMaquinas();
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

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* GRAFICO 01 – META VS REAL */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos Máquinas 2026 - Meta vs Real
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico01MetaVsReal}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="meta" name="Meta 2026" />
              <Bar dataKey="mediaAtual" name="Média Atual (P+T)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 02 – SOMA PROPRIO x TERCEIRO */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos Máquinas 2026 - Soma Total dos Transportes
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico02SomaCustos}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="somaProprio" name="Próprio" />
              <Bar dataKey="somaTerceiro" name="Terceiro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 03 – TERCEIROS POR FRETEIRO */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos Máquinas - Terceiros por Freteiro
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico03Terceiros}>
              <XAxis dataKey="freteiro" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 04 – FROTA PRÓPRIA */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos Máquinas - Frota Própria
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico04Proprio}>
              <XAxis dataKey="frota" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO 05 – MUNCK PC POR CIDADE */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Custos com Munck - 2026 (por cidade)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico05Munck}>
              <XAxis dataKey="cidade" />
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
