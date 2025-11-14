import React, { useState, useMemo } from "react";
import { useSolicitacoes } from "../hooks/useSolicitacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, MapPin } from "lucide-react";
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

/** Verifica se é transferência entre lojas (ESTÁ EM e VAI PARA contém MPA, sem link) */
const isTransferMPA = (sol) => {
  const esta = String(sol.esta || "").trim().toUpperCase();
  const vai = String(sol.vai || "").trim().toUpperCase();
  if (!esta || !vai) return false;
  return esta.includes("MPA") && vai.includes("MPA");
};

export default function SolicitacoesTransporte() {
  const [filtros, setFiltros] = useState({
    chassi: "",
    cliente: "",
    solicitante: "",
    dataInicio: "",
    dataFim: "",
    status: "all",
  });

  const { data: solicitacoes = [], isLoading } = useSolicitacoes();

  const allowed = new Set(["RECEBIDO", "PROGRAMADO", "EM ROTA", "SUSPENSO"]);

  const solicitacoesFiltradas = useMemo(() => {
    const out = solicitacoes.filter((s) => {
      if (s._status_base === "CONCLUIDO") return false;
      if (!allowed.has(s._status_base)) return false;

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

      if (filtros.status !== "all") {
        if (String(s.status) !== filtros.status) return false;
      }

      return true;
    });

    // ordena: mais antigo -> mais novo, SUSPENSO por último
    out.sort((a, b) => {
      const aSusp = a._status_base === "SUSPENSO" ? 1 : 0;
      const bSusp = b._status_base === "SUSPENSO" ? 1 : 0;
      if (aSusp !== bSusp) return aSusp - bSusp;
      const ta = a._previsao_date?.getTime() || 0;
      const tb = b._previsao_date?.getTime() || 0;
      return ta - tb;
    });

    return out;
  }, [solicitacoes, filtros]);

  const statusColors = {
    RECEBIDO: "bg-gray-100 text-gray-800",
    "RECEBIDO (D)": "bg-gray-100 text-gray-800",
    PROGRAMADO: "bg-blue-100 text-blue-800",
    "PROGRAMADO (D)": "bg-blue-100 text-blue-800",
    "EM ROTA": "bg-amber-100 text-amber-800",
    SUSPENSO: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Banner/cabeçalho - pôr do sol azul */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div
            className="px-4 py-2"
            style={{
              background:
                // azul profundo → azul claro → laranja pôr do sol → amarelo bem suave
                "linear-gradient(90deg, #0F172A 0%, #1D4ED8 25%, #38BDF8 55%, #FDBA74 80%, #FEF9C3 100%)",
            }}
          >
            <div className="w-full max-w-2xl bg-white/95 rounded-xl shadow-md px-3 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-extrabold text-slate-900">
                  Solicitações de Transporte
                </span>
                <span className="text-sm md:text-base text-slate-600">
                  Visualize e pesquise todas as solicitações de transporte.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros - azul clarinho com toque de pôr do sol bem de leve */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div
            className="px-3 py-1.5"
            style={{
              background:
                // azul bem claro → quase branco → bege/creme suave
                "linear-gradient(90deg, #E0F2FE 0%, #EFF6FF 45%, #FFF7ED 100%)",
            }}
          >
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
              <TableRow className="bg-blue-100">
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  PREVISÃO
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  SOLICITANTE
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  CLIENTE/NOTA
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  CHASSI
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  ESTÁ EM
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  VAI PARA
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  TRANSPORTE
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
                  STATUS
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-blue-900">
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
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                solicitacoesFiltradas.map((sol) => {
                  const linkUrl = getLinkUrl(sol);
                  const isTransfer = !linkUrl && isTransferMPA(sol);

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
                        <span
                          className={`${
                            statusColors[sol.status] ||
                            "bg-gray-100 text-gray-800"
                          } text-[10px] rounded px-1 py-0.5 border`}
                        >
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
                        ) : isTransfer ? (
                          <span
                            className="text-base leading-none"
                            title="Transferência entre lojas (MPA → MPA)"
                          >
                            🔄️
                          </span>
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
