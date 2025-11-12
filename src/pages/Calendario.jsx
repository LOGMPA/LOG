import React from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "../components/ui/badge";

export default function Calendario() {
  const hoje = new Date();
  const segundaFeira = startOfWeek(hoje, { weekStartsOn: 1 });
  const sabado = addDays(segundaFeira, 5);
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const { data: solicitacoes = [] } = useSolicitacoes();

  const solicitacoesSemana = solicitacoes.filter(s => {
    if (String(s.status).includes("(D)")) return false;
    if (!["RECEBIDO", "PROGRAMADO", "EM ROTA"].includes(s.status)) return false;
    const data = new Date(s.previsao);
    return data >= segundaFeira && data <= sabado;
  }).sort((a, b) => new Date(a.previsao) - new Date(b.previsao));

  const solicitacoesMes = solicitacoes.filter(s => {
    if (s.status !== "CONCLUIDO") return false;
    const data = new Date(s.previsao);
    return data >= inicioMes && data <= fimMes;
  }).sort((a, b) => new Date(a.previsao) - new Date(b.previsao));

  const diasSemana = eachDayOfInterval({ start: segundaFeira, end: sabado });
  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  const getSolicitacoesDoDia = (dia, lista) => lista.filter(s => isSameDay(new Date(s.previsao), dia));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <CalendarIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
      </div>
      <p className="text-gray-600">Visão semanal e mensal de transportes</p>

      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl font-bold text-gray-900">
            Semana Atual - {format(segundaFeira, "dd/MM", { locale: ptBR })} a {format(sabado, "dd/MM", { locale: ptBR })}
          </CardTitle>
          <p className="text-sm text-gray-600">Status: RECEBIDO, PROGRAMADO, EM ROTA</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {diasSemana.map((dia) => {
              const solsDia = getSolicitacoesDoDia(dia, solicitacoesSemana);
              const diaSemana = format(dia, "EEE", { locale: ptBR }).toUpperCase();
              const diaNumero = format(dia, "dd");
              return (
                <div key={dia.toString()} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 text-center">
                    <p className="text-xs font-semibold">{diaSemana}</p>
                    <p className="text-2xl font-bold">{diaNumero}</p>
                  </div>
                  <div className="p-3 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {solsDia.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">Sem transportes</p> :
                      solsDia.map((sol) => (
                        <div key={sol.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{(sol.chassi_lista && sol.chassi_lista.length ? sol.chassi_lista : ["SEM CHASSI"]).join(", ")}</p>
                              {sol.chassi_lista?.length > 1 && <Badge className="text-[9px] px-1 py-0 mt-1">+{sol.chassi_lista.length - 1}</Badge>}
                              <p className="text-[10px] text-gray-600 mt-1 truncate">{sol.nota}</p>
                            </div>
                            {sol.loc && (
                              <a href={sol.loc} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                <MapPin className="w-3 h-3 text-blue-600" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-xl font-bold text-gray-900">Mês Atual - {format(hoje, "MMMM yyyy", { locale: ptBR })}</CardTitle>
          <p className="text-sm text-gray-600">Status: CONCLUÍDO</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((dia) => (
              <div key={dia} className="text-center text-xs font-semibold text-gray-600 py-2">{dia}</div>
            ))}
            {diasMes.map((dia) => {
              const solsDia = getSolicitacoesDoDia(dia, solicitacoesMes);
              const isHoje = isSameDay(dia, hoje);
              return (
                <div key={dia.toString()} className={`min-h-[80px] rounded-lg border ${isHoje ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
                  <p className={`text-xs font-semibold mb-1 ${isHoje ? "text-blue-600" : "text-gray-700"}`}>{format(dia, "d")}</p>
                  <div className="space-y-1 max-h-32 overflow-auto pr-1">
                    {solsDia.map((sol) => (
                      <div key={sol.id} className="bg-green-100 rounded px-1 py-0.5" title={sol.nota}>
                        <p className="text-[9px] font-semibold text-green-800 truncate">{(sol.chassi_lista && sol.chassi_lista.length ? sol.chassi_lista : ["SEM CHASSI"]).join(", ")}</p>
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
