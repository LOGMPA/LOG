import React, { useMemo, useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Truck, Navigation, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import StatusCard from "../components/logistica/StatusCard";
import SolicitacaoCard from "../components/logistica/SolicitacaoCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function PainelLogistica() {
  // Filtros “legados” do topo (se usar em outro lugar)
  const [dataInicio] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dataFim] = useState(format(new Date(), "yyyy-MM"));

  // Mês de referência do gráfico (yyyy-MM)
  const [mesRef, setMesRef] = useState(format(new Date(), "yyyy-MM"));

  // Visualização do gráfico: ambos empilhados, só terceiro ou só próprio
  const [viewMode, setViewMode] = useState("ambos"); // "ambos" | "terceiro" | "proprio"

  const { data: solicitacoes = [] } = useSolicitacoes();

  // Paleta e status
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

  // Helpers locais para datas PT-BR, SEM UTC
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
    return `${y}-${m}`; // yyyy-MM
  };

  // Contadores de status (ignora “(D)”)
  const contagemStatus = useMemo(() => {
    const base = solicitacoes.filter((s) => !s._status_up?.includes("(D)"));
    return {
      RECEBIDO: base.filter((s) => s._status_base === "RECEBIDO").length,
      PROGRAMADO: base.filter((s) => s._status_base === "PROGRAMADO").length,
      "EM ROTA": base.filter((s) => s._status_base === "EM ROTA").length,
      CONCLUIDO: base.filter((s) => s._status_up?.includes("CONCL")).length,
    };
  }, [solicitacoes]);

  // Listas por status (sem limite)
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

  // 8 filiais oficiais (exibição com acento correto já vem do loader)
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

  // Dados do gráfico: soma por cidade, separando TERCEIRO x PRÓPRIO, qtd e total
  // Usa SOMENTE PREV e mês local (yyyy-MM). SEM startsWith em chave UTC.
  const dadosCidadesColuna = useMemo(() => {
    const somaProp = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const somaTerc = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const qtd = Object.fromEntries(CIDADES.map((c) => [c, 0]));

    for (const s of solicitacoes) {
      // seleciona mês pelo PREV em fuso local
      const kMes = s._previsao_date ? monthKeyLocal(s._previsao_date) : monthKeyLocal(s.previsao_br || s.previsao);
      if (kMes !== mesRef) continue;

      const valorProp = Number(s.valor_prop || 0);
      const valorTerc = Number(s.valor_terc || 0);

      const origem = CIDADES.includes(s.esta) ? s.esta : null;
      const destino = CIDADES.includes(s.vai) ? s.vai : null;

      if (origem) {
        somaProp[origem] += valorProp;
        somaTerc[origem] += valorTerc;
        qtd[origem] += 1;
      }
      if (destino && destino !== origem) {
        somaProp[destino] += valorProp;
        somaTerc[destino] += valorTerc;
        qtd[destino] += 1;
      }
    }

    return CIDADES.map((c) => ({
      cidade: c,
      prop: somaProp[c] || 0,
      terc: somaTerc[c] || 0,
      total: (somaProp[c] || 0) + (somaTerc[c] || 0),
      qtd: qtd[c] || 0,
    }));
  }, [solicitacoes, mesRef]);

  // Cores fixas por série
  const COR_TERC = "#1D4ED8"; // azul
  const COR_PROP = "#10B981"; // verde

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Logística 2026</h1>
        <p className="text-gray-600">Visão geral das operações de transporte que são solicitadas através do Forms.</p>
      </div>

      {/* Cards de status (contam tudo, sem range) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard status="RECEBIDO" count={contagemStatus.RECEBIDO} icon={Clock} color={statusColors.RECEBIDO} />
        <StatusCard status="PROGRAMADO" count={contagemStatus.PROGRAMADO} icon={Truck} color={statusColors.PROGRAMADO} />
        <StatusCard status="EM ROTA" count={contagemStatus["EM ROTA"]} icon={Navigation} color={statusColors["EM ROTA"]} />
        <StatusCard status="CONCLUÍDO" count={contagemStatus.CONCLUIDO} icon={CheckCircle} color={statusColors.CONCLUIDO} />
      </div>

      {/* Listas por status (sem limite) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">RECEBIDO</CardTitle>
          </CardHeader>
          <CardContent>
            {recebidos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
            ) : (
              recebidos.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-700">PROGRAMADO</CardTitle>
          </CardHeader>
          <CardContent>
            {programados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
            ) : (
              programados.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-amber-700">EM ROTA</CardTitle>
          </CardHeader>
          <CardContent>
            {emRota.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação</p>
            ) : (
              emRota.map((sol) => <SolicitacaoCard key={sol.id} solicitacao={sol} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico mensal: breakdown Terceiro x Próprio + total e qtd */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Custos por Cidade no mês</CardTitle>
            <p className="text-gray-600">
              Dentro: <b>Qtd</b> de solicitações. No topo: <b>Total</b>. Segmentos: <span style={{ color: COR_TERC }}>Terceiro</span> e{" "}
              <span style={{ color: COR_PROP }}>Próprio</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Mês:</label>
            <input
              type="month"
              value={mesRef}
              onChange={(e) => setMesRef(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              title="Visualização"
            >
              <option value="ambos">Ambos (empilhado)</option>
              <option value="terceiro">Somente Terceiro</option>
              <option value="proprio">Somente Próprio</option>
            </select>
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
                  if (name === "Qtd") return [value, "Qtd"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Cidade: ${label}`}
              />

              {/* Modo: somente uma série */}
              {viewMode !== "ambos" && (
                <>
                  <Bar dataKey={viewMode === "terceiro" ? "terc" : "prop"} name={viewMode === "terceiro" ? "Terceiro" : "Próprio"} fill={viewMode === "terceiro" ? COR_TERC : COR_PROP}>
                    <LabelList dataKey={viewMode === "terceiro" ? "terc" : "prop"} position="inside" formatter={(v) => (v ? moeda(v) : "")} />
                    {/* Qtd no interior da coluna */}
                    <LabelList dataKey="qtd" position="insideBottom" formatter={(v) => (v ? `${v}` : "")} />
                  </Bar>
                  {/* Total no topo (barra transparente) */}
                  <Bar dataKey="total" name="Total" fill="transparent">
                    <LabelList dataKey="total" position="top" formatter={(v) => (v ? moeda(v) : "")} />
                  </Bar>
                </>
              )}

              {/* Modo: ambos empilhados */}
              {viewMode === "ambos" && (
                <>
                  <Bar dataKey="terc" name="Terceiro" stackId="v" fill={COR_TERC}>
                    <LabelList dataKey="terc" position="inside" formatter={(v) => (v ? moeda(v) : "")} />
                  </Bar>
                  <Bar dataKey="prop" name="Próprio" stackId="v" fill={COR_PROP}>
                    <LabelList dataKey="prop" position="inside" formatter={(v) => (v ? moeda(v) : "")} />
                  </Bar>
                  <Bar dataKey="total" name="Total" fill="transparent">
                    <LabelList dataKey="qtd" position="inside" formatter={(v) => (v ? `${v}` : "")} />
                    <LabelList dataKey="total" position="top" formatter={(v) => (v ? moeda(v) : "")} />
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
