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
const COR_TERC = "#F59E0B"; // agora usado para Demonstração
const COR_PROP = "#15803D"; // agora usado para Normal
const GRID_LIGHT = "#E2E8F0";
const BADGE_BG = "#065F46";
const BADGE_TEXT = "#FFFFFF";
const TOTAL_COLOR = "#022C22";

/* ========= Labels custom ========= */
function QtdBadge({ viewBox, value }) {
  if (value == null || !viewBox) return null;
  const { x, y, width } = viewBox;
  const w = 24;
  const h = 16;
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

  /* ========= Helper de Suspenso ========= */
  const isSuspenso = (s) =>
    typeof s._status_up === "string" &&
    s._status_up.toUpperCase().includes("SUSPENSO");

  /* ========= Contagem de status (agora inclui (D), exclui SUSPENSO) ========= */
  const contagemStatus = useMemo(() => {
    const base = solicitacoes.filter((s) => !isSuspenso(s));
    return {
      RECEBIDO: base.filter((s) => s._status_base === "RECEBIDO").length,
      PROGRAMADO: base.filter((s) => s._status_base === "PROGRAMADO").length,
      "EM ROTA": base.filter((s) => s._status_base === "EM ROTA").length,
      CONCLUIDO: base.filter((s) => s._status_up?.includes("CONCL")).length,
    };
  }, [solicitacoes]);

  /* ========= Listas por status (inclui (D), exclui SUSPENSO) ========= */
  const recebidos = useMemo(
    () =>
      solicitacoes
        .filter(
          (s) =>
            s._status_base === "RECEBIDO" &&
            !isSuspenso(s)
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
            s._status_base === "PROGRAMADO" &&
            !isSuspenso(s)
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
            s._status_base === "EM ROTA" &&
            !isSuspenso(s)
        )
        .sort(
          (a, b) =>
            (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0)
        ),
    [solicitacoes]
  );

  /* ========= Gráfico: Custos Normais vs Demonstrações (Concluídos) ========= */
  const dadosCidadesColuna = useMemo(() => {
    const somaNormal = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const somaDemo = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const qtdNormal = Object.fromEntries(CIDADES.map((c) => [c, 0]));
    const qtdDemo = Object.fromEntries(CIDADES.map((c) => [c, 0]));

    for (const s of solicitacoes) {
      if (!s._status_up?.includes("CONCL")) continue;
      if (isSuspenso(s)) continue;

      const kMes = s._previsao_date
        ? monthKeyLocal(s._previsao_date)
        : monthKeyLocal(s.previsao_br || s.previsao);
      if (kMes !== mesRef) continue;

      const cidade = canonCidade(s.custo_cidade);
      if (!cidade) continue;

      const valorProp = Number(s.valor_prop || 0);
      const valorTerc = Number(s.valor_terc || 0);
      const valorTotal = valorProp + valorTerc;

      const isDemo = s._status_up?.includes("(D)");

      if (isDemo) {
        somaDemo[cidade] += valorTotal;
        qtdDemo[cidade] += 1;
      } else {
        somaNormal[cidade] += valorTotal;
        qtdNormal[cidade] += 1;
      }
    }

    return CIDADES.map((c) => {
      const normal = somaNormal[c] || 0;
      const demo = somaDemo[c] || 0;
      const qtdN = qtdNormal[c] || 0;
      const qtdD = qtdDemo[c] || 0;
      return {
        cidade: c,
        normal,
        demo,
        total: normal + demo,
        qtd: qtdN + qtdD,
        qtdNormal: qtdN,
        qtdDemo: qtdD,
        zero: 0,
      };
    });
  }, [solicitacoes, mesRef]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Banner principal do painel + Forms */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4"
            style={{
              background:
                "linear-gradient(90deg, #165A2A 0%, #FDBA74 40%, #FDE68A 75%, #F9FAFB 100%)",
            }}
          >
            {/* Lado esquerdo: logo + título oficial */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                <img
                  src={logisticaLogo}
                  alt="Logística MacPonta Agro"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-3xl font-extrabold text-white">
                  MacPonta Agro • Painel Logística 2026
                </span>
                <span className="text-sm md:text-base font-bold text-slate-200">
                  Operações de transporte solicitadas via Forms.
                </span>
              </div>
            </div>

            {/* Lado direito: botões dos Forms */}
            <div className="flex flex-col gap-2 w-full md:w-80 justify-start md:items-end">
              <a
                href={FORM_FRETE_MAQUINA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 px-3 py-2 text-xs font-semibold
                           rounded-lg bg-white/95 text-emerald-800 border border-emerald-300
                           hover:bg-emerald-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Forms: Solicitação de Frete MÁQUINAS
              </a>
              <a
                href={FORM_FRETE_PECAS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 px-3 py-2 text-xs font-semibold
                           rounded-lg bg-white/95 text-emerald-800 border border-emerald-300
                           hover:bg-emerald-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Forms: Solicitação de Frete PEÇAS
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de status */}
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
        {/* RECEBIDO */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">
              RECEBIDO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recebidos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {recebidos.map((sol) => (
                  <SolicitacaoCard key={sol.id} solicitacao={sol} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PROGRAMADO */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-700">
              PROGRAMADO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {programados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {programados.map((sol) => (
                  <SolicitacaoCard key={sol.id} solicitacao={sol} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* EM ROTA */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-amber-700">
              EM ROTA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {emRota.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma solicitação
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {emRota.map((sol) => (
                  <SolicitacaoCard key={sol.id} solicitacao={sol} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico mensal: Custos Normais vs Demonstrações (Concluídos) */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Custos Normais vs Demonstrações (Concluídos)
            </CardTitle>
            <p className="text-gray-600">
              Usa <b>Custo por Filial</b>. Segmentos: Normal (verde) e Demonstração (amarelo).
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
                  if (name === "Demonstração")
                    return [
                      `R$ ${Number(value || 0).toLocaleString("pt-BR")}`,
                      "Demonstração",
                    ];
                  if (name === "Normal")
                    return [
                      `R$ ${Number(value || 0).toLocaleString("pt-BR")}`,
                      "Normal",
                    ];
                  if (name === "Qtd") return [value, "Qtd"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Cidade: ${label}`}
              />

              {/* Normal */}
              <Bar dataKey="normal" name="Normal" stackId="v" fill={COR_PROP}>
                <LabelList
                  dataKey="normal"
                  position="inside"
                  formatter={(v) =>
                    v ? `R$ ${Number(v).toLocaleString("pt-BR")}` : ""
                  }
                  fill="#FFFFFF"
                  style={{ fontSize: 11, fontWeight: 700 }}
                />
              </Bar>

              {/* Demonstração */}
              <Bar dataKey="demo" name="Demonstração" stackId="v" fill={COR_TERC}>
                <LabelList
                  dataKey="demo"
                  position="inside"
                  formatter={(v) =>
                    v ? `R$ ${Number(v).toLocaleString("pt-BR")}` : ""
                  }
                  fill="#FFFFFF"
                  style={{ fontSize: 11, fontWeight: 700 }}
                />
              </Bar>

              {/* Layer invisível só para labels de Qtd e Total */}
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
