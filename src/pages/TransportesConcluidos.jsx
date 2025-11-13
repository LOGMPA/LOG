import React, { useState, useMemo } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import FiltrosTransporte from "../components/logistica/FiltrosTransporte";

export default function TransportesConcluidos() {
  // agora sem datas pré-preenchidas
  const [filtros, setFiltros] = useState({
    chassi: "",
    cliente: "",
    solicitante: "",
    dataInicio: "",   // vazio
    dataFim: "",      // vazio
    status: "all",
  });

  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  // sempre usa PREV; mostra só concluídos; ordena do mais novo pro mais antigo
  const solicitacoesFiltradas = useMemo(() => {
    const out = solicitacoes.filter((s) => {
      if (!s._status_up?.includes("CONCL")) return false; // só concluídos

      if (filtros.chassi && !s.chassi_lista?.some(c => c.toLowerCase().includes(filtros.chassi.toLowerCase()))) return false;
      if (filtros.cliente && !String(s.nota || "").toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
      if (filtros.solicitante && !String(s.solicitante || "").toLowerCase().includes(filtros.solicitante.toLowerCase())) return false;

      const d = s._previsao_date ? new Date(s._previsao_date) : null;
      if (!d) return false;

      if (filtros.dataInicio) {
        const di = new Date(filtros.dataInicio);
        if (d < di) return false;
      }
      if (filtros.dataFim) {
        const df = new Date(filtros.dataFim);
        if (d > df) return false;
      }

      if (filtros.status !== "all" && filtros.status.toUpperCase() !== "CONCLUIDO") return false;

      return true;
    });

    // mais novo → mais antigo por PREV
    out.sort((a, b) => (b._previsao_date?.getTime() || 0) - (a._previsao_date?.getTime() || 0));
    return out;
  }, [solicitacoes, filtros]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Transportes Concluídos</h1>
      </div>
      <p className="text-gray-600">Histórico de transportes finalizados</p>

      {/* usa o mesmo componente de filtros; os campos de data começam vazios */}
      <FiltrosTransporte filtros={filtros} onFiltrosChange={setFiltros} showStatusFilter={true} />

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
                    <TableCell className="text-[10px]">
                      {sol.previsao_br || (sol.previsao ? format(new Date(sol.previsao), "dd/MM/yy", { locale: ptBR }) : "-")}
                    </TableCell>
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
                    <TableCell>
                      {sol.loc ? (
                        <a href={sol.loc} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800" title="Abrir no mapa">
                          <MapPin className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
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
