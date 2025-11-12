import React, { useState } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import FiltrosTransporte from "../components/logistica/FiltrosTransporte";

export default function SolicitacoesTransporte() {
  const [filtros, setFiltros] = useState({ chassi: "", cliente: "", solicitante: "", dataInicio: "", dataFim: "", status: "all" });
  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (s.status === "CONCLUIDO" || String(s.status).includes("(D)")) return false;
    if (filtros.chassi && !s.chassi_lista?.some(c => c.toLowerCase().includes(filtros.chassi.toLowerCase()))) return false;
    if (filtros.cliente && !String(s.nota || "").toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
    if (filtros.solicitante && !String(s.solicitante || "").toLowerCase().includes(filtros.solicitante.toLowerCase())) return false;
    if (filtros.dataInicio) {
      const dp = new Date(s.previsao); const di = new Date(filtros.dataInicio);
      if (dp < di) return false;
    }
    if (filtros.dataFim) {
      const dp = new Date(s.previsao); const df = new Date(filtros.dataFim);
      if (dp > df) return false;
    }
    if (filtros.status !== "all" && s.status !== filtros.status) return false;
    return true;
  });

  const statusColors = {
    "RECEBIDO": "bg-gray-100 text-gray-800",
    "PROGRAMADO": "bg-blue-100 text-blue-800",
    "EM ROTA": "bg-amber-100 text-amber-800",
    "SUSPENSO": "bg-red-100 text-red-800"
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Solicitações de Transporte</h1>
      </div>
      <p className="text-gray-600">Visualize e pesquise todas as solicitações de transporte</p>

      <FiltrosTransporte filtros={filtros} onFiltrosChange={setFiltros} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
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
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">Nenhuma solicitação encontrada</TableCell></TableRow>
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
                    <TableCell><span className={`${statusColors[sol.status]} text-[10px] rounded px-1 py-0.5 border`}>{sol.status}</span></TableCell>
                    <TableCell>
                      {sol.loc ? <a href={sol.loc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"><MapPin className="w-4 h-4" /></a> : <span className="text-gray-300">-</span>}
                    </TableCell>
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
