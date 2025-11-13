import React, { useMemo, useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, subDays } from "date-fns";
import { Clock, Truck, Navigation, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import StatusCard from "../components/logistica/StatusCard";
import SolicitacaoCard from "../components/logistica/SolicitacaoCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PainelLogistica() {
  const [dataInicio] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dataFim] = useState(format(new Date(), "yyyy-MM"));
  const [mesRef, setMesRef] = useState(format(new Date(), "yyyy-MM"));

  const { data: solicitacoes = [] } = useSolicitacoes();

  const statusColors = {
    RECEBIDO: { bg: "bg-gradient-to-br from-gray-50 to-gray-100", dot: "bg-gray-500", text: "text-gray-700", icon: "text-gray-600" },
    PROGRAMADO: { bg: "bg-gradient-to-br from-blue-50 to-blue-100", dot: "bg-blue-500", text: "text-blue-700", icon: "text-blue-600" },
    "EM ROTA": { bg: "bg-gradient-to-br from-amber-50 to-amber-100", dot: "bg-amber-500", text: "text-amber-700", icon: "text-amber-600" },
    CONCLUIDO: { bg: "bg-gradient-to-br from-green-50 to-green-100", dot: "bg-green-500", text: "text-green-700", icon: "text-green-600" },
  };

  const moeda = (v) =>
    `R$ ${Number(v || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Datas PT-BR no fuso local
  const parseBR = (s) => {
    if (!s) return null;
    if (s instanceof Date) return s;
    const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };
  const monthKeyLocal = (dLike) => {
    const d = dLike instanceof Date ? dLike : parseBR(dLike);
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  // Cards: mesmos contadores (ignora "(D)")
  const contagemStatus = useMemo(() => {
    const base = solicitacoes.filter((s) => !s._status_up?.includes("(D)"));
    return {
      RECEBIDO: base.filter((s) => s._status_base === "RECEBIDO").length,
      PROGRAMADO: base.filter((s) => s._status_base === "PROGRAMADO").length,
      "EM ROTA": base.filter((s) => s._status_base === "EM ROTA").length,
      CONCLUIDO: base.filter((s) => s._status_up?.includes("CONCL")).length,
    };
  }, [solicitacoes]);

  // Listas por status (sem limite) — inalteradas
  const recebidos = useMemo(
    () =>
      solicitacoes
        .filter((s) => s._status_base === "RECEBIDO" && !s._status_up?.includes("(D)"))
        .sort((a, b) => (a._previsao_date?.getTime() || 0) - (b._previsao_date?.getTime() || 0)),
    [solicitacoes]
  );
  const programados = useMemo(
    () =>
      solicitacoes
        .filter((s) => s._status_base === "PROGRAMADO" && !s._status_up?.includes("(D)"))
        .sort((a, b) => (a._previsao_date?.getTime() || 0) - (b._previsao_date?.getTime() || 0)),
    [solicitacoes]
  );
  const emRota = useMemo(
    () =>
      solicitacoes
        .filter((s) => s._status_base === "EM ROTA" && !s._status_up?.includes("(D)"))
        .sort((a, b) => (a._previsao_date?.getTime() || 0) - (b._previsao_date?.getTime() || 0)),
    [solicitacoes]
  );

  // Ordem fixa das 8 cidades
  const CIDADES = [
    "PONTA GROSSA",
    "CASTRO",
    "ARAPOTI",
    "TIBAGI",
    "IRATI",
    "PRUDENTÓPOLIS",
    "GUARAPUAVA",
    "QUEDAS DO IGUAÇU",
  ];

  // Gráfico: apenas CONCLUÍDO/CONCLUÍDO (D), mês selecionado, mantém cidades zeradas
  const dadosCidadesColuna = useMemo(() => {
    const somaProp = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const somaTerc = Object.fromEntries(CIDADES.map((c) => [c, 0]));

    for (const s of solicitacoes) {
      // Só concluídos (com ou sem D)
      if (!s._status_up?.includes("CONCL")) continue;

      // mês pelo PREV local
      const kMes = s._previsao_date ? monthKeyLocal(s._previsao_date) : monthKeyLocal(s.previsao_br || s.previsao);
      if (kMes !== mesRef) continue;

      const valorProp = Number(s.valor_prop || 0);
      const valorTerc = Number(s.valor_terc || 0);

      const origem = CIDADES.includes(s.esta) ? s.esta : null;
      const destino = CIDADES.includes(s.vai) ? s.vai : null;

      if (origem) {
        somaProp[origem] += valorProp;
        somaTerc[origem] += valorTerc;
      }
      if (destino && destino !== origem) {
        somaProp[destino] += valorProp;
        somaTerc[destino] += valorTerc;
      }
    }

    // mantém todas as cidades, mesmo zeradas
    return CIDADES.map((c) => ({
      cidade: c,
      prop: somaProp[c] || 0,
      terc: somaTerc[c] || 0,
      total: (somaProp[c] || 0) + (somaTerc[c] || 0),
    }));
  }, [solicitacoes, mesRef]);

  // Cores do print: Terceiro = amarelo; Próprio = verde escuro
  const COR_TERC = "#FFC107"; // amarelo
  const COR_PROP = "#1B5E20"; // verde escuro

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Logística 2026</h1>
        <p className="text-gray-600">Visão geral das operações de transporte solicitadas via Forms.</p>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard status="RECEBIDO" count={contagemStatus.RECEBIDO} icon={Clock} color={statusColors.RECEBIDO} />
        <StatusCard status="PROGRAMADO" count={contagemStatus.PROGRAMADO} icon={Truck} color={statusColors.PROGRAMADO} />
        <StatusCard status="EM ROTA" count={contagemStatus["EM ROTA"]} icon={Navigation} color={statusColors["EM ROTA"]} />
        <StatusCard status="CONCLUÍDO" count={contagemStatus.CONCLUIDO} icon={CheckCircle} color={statusColors.CONCLUIDO} />
      </div>

      {/* Listas por status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="text-sm font-semibold text-gray-700">RECEBIDO</CardTitle></CardHeader>
          <CardContent>{recebidos.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p> : recebidos.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}</CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="text-sm font-semibold text-blue-700">PROGRAMADO</CardTitle></CardHeader>
          <CardContent>{programados.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p> : programados.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}</CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="text-sm font-semibold text-amber-700">EM ROTA</CardTitle></CardHeader>
          <CardContent>{emRota.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p> : emRota.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}</CardContent>
        </Card>
      </div>

      {/* Gráfico mensal: SOMENTE CONCLUÍDO/(D), Terceiro+Próprio empilhados, total no topo */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Custos por Cidade (Concluídos)</CardTitle>
            <p className="text-gray-600">Somente as solicitações que já estão com o status CONCLUÍDO. Segmentos: Terceiro (amarelo) e Próprio (verde).</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Mês:</label>
            <input
              type="month"
              value={mesRef}
              onChange={(e) => setMesRef(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            />
          </div>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={dadosCidadesColuna} margin={{ top: 32, right: 16, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cidade" angle={-15} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Total") return [moeda(value), "Total"];
                  if (name === "Terceiro") return [moeda(value), "Terceiro"];
                  if (name === "Próprio") return [moeda(value), "Próprio"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Cidade: ${label}`}
              />

              {/* Terceiro (amarelo) + Próprio (verde) empilhados */}
              <Bar dataKey="terc" name="Terceiro" stackId="v" fill={COR_TERC}>
                <LabelList dataKey="terc" position="inside" formatter={(v) => (v ? moeda(v) : "")} />
              </Bar>
              <Bar dataKey="prop" name="Próprio" stackId="v" fill={COR_PROP}>
                <LabelList dataKey="prop" position="inside" formatter={(v) => (v ? moeda(v) : "")} />
              </Bar>

              {/* Total no topo (barra transparente só para label) */}
              <Bar dataKey="total" name="Total" fill="transparent">
                <LabelList dataKey="total" position="top" formatter={(v) => (v ? moeda(v) : "")} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
