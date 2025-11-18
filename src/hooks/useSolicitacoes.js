// src/hooks/useSolicitacoes.js
import { useQuery } from "@tanstack/react-query";
import { loadSolicitacoesFromExcel } from "../api/excelClient";

export function useSolicitacoes() {
  return useQuery({
    queryKey: ["solicitacoes"],
    queryFn: async () => {
      try {
        const data = await loadSolicitacoesFromExcel();
        return data;
      } catch (e) {
        console.error("[useSolicitacoes] Erro ao carregar:", e);
        throw new Error(
          "Não foi possível ler as solicitações a partir do BASE.xlsx."
        );
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
