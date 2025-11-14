import React, { useMemo, useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, subDays } from "date-fns";
import { Clock, Truck, Navigation, CheckCircle, ExternalLink } from "lucide-react";
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

/* ====== LOGO ====== */
import logisticaLogo from "../assets/ICONLOG.jpg";

/* ====== LINKS DOS FORMULÁRIOS ====== */
const FORM_FRETE_MAQUINA = "https://forms.office.com/r/SaYf3D9bz4";
const FORM_FRETE_PECAS = "https://forms.office.com/r/A7wSsGC5fV";

/* ========= Datas locais (sem UTC) ========= */
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ========= Cidades canonizadas ========= */
const NORM = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

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
const MAP_CANON = new Map(CIDADES.map((c) => [NORM(c), c]));
const canonCidade = (txt) => MAP_CANON.get(NORM(txt)) || null;

/* ========= Cores ========= */
const COR_TERC = "#F2B300"; // amarelo mais escuro (Terceiro)
const COR_PROP = "#1B5E20"; // verde escuro (Próprio)
const GRID_LIGHT = "#ECECEC"; // grid clarinho
const BADGE_BG = "#0B2B6B"; // azul-escuro do badge de quantidade
const BADGE_TEXT = "#FFFFFF";
const TOTAL_COLOR = "#092357"; // azul-escuro do total no topo

/* ========= Labels custom ========= */
function QtdBadge({ viewBox, value }) {
  if (value == null || !viewBox) return null;
  const { x, y, width } = viewBox;
  const w = 24,
    h = 16;
  const cx = x + width / 2 - w / 2;
  const cy = y - h - 2;
  return (
    <g>
      <rect x={cx} y={cy} rx={3} ry={3} width={w} height={h} fill={BADGE_BG} />
      <text
        x={cx + w / 2}
        y={cy + h / 2 + 4}
        textAnchor="middle"
        fontSize="10"
        fill={BADGE_TEXT}
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  );
}

function TotalLabel({ viewBox, value }) {
  if (value == null || !viewBox) return null;
  const { x, y, width } = viewBox;
  const cx = x + width / 2;
  const cy = y - 26;
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fontSize="12"
      fontWeight="800"
      fill={TOTAL_COLOR}
    >
      {`R$ ${Number(value || 0).toLocaleString("pt-BR")}`}
    </text>
  );
}

