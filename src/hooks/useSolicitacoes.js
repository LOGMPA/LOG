// src/hooks/useSolicitacoes.js
import { useQuery } from "@tanstack/react-query";
import { loadSolicitacoesFromExcel } from "../api/excelClient";

/**
 * Lê Excel, retorna já pré-processado (datas BR, chaves yyyy-MM-dd, status normalizado, cidades canônicas).
 * Performance:
 * - staleTime alto evita refetch
 * - select direto do loader (sem transformar de novo)
 */
export function useSolicitacoes() {
  return useQuery({
    queryKey: ["solicitacoes"],
    queryFn: loadSolicitacoesFromExcel,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    // nada de "select" pesado aqui; o excelClient já entrega pronto
  });
}
