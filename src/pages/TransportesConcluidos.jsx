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
    status: "all", // mantemos o seletor de status sem travar no CONCLUIDO
  });

  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  // Helper: data principal para ordenação/exibição (prioriza REAL para concluídos)
  const dataChave = (s) => new Date(s.real || s.previsao);

  // Filtra somente concluídos (com e sem "(D)"), aplica filtros e ordena do mais novo para o mais antigo
  const solicitacoesFiltradas = solicitacoes
    .filter((s) => {
      const status = String(s.status || "").toUpperCase();

      // manter apenas concluídos (CONCLUIDO e CONCLUIDO (D))
      if (!status.includes("CONCL")) return false;

      // filtros de texto
      if (filtros.chassi && !s.chassi_lista?.some((c) => c.toLowerCase().includes(filtros.chassi.toLowerCase())))
        return false;
      if (filtros.cliente && !String(s.nota || "").toLowerCase().includes(filtros.cliente.toLowerCase()))
        return false;
      if (filtros.solicitante && !String(s.solicitante || "").toLowerCase().includes(filtros.solicitante.toLowerCase()))
        return false;

      // datas: usa dataChave (real || previsao)
      const d = s.real || s.previsao ? dataChave(s) : null;
      if (!d) return false;

      if (filtros.dataInicio) {
        const di = new Date(filtros.dataInicio);
        if (d < di) return false;
      }
      if (filtros.dataFim) {
        const df = new Date(filtros.dataFim);
        if (d > df) return false;
      }

      // filtro de status (selecao opcional do usuário)
      if (filtros.status !== "all") {
        const filtroUp = String(filtros.status).toUpperCase();
        // aceita tanto "CONCLUIDO" quanto "CONCLUIDO (D)" quando o filtro for CONCLUIDO
        if (filtroUp === "CONCLUIDO") {
          if (!status.includes("CONCL")) return false;
        } else {
          // se algum dia adicionar outra opção, compara por igualdade
          if (status !== filtroUp) return false;
        }
      }

      return true;
    })
    // ORDEM: mais novo -> mais antigo
    .sort((a, b) => dataChave(b) - dataChave(a));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Transportes Concluídos</h1>
      </div>
      <p className="text-gray-600">Histórico de transportes finalizados</p>

      {/* Mesmos filtros da tela de Solicitações */}
      <FiltrosTransporte filtros={filtros} onFiltrosChange={setFiltros} showStatusFilter={true} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50">
                <TableHead className="text-[10px] font-semibold">DATA</TableHead>
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
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : solicitacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhum transporte concluído encontrado
                  </TableCell>
                </TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => (
                  <TableRow key={sol.id} className="hover:bg-gray-50">
                    <TableCell className="text-[10px]">
                      {sol.real || sol.previsao
                        ? format(new Date(sol.real || sol.previsao), "dd/MM/yy", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-[10px]">{sol.solicitante}</TableCell>
                    <TableCell className="text-[10px]">{sol.nota}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">{sol.chassi_lista?.[0] || "SEM CHASSI"}</span>
                        {sol.chassi_lista?.length > 1 && (
                          <span className="text-[9px] px-1 py-0 bg-gray-100 rounded">
                            +{sol.chassi_lista.length - 1}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px]">{sol.esta}</TableCell>
                    <TableCell className="text-[10px]">{sol.vai}</TableCell>
                    <TableCell className="text-[10px]">{sol.frete}</TableCell>
                    <TableCell>
                      <span className="bg-green-100 text-green-800 text-[10px] rounded px-1 py-0.5 border">
                        {sol.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sol.loc ? (
                        <a
                          href={sol.loc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          title="Abrir no mapa"
                        >
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
