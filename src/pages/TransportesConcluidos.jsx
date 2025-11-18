import React, { useState, useMemo } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import FiltrosTransporte from "../components/logistica/FiltrosTransporte";
import { Card, CardContent } from "../components/ui/card";

/** Acha qualquer link (https://...) em loc, esta ou vai */
const getLinkUrl = (sol) => {
  if (sol.loc && String(sol.loc).includes("http")) return sol.loc;

  const fontes = [sol.esta, sol.vai];
  for (const fonte of fontes) {
    if (!fonte) continue;
    const match = String(fonte).match(/https?:\/\/\S+/);
    if (match) return match[0];
  }
  return null;
};

export default function TransportesConcluidos() {
  // datas começam vazias
  const [filtros, setFiltros] = useState({
    chassi: "",
    cliente: "",
    solicitante: "",
    dataInicio: "",
    dataFim: "",
    status: "all",
  });

  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  // sempre usa PREV; mostra só concluídos; ordena do mais novo pro mais antigo
  const solicitacoesFiltradas = useMemo(() => {
    const out = solicitacoes.filter((s) => {
      // só concluídos (CONCL nos status up)
      if (!s._status_up?.includes("CONCL")) return false;

      if (
        filtros.chassi &&
        !s.chassi_lista?.some((c) =>
          c.toLowerCase().includes(filtros.chassi.toLowerCase())
        )
      )
        return false;

      if (
        filtros.cliente &&
        !String(s.nota || "")
          .toLowerCase()
          .includes(filtros.cliente.toLowerCase())
      )
        return false;

      if (
        filtros.solicitante &&
        !String(s.solicitante || "")
          .toLowerCase()
          .includes(filtros.solicitante.toLowerCase())
      )
        return false;

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

      // aqui, se um dia você quiser filtrar por outro status de concluído, mexe nessa parte
      if (filtros.status !== "all" && filtros.status.toUpperCase() !== "CONCLUIDO")
        return false;

      return true;
    });

    // mais novo → mais antigo por PREV
    out.sort(
      (a, b) =>
        (b._previsao_date?.getTime() || 0) -
        (a._previsao_date?.getTime() || 0)
    );
    return out;
  }, [solicitacoes, filtros]);

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Banner/cabeçalho no estilo do resto do sistema */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            className="px-4 py-2"
            style={{
              background:
                "linear-gradient(90deg, #14532D 0%, #86EFAC 35%, #FDE68A 75%, #F9FAFB 100%)",
            }}
          >
            <div className="w-full max-w-2xl bg-white/95 rounded-xl shadow-md px-3 py-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-extrabold text-slate-900">
                  Transportes Concluídos
                </span>
                <span className="text-sm md:text-base text-slate-600">
                  Histórico de transportes finalizados.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros (mesmo componente e tamanho dos outros) */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-emerald-50 to-white">
            <div className="bg-white rounded-lg shadow-sm px-3 py-2 md:px-4 md:py-2">
              <FiltrosTransporte
                filtros={filtros}
                onFiltrosChange={setFiltros}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-100">
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  PREVISÃO
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  SOLICITANTE
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  CLIENTE/NOTA
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  CHASSI
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  ESTÁ EM
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  VAI PARA
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  TRANSPORTE
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  STATUS
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-emerald-900">
                  LOC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : solicitacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    Nenhum transporte concluído encontrado
                  </TableCell>
                </TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => {
                  const linkUrl = getLinkUrl(sol);

                  return (
                    <TableRow key={sol.id} className="hover:bg-gray-50">
                      <TableCell className="text-[10px]">
                        {sol.previsao_br ||
                          (sol.previsao
                            ? format(new Date(sol.previsao), "dd/MM/yy", {
                                locale: ptBR,
                              })
                            : "-")}
                      </TableCell>
                      <TableCell className="text-[10px]">
                        {sol.solicitante}
                      </TableCell>
                      <TableCell className="text-[10px]">
                        {sol.nota}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">
                            {sol.chassi_lista?.[0] || "SEM CHASSI"}
                          </span>
                          {sol.chassi_lista?.length > 1 && (
                            <span className="text-[9px] px-1 py-0 bg-gray-100 rounded">
                              +{sol.chassi_lista.length - 1}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px]">{sol.esta}</TableCell>
                      <TableCell className="text-[10px]">{sol.vai}</TableCell>
                      <TableCell className="text-[10px]">
                        {sol.frete}
                      </TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 text-[10px] rounded px-1 py-0.5 border">
                          {sol.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {linkUrl ? (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center"
                            title="Abrir localização"
                          >
                            <MapPin className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
