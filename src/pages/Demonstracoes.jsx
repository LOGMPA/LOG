import React, { useMemo, useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Presentation } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";

// helpers de data 100% local (sem UTC)
const parseBR = (s) => {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const keyLocal = (dLike) => {
  const d = dLike instanceof Date ? dLike : parseBR(dLike);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export default function Demonstracoes() {
  const [mesAno, setMesAno] = useState(format(new Date(), "yyyy-MM"));
  const { data: solicitacoes = [] } = useSolicitacoes();

  const [ano, mes] = mesAno.split("-").map(Number);
  const dataRef = new Date(ano, mes - 1, 1);
  const inicioMes = startOfMonth(dataRef);
  const fimMes = endOfMonth(dataRef);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  // status que contam como demonstração (somente com sufixo (D))
  const ALLOWED_BASE = new Set(["RECEBIDO", "PROGRAMADO", "CONCLUIDO"]);

  // Agrupa por dia usando SEMPRE PREV, só itens (D)
  const mapaDia = useMemo(() => {
    const map = new Map();
    for (const s of solicitacoes) {
      // precisa ter “(D)”
      if (!s._status_up?.includes("(D)")) continue;

      // garantir que o “base” é um dos três
      if (!ALLOWED_BASE.has(s._status_base)) continue;

      // datas: usa _previsao_date ou previsao_br como fallback
      const dPrev = s._previsao_date || parseBR(s.previsao_br || s.previsao);
      if (!dPrev) continue;

      // filtra mês selecionado (local)
      if (dPrev < inicioMes || dPrev > fimMes) continue;

      const k = keyLocal(dPrev);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    }

    // ordena itens do dia por PREV e id
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0) ||
          (a.id || 0) - (b.id || 0)
      );
    }
    return map;
  }, [solicitacoes, inicioMes.getTime(), fimMes.getTime()]);

  const getDoDia = (dia) => (dia ? mapaDia.get(keyLocal(dia)) || [] : []);

  const statusColors = {
    "RECEBIDO (D)": "bg-purple-100 text-purple-800 border-purple-200",
    "PROGRAMADO (D)": "bg-blue-100 text-blue-800 border-blue-200",
    "CONCLUIDO (D)": "bg-green-100 text-green-800 border-green-200",
  };

  const totalDemo = useMemo(() => {
    let n = 0;
    for (const d of mapaDia.values()) n += d.length;
    return n;
  }, [mapaDia]);

  // ***** AQUI: monta as células do mês com offset, igual no calendário principal *****
  const celulasMes = useMemo(() => {
    const cells = [];
    // getDay(): 0=DOM,1=SEG,...; queremos 0=SEG
    const offset = (inicioMes.getDay() + 6) % 7; // segunda = 0, ... domingo = 6

    // células vazias antes do dia 1
    for (let i = 0; i < offset; i++) cells.push(null);

    // dias reais do mês
    for (const d of diasMes) cells.push(d);

    // completa até múltiplo de 7
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [inicioMes.getTime(), diasMes.length]);

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Banner / cabeçalho estilo painel */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            className="px-4 py-2"
            style={{
              // base verde + roxo + amarelo = pôr do sol maconhado
              background:
                "linear-gradient(90deg, #14532D 0%, #22C55E 22%, #A855F7 50%, #F97316 78%, #FEF3C7 100%)",
            }}
          >
            <div className="w-full max-w-2xl bg-white/95 rounded-xl shadow-md px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                <Presentation className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-extrabold text-slate-900">
                  Demonstrações
                </span>
                <span className="text-sm md:text-base text-slate-600">
                  Calendário de demonstrações de equipamentos.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtro de mês */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div
            className="px-3 py-1.5"
            style={{
              background:
                "linear-gradient(90deg, #F3E8FF 0%, #E0F2FE 40%, #FEF3C7 100%)",
            }}
          >
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 md:px-4 md:py-2 flex flex-wrap items-center gap-4">
              <Label
                htmlFor="mesAno"
                className="text-xs md:text-sm font-semibold text-gray-700"
              >
                Selecionar mês:
              </Label>
              <input
                id="mesAno"
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="px-3 h-8 border border-gray-300 rounded-lg text-xs md:text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendário do mês selecionado */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="text-2xl font-extrabold text-purple-800">
            {format(dataRef, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <p className="text-sm font-semibold text-purple-600">
            Total de demonstrações: {totalDemo}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((dia) => (
              <div
                key={dia}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {dia}
              </div>
            ))}

            {/* Células alinhadas com offset */}
            {celulasMes.map((dia, idx) => {
              if (!dia) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[120px] p-2 rounded-lg border bg-gray-50 border-gray-200"
                  />
                );
              }

              const solsDia = getDoDia(dia);
              const hojeKey = keyLocal(new Date());
              const isHoje = keyLocal(dia) === hojeKey;

              return (
                <div
                  key={dia.toString()}
                  className={`min-h-[120px] p-2 rounded-lg border ${
                    isHoje
                      ? "bg-purple-50 border-purple-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-2 ${
                      isHoje ? "text-purple-600" : "text-gray-700"
                    }`}
                  >
                    {format(dia, "d")}
                  </p>

                  <div className="space-y-1.5">
                    {solsDia.map((sol) => {
                      const st = String(sol.status).toUpperCase();
                      const cls =
                        statusColors[st] ||
                        "bg-gray-100 text-gray-800 border-gray-200";
                      return (
                        <div
                          key={sol.id}
                          className={`rounded-lg p-2 border ${cls}`}
                          title={`${
                            sol.chassi_lista?.[0] || "SEM CHASSI"
                          } - ${sol.nota || ""}`}
                        >
                          <p className="text-[9px] font-bold truncate">
                            {sol.chassi_lista?.[0] || "SEM CHASSI"}
                          </p>
                          <p className="text-[9px] truncate mt-0.5">
                            {sol.nota}
                          </p>
                          <span className="text-[8px] px-1 py-0 mt-1 inline-block bg-white rounded border">
                            {st.replace(" (D)", "")}
                          </span>
                        </div>
                      );
                    })}
                    {solsDia.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center">
                        —
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Legenda de Status
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200" />
            <span className="text-sm text-gray-700">RECEBIDO (D)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
            <span className="text-sm text-gray-700">PROGRAMADO (D)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
            <span className="text-sm text-gray-700">CONCLUÍDO (D)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