export default function PainelLogistica() {
  const [dataInicio] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dataFim] = useState(format(new Date(), "yyyy-MM"));
  const [mesRef, setMesRef] = useState(format(new Date(), "yyyy-MM"));

  const { data: solicitacoes = [] } = useSolicitacoes();

  const statusColors = {
    RECEBIDO: {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100",
      dot: "bg-gray-500",
      text: "text-gray-700",
      icon: "text-gray-600",
    },
    PROGRAMADO: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      dot: "bg-blue-500",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    "EM ROTA": {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      dot: "bg-amber-500",
      text: "text-amber-700",
      icon: "text-amber-600",
    },
    CONCLUIDO: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      dot: "bg-green-500",
      text: "text-green-700",
      icon: "text-green-600",
    },
  };

  /* ========= Cards: contadores ========= */
  const contagemStatus = useMemo(() => {
    const base = solicitacoes.filter((s) => !s._status_up?.includes("(D)"));
    return {
      RECEBIDO: base.filter((s) => s._status_base === "RECEBIDO").length,
      PROGRAMADO: base.filter((s) => s._status_base === "PROGRAMADO").length,
      "EM ROTA": base.filter((s) => s._status_base === "EM ROTA").length,
      CONCLUIDO: base.filter((s) => s._status_up?.includes("CONCL")).length,
    };
  }, [solicitacoes]);

  /* ========= Listas por status ========= */
  const recebidos = useMemo(
    () =>
      solicitacoes
        .filter(
          (s) =>
            s._status_base === "RECEBIDO" && !s._status_up?.includes("(D)")
        )
        .sort(
          (a, b) =>
            (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0)
        ),
    [solicitacoes]
  );
  const programados = useMemo(
    () =>
      solicitacoes
        .filter(
          (s) =>
            s._status_base === "PROGRAMADO" && !s._status_up?.includes("(D)")
        )
        .sort(
          (a, b) =>
            (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0)
        ),
    [solicitacoes]
  );
  const emRota = useMemo(
    () =>
      solicitacoes
        .filter(
          (s) =>
            s._status_base === "EM ROTA" && !s._status_up?.includes("(D)")
        )
        .sort(
          (a, b) =>
            (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0)
        ),
    [solicitacoes]
  );

  /* ========= Gráfico: só CONCLUÍDO/(D), usa Custo por Filial ========= */
  const dadosCidadesColuna = useMemo(() => {
    const somaProp = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const somaTerc = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const qtd = Object.fromEntries(CIDADES.map((c) => [c, 0]));

    for (const s of solicitacoes) {
      if (!s._status_up?.includes("CONCL")) continue;
      const kMes = s._previsao_date
        ? monthKeyLocal(s._previsao_date)
        : monthKeyLocal(s.previsao_br || s.previsao);
      if (kMes !== mesRef) continue;

      const cidade = canonCidade(s.custo_cidade);
      if (!cidade) continue;

      const valorProp = Number(s.valor_prop || 0);
      const valorTerc = Number(s.valor_terc || 0);

      somaProp[cidade] += valorProp;
      somaTerc[cidade] += valorTerc;
      qtd[cidade] += 1;
    }

    return CIDADES.map((c) => ({
      cidade: c,
      prop: somaProp[c] || 0,
      terc: somaTerc[c] || 0,
      total: (somaProp[c] || 0) + (somaTerc[c] || 0),
      qtd: qtd[c] || 0,
      zero: 0,
    }));
  }, [solicitacoes, mesRef]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Bloco dos FORMULÁRIOS (agora com logo no lugar do texto) */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            {/* Logo pequena e redonda no lugar de "Formulários:" */}
            <div className="flex items-center justify-start">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                <img
                  src={logisticaLogo}
                  alt="Logística MacPonta Agro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={FORM_FRETE_MAQUINA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white text-blue-700 border border-blue-300 hover:bg-blue-100"
              >
                <ExternalLink className="w-4 h-4" />
                Forms: Solicitação de Frete MÁQUINAS
              </a>
              <a
                href={FORM_FRETE_PECAS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white text-blue-700 border border-blue-300 hover:bg-blue-100"
              >
                <ExternalLink className="w-4 h-4" />
                Forms: Solicitação de Frete PEÇAS/FRACIONADOS
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MacPonta Agro • Painel Logística 2026
        </h1>
        <p className="text-gray-600">
          Visão geral das operações de transporte solicitadas via Forms.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          status="RECEBIDO"
          count={contagemStatus.RECEBIDO}
          icon={Clock}
          color={statusColors.RECEBIDO}
        />
        <StatusCard
          status="PROGRAMADO"
          count={contagemStatus.PROGRAMADO}
          icon={Truck}
          color={statusColors.PROGRAMADO}
        />
        <StatusCard
          status="EM ROTA"
          count={contagemStatus["EM ROTA"]}
          icon={Navigation}
          color={statusColors["EM ROTA"]}
        />
        <StatusCard
          status="CONCLUÍDO"
          count={contagemStatus.CONCLUIDO}
          icon={CheckCircle}
          color={statusColors.CONCLUIDO}
        />
      </div>

      {/* Listas por status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">
              RECEBIDO
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recebidos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              recebidos.map((sol) => (
                <SolicitacaoCard key={sol.id} solicitacao={sol} />
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-700">
              PROGRAMADO
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              programados.map((sol) => (
                <SolicitacaoCard key={sol.id} solicitacao={sol} />
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-amber-700">
              EM ROTA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emRota.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              emRota.map((sol) => (
                <SolicitacaoCard key={sol.id} solicitacao={sol} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico mensal: Custos (Status Concluídos) */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Custos (Status Concluídos)
            </CardTitle>
            <p className="text-gray-600">
              Usa <b>Custo por Filial</b>. Segmentos: Terceiro (amarelo) e
              Próprio (verde).
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
          </div>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={dadosCidadesColuna}
              margin={{ top: 48, right: 16, left: 0, bottom: 34 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} />
              <XAxis dataKey="cidade" angle={-15} textAnchor="end" height={50} />
              <YAxis
                tickFormatter={(v) =>
                  `R$ ${Number(v).toLocaleString("pt-BR")}`
                }
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Total")
                    return [
                      `R$ ${Number(value || 0).toLocaleString("pt-BR")}`,
                      "Total",
                    ];
                  if (name === "Terceiro")
                    return [
                      `R$ ${Number(value || 0).toLocaleString("pt-BR")}`,
                      "Terceiro",
                    ];
                  if (name === "Próprio")
                    return [
                      `R$ ${Number(value || 0).toLocaleString("pt-BR")}`,
                      "Próprio",
                    ];
                  if (name === "Qtd") return [value, "Qtd"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Cidade: ${label}`}
              />

              <Bar dataKey="terc" name="Terceiro" stackId="v" fill={COR_TERC}>
                <LabelList
                  dataKey="terc"
                  position="inside"
                  formatter={(v) =>
                    v ? `R$ ${Number(v).toLocaleString("pt-BR")}` : ""
                  }
                  fill="#FFFFFF"
                  style={{ fontSize: 11, fontWeight: 700 }}
                />
              </Bar>
              <Bar dataKey="prop" name="Próprio" stackId="v" fill={COR_PROP}>
                <LabelList
                  dataKey="prop"
                  position="inside"
                  formatter={(v) =>
                    v ? `R$ ${Number(v).toLocaleString("pt-BR")}` : ""
                  }
                  fill="#FFFFFF"
                  style={{ fontSize: 11, fontWeight: 700 }}
                />
              </Bar>

              <Bar dataKey="zero" stackId="v" fill="transparent">
                <LabelList dataKey="qtd" content={<QtdBadge />} />
                <LabelList dataKey="total" content={<TotalLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
