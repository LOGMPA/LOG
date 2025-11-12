import React, { useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Presentation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";

export default function Demonstracoes() {
  const [mesAno, setMesAno] = useState(format(new Date(), "yyyy-MM"));
  const { data: solicitacoes = [] } = useSolicitacoes();

  const [ano, mes] = mesAno.split("-").map(Number);
  const dataAtual = new Date(ano, mes - 1, 1);
  const inicioMes = startOfMonth(dataAtual);
  const fimMes = endOfMonth(dataAtual);
  const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  const demonstracoes = solicitacoes.filter(s => {
    if (!String(s.status).includes("(D)")) return false;
    const data = new Date(s.previsao);
    return data >= inicioMes && data <= fimMes;
  });

  const getSolicitacoesDoDia = (dia) => demonstracoes.filter(s => isSameDay(new Date(s.previsao), dia));

  const statusColors = {
    "RECEBIDO (D)": "bg-purple-100 text-purple-800 border-purple-200",
    "PROGRAMADO (D)": "bg-blue-100 text-blue-800 border-blue-200",
    "CONCLUIDO (D)": "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Presentation className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Demonstrações</h1>
      </div>
      <p className="text-gray-600">Calendário de demonstrações de equipamentos</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="mesAno" className="text-sm font-semibold text-gray-700">Selecionar Mês:</Label>
          <input id="mesAno" type="month" value={mesAno} onChange={(e) => setMesAno(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="text-xl font-bold text-gray-900">{format(dataAtual, "MMMM yyyy", { locale: ptBR })}</CardTitle>
          <p className="text-sm text-gray-600">Total de demonstrações: {demonstracoes.length}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((dia) => (
              <div key={dia} className="text-center text-xs font-semibold text-gray-600 py-2">{dia}</div>
            ))}
            {diasMes.map((dia) => {
              const solsDia = getSolicitacoesDoDia(dia);
              const isHoje = isSameDay(dia, new Date());
              return (
                <div key={dia.toString()} className={`min-h-[120px] p-2 rounded-lg border ${isHoje ? "bg-purple-50 border-purple-300" : "bg-white border-gray-200"}`}>
                  <p className={`text-xs font-semibold mb-2 ${isHoje ? "text-purple-600" : "text-gray-700"}`}>{format(dia, "d")}</p>
                  <div className="space-y-1.5">
                    {solsDia.map((sol) => (
                      <div key={sol.id} className={`rounded-lg p-2 border ${statusColors[sol.status] || "bg-gray-100 text-gray-800 border-gray-200"}`} title={`${sol.chassi_lista?.[0] || "SEM CHASSI"} - ${sol.nota}`}>
                        <p className="text-[9px] font-bold truncate">{sol.chassi_lista?.[0] || "SEM CHASSI"}</p>
                        <p className="text-[9px] truncate mt-0.5">{sol.nota}</p>
                        <span className="text-[8px] px-1 py-0 mt-1 inline-block bg-white rounded border">{String(sol.status).replace(" (D)", "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Legenda de Status</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div><span className="text-sm text-gray-700">RECEBIDO (D)</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div><span className="text-sm text-gray-700">PROGRAMADO (D)</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div><span className="text-sm text-gray-700">CONCLUÍDO (D)</span></div>
        </div>
      </div>
    </div>
  );
}
