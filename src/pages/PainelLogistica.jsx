import React, { useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Truck, Navigation, CheckCircle, ExternalLink } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";
import StatusCard from "../components/logistica/StatusCard";
import SolicitacaoCard from "../components/logistica/SolicitacaoCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PainelLogistica() {
  // filtro antigo por range (mantido caso use em outros pontos)
  const [dataInicio, setDataInicio] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState(format(new Date(), "yyyy-MM-dd"));

  // filtro de mês para o gráfico (YYYY-MM)
  const [mesRef, setMesRef] = useState(format(new Date(), "yyyy-MM"));

  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  const statusColors = {
    RECEBIDO: { bg: "bg-gradient-to-br from-gray-50 to-gray-100", accent: "bg-gray-500", text: "text-gray-700", icon: "text-gray-600" },
    PROGRAMADO: { bg: "bg-gradient-to-br from-blue-50 to-blue-100", accent: "bg-blue-500", text: "text-blue-700", icon: "text-blue-600" },
    "EM ROTA": { bg: "bg-gradient-to-br from-amber-50 to-amber-100", accent: "bg-amber-500", text: "text-amber-700", icon: "text-amber-600" },
    CONCLUIDO: { bg: "bg-gradient-to-br from-green-50 to-green-100", accent: "bg-green-500", text: "text-green-700", icon: "text-green-600" }
  };

  // lista fixa das 8 cidades
  const CIDADES_FIXAS = [
    "PONTA GROSSA",
    "CASTRO",
    "IRATI",
    "ARAPOTI",
    "GUARAPUAVA",
    "PRUDENTÓPOLIS",
    "QUEDAS DO IGUAÇU",
    "TIBAGI",
  ];

  const extrairCidade = (texto) => {
    if (!texto) return null;
    const t = String(texto).toUpperCase();
    for (const c of CIDADES_FIXAS) if (t.includes(c)) return c;
    return null;
  };

  // formatação de moeda para labels e tooltip
  const moeda = (v) =>
    `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // cards por status (range antigo)
  const solicitacoesFiltradas = solicitacoes.filter(s => {
    const d = new Date(s.previsao);
    if (String(s.status).includes("(D)")) return false;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return d >= inicio && d <= fim;
  });

  const contagemStatus = (() => {
  const base = solicitacoes.filter(s => !String(s.status).includes("(D)"));
  return {
    RECEBIDO: base.filter(s => s.status === "RECEBIDO").length,
    PROGRAMADO: base.filter(s => s.status === "PROGRAMADO").length,
    "EM ROTA": base.filter(s => s.status === "EM ROTA").length,
    CONCLUIDO: base.filter(s => s.status === "CONCLUIDO" || s.status === "CONCLUÍDO").length,
  };
})();

  const proximosQuinzeDias = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const recebidos = solicitacoes.filter(s => s.status === "RECEBIDO" && !String(s.status).includes("(D)"))
    .sort((a, b) => new Date(a.previsao) - new Date(b.previsao));
  const programados = solicitacoes.filter(s => s.status === "PROGRAMADO" && !String(s.status).includes("(D)"))
    .sort((a, b) => new Date(a.previsao) - new Date(b.previsao));
  const emRota = solicitacoes.filter(s => s.status === "EM ROTA" && !String(s.status).includes("(D)"))
    .sort((a, b) => new Date(a.previsao) - new Date(b.previsao));

  // intervalo do mês selecionado para o gráfico
  const [anoGraf, mesGraf] = mesRef.split("-").map(Number);
  const inicioMes = startOfMonth(new Date(anoGraf, mesGraf - 1, 1));
  const fimMes = endOfMonth(new Date(anoGraf, mesGraf - 1, 1));

  const recorteMensal = solicitacoes.filter((s) => {
    if (!s.previsao) return false;
    const d = parseISO(s.previsao);
    if (isNaN(d)) return false;
    return d >= inicioMes && d <= fimMes;
  });

  // soma por cidade (origem e destino contam)
  const somaPorCidade = {};
  const contagemPorCidade = {};
  CIDADES_FIXAS.forEach(c => { somaPorCidade[c] = 0; contagemPorCidade[c] = 0; });

  recorteMensal.forEach((s) => {
    const origem = extrairCidade(s.esta) || extrairCidade(s.estao_em);
    const destino = extrairCidade(s.vai) || extrairCidade(s.vai_para);
    const valor = (s.valor_terc || 0) > 0 ? Number(s.valor_terc) : Number(s.valor_prop || 0);

    if (origem && somaPorCidade[origem] !== undefined) {
      somaPorCidade[origem] += valor || 0;
      contagemPorCidade[origem] += 1;
    }
    if (destino && destino !== origem && somaPorCidade[destino] !== undefined) {
      somaPorCidade[destino] += valor || 0;
      contagemPorCidade[destino] += 1;
    }
  });

  // dataset das 8 cidades, paleta John Deere
  const JD_COLORS = ["#275317", "#367C2B", "#4E9F3D", "#6BBF59", "#275317", "#367C2B", "#4E9F3D", "#6BBF59"];
  const dadosCidadesColuna = CIDADES_FIXAS.map((c, i) => ({
    cidade: c.charAt(0) + c.slice(1).toLowerCase(),
    valor: somaPorCidade[c] || 0,
    qtd: contagemPorCidade[c] || 0,
    fill: JD_COLORS[i % JD_COLORS.length],
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Logística 2026</h1>
        <p className="text-gray-600">Visão geral das operações de transporte que são solicitada através do Forms.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Formulários de Solicitação</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://forms.office.com/r/SaYf3D9bz4" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" />
              Solicitação de Frete de Máquinas
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://forms.office.com/r/A7wSsGC5fV" target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" />
              Solicitação de Frete de Peças/Fracionados
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard status="RECEBIDO" count={contagemStatus.RECEBIDO} icon={Clock} color={statusColors.RECEBIDO} />
        <StatusCard status="PROGRAMADO" count={contagemStatus.PROGRAMADO} icon={Truck} color={statusColors.PROGRAMADO} />
        <StatusCard status="EM ROTA" count={contagemStatus["EM ROTA"]} icon={Navigation} color={statusColors["EM ROTA"]} />
        <StatusCard status="CONCLUÍDO" count={contagemStatus.CONCLUIDO} icon={CheckCircle} color={statusColors.CONCLUIDO} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-700">RECEBIDO</CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {recebidos.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
             : recebidos.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="border-b bg-blue-50">
            <CardTitle className="text-sm font-semibold text-blue-700">PROGRAMADO</CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {programados.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
             : programados.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="border-b bg-amber-50">
            <CardTitle className="text-sm font-semibold text-amber-700">EM ROTA</CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {emRota.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
             : emRota.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Custos de Transporte por Cidade</CardTitle>
            <p className="text-sm text-gray-600">Valores considerando Terceiros quando contratados, caso contrário considera Frota Própria</p>
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
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={dadosCidadesColuna} margin={{ top: 28, right: 16, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cidade" angle={-15} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`} />
              <Tooltip formatter={(v) => moeda(v)} />
              <Bar dataKey="valor" name="Custo (R$)" isAnimationActive>
                {dadosCidadesColuna.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="qtd" position="inside" formatter={(v) => `${v}`}/>
                <LabelList dataKey="valor" position="top" formatter={(v) => moeda(v)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
