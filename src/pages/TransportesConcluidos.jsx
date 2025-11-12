import React, { useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import FiltrosTransporte from "../components/logistica/FiltrosTransporte";

export default function TransportesConcluidos() {
  const hoje = new Date();
  const [filtros, setFiltros] = useState({
    chassi: "",
    cliente: "",
    solicitante: "",
    dataInicio: format(startOfMonth(hoje), "yyyy-MM-dd"),
    dataFim: format(endOfMonth(hoje), "yyyy-MM-dd"),
    status: "CONCLUIDO",
  });
  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (!String(s.status).toUpperCase().includes("CONCL")) return false;
    if (filtros.status && filtros.status !== "all" && s.status !== filtros.status) return false;
    if (filtros.chassi && !s.chassi_lista?.some(c => c.toLowerCase().includes(filtros.chassi.toLowerCase()))) return false;
    if (filtros.cliente && !String(s.nota || "").toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
    if (filtros.solicitante && !String(s.solicitante || "").toLowerCase().includes(filtros.solicitante.toLowerCase())) return false;
    const d = s.real ? new Date(s.real) : (s.previsao ? new Date(s.previsao) : null);
    if (!d) return false;
    if (filtros.dataInicio && d < new Date(filtros.dataInicio)) return false;
    if (filtros.dataFim && d > new Date(filtros.dataFim)) return false;
    return true;
  });
      if (dp < di) return false;
    }
    if (filtros.dataFim) {
      const dp = new Date(s.previsao); const df = new Date(filtros.dataFim);
      if (dp > df) return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Transportes Concluídos</h1>
      </div>
      <p className="text-gray-600">Histórico de transportes finalizados</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50">
                <TableHead className="text-[10px] font-semibold">PREVISÃO</TableHead>
                <TableHead className="text-[10px] font-semibold">SOLICITANTE</TableHead>
                <TableHead className="text-[10px] font-semibold">CLIENTE/NOTA</TableHead>
                <TableHead className="text-[10px] font-semibold">CHASSI</TableHead>
                <TableHead className="text-[10px] font-semibold">ESTÁ EM</TableHead>
                <TableHead className="text-[10px] font-semibold">VAI PARA</TableHead>
                <TableHead className="text-[10px] font-semibold">TRANSPORTE</TableHead>
                <TableHead className="text-[10px] font-semibold">STATUS</TableHead>
                <TableHead className="text-[10px] font-semibold">LOC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">Carregando...</TableCell></TableRow>
              ) : solicitacoesFiltradas.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">Nenhum transporte concluído encontrado</TableCell></TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => (
                  <TableRow key={sol.id} className="hover:bg-gray-50">
                    <TableCell className="text-[10px]">{sol.previsao ? format(new Date(sol.previsao), "dd/MM/yy", { locale: ptBR }) : "-"}</TableCell>
                    <TableCell className="text-[10px]">{sol.solicitante}</TableCell>
                    <TableCell className="text-[10px]">{sol.nota}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">{sol.chassi_lista?.[0] || "SEM CHASSI"}</span>
                        {sol.chassi_lista?.length > 1 && <span className="text-[9px] px-1 py-0 bg-gray-100 rounded">+{sol.chassi_lista.length - 1}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px]">{sol.esta}</TableCell>
                    <TableCell className="text-[10px]">{sol.vai}</TableCell>
                    <TableCell className="text-[10px]">{sol.frete}</TableCell>
                    <TableCell><span className="bg-green-100 text-green-800 text-[10px] rounded px-1 py-0.5 border">{sol.status}</span></TableCell>
                    <TableCell>{sol.loc ? <a href={sol.loc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><span className="sr-only">Link</span></a> : <span className="text-gray-300">-</span>}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
