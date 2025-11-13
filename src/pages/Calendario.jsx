import React, { useMemo } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "../components/ui/badge";

// --- helpers de data seguros em fuso local ---
const parseBR = (s) => {
  if (!s) return null;
  if (s instanceof Date) return s;
  const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
};
// chave yyyy-MM-dd em localtime
const localKey = (dLike) => {
  const d = dLike instanceof Date ? dLike : parseBR(dLike);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Calendario() {
  const hoje = new Date();
  const segundaFeira = startOfWeek(hoje, { weekStartsOn: 1 }); // seg
  const sabado = addDays(segundaFeira, 5); // até sábado
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const { data: solicitacoes = [] } = useSolicitacoes();

  // Gera chaves locais dos dias da semana e do mês para comparar sem D-1
  const diasSemana = eachDayOfInterval({ start: segundaFeira, end: sabado });
  const setSemanaKeys = useMemo(
    () => new Set(diasSemana.map((d) => localKey(d))),
    [segundaFeira.getTime()]
  );

  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });
  const setMesKeys = useMemo(
    () => new Set(diasMes.map((d) => localKey(d))),
    [inicioMes.getTime(), fimMes.getTime()]
  );

  // Agrupamento por dia (sem usar toISOString, só chave local)
  // Semana: RECEBIDO / PROGRAMADO / EM ROTA, ignora "(D)"
  const mapaSemana = useMemo(() => {
    const m = new Map();
    for (const s of solicitacoes) {
      const base = s._status_base; // vem do loader
      if (!["RECEBIDO", "PROGRAMADO", "EM ROTA"].includes(base)) continue;
      if (s._status_up?.includes("(D)")) continue;

      // prioridade para data pré-processada, senão cai pro BR
      const k = s._previsao_key || localKey(s.previsao_br || s.previsao);
      if (!k || !setSemanaKeys.has(k)) continue;

      if (!m.has(k)) m.set(k, []);
      m.get(k).push(s);
    }
    // ordena cada dia por data e id para consistência
    for (const [k, arr] of m.entries()) {
      arr.sort(
        (a, b) =>
          (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0) || (a.id || 0) - (b.id || 0)
      );
    }
    return m;
  }, [solicitacoes, setSemanaKeys]);

  const getSemana = (dia) => mapaSemana.get(localKey(dia)) || [];

  // Mês: CONCLUÍDO (inclui concluído e concluído (D))
  const mapaMes = useMemo(() => {
    const m = new Map();
    for (const s of solicitacoes) {
      if (!s._status_up?.includes("CONCL")) continue;
      const k = s._previsao_key || localKey(s.previsao_br || s.previsao);
      if (!k || !setMesKeys.has(k)) continue;

      if (!m.has(k)) m.set(k, []);
      m.get(k).push(s);
    }
    for (const [k, arr] of m.entries()) {
      arr.sort(
        (a, b) =>
          (a._previsao_date?.getTime() || 0) -
            (b._previsao_date?.getTime() || 0) || (a.id || 0) - (b.id || 0)
      );
    }
    return m;
  }, [solicitacoes, setMesKeys]);

  const getMes = (dia) => mapaMes.get(localKey(dia)) || [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <CalendarIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
      </div>
      <p className="text-gray-600">Visão semanal e mensal de transportes</p>

      {/* SEMANA ATUAL */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl font-bold text-gray-900">
            Semana Atual - {format(segundaFeira, "dd/MM", { locale: ptBR })} a{" "}
            {format(sabado, "dd/MM", { locale: ptBR })}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Status: RECEBIDO, PROGRAMADO, EM ROTA
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {diasSemana.map((dia) => {
              const solsDia = getSemana(dia);
              const diaSemana = format(dia, "EEE", { locale: ptBR }).toUpperCase();
              const diaNumero = format(dia, "dd");
              return (
                <div
                  key={dia.toString()}
                  className="bg-white rounded-lg border border-gray-200 overflow-visible"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 text-center">
                    <p className="text-xs font-semibold">{diaSemana}</p>
                    <p className="text-2xl font-bold">{diaNumero}</p>
                  </div>
                  {/* sem limite: mostra TODOS os cards do dia */}
                  <div className="p-3 space-y-2">
                    {solsDia.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        Sem transportes
                      </p>
                    ) : (
                      solsDia.map((sol) => (
                        <div
                          key={sol.id}
                          className="bg-gray-50 rounded-lg p-2 border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* todos os chassis, sem truncate, em badges */}
                              <div className="flex flex-wrap gap-1">
                                {(sol.chassi_lista && sol.chassi_lista.length
                                  ? sol.chassi_lista
                                  : ["SEM CHASSI"]
                                ).map((c, i) => (
                                  <Badge
                                    key={i}
                                    className="text-[10px] px-1.5 py-0 font-mono"
                                  >
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-600 mt-1 break-words">
                                {sol.nota}
                              </p>
                            </div>
                            {sol.loc && (
                              <a
                                href={sol.loc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                                title="Abrir no mapa"
                              >
                                <MapPin className="w-3 h-3 text-blue-600" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* MÊS ATUAL */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-xl font-bold text-gray-900">
            Mês Atual - {format(hoje, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <p className="text-sm text-gray-600">Status: CONCLUÍDO</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((lab) => (
              <div
                key={lab}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {lab}
              </div>
            ))}
            {diasMes.map((dia) => {
              const solsDia = getMes(dia);
              const hojeKey = localKey(hoje);
              const isHoje = localKey(dia) === hojeKey;
              return (
                <div
                  key={dia.toString()}
                  className={`min-h-[80px] rounded-lg border ${
                    isHoje ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      isHoje ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {format(dia, "d")}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-auto pr-1">
                    {solsDia.map((sol) => (
                      <div
                        key={sol.id}
                        className="bg-green-100 rounded px-1 py-0.5"
                        title={sol.nota}
                      >
                        <p className="text-[9px] font-semibold text-green-800">
                          {(
                            sol.chassi_lista && sol.chassi_lista.length
                              ? sol.chassi_lista
                              : ["SEM CHASSI"]
                          ).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
