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
        // joga erro pra UI e loga legível
        console.error("[useSolicitacoes] Erro ao carregar:", e);
        throw new Error("Não foi possível ler solicitacoes. Verifique se 'public/data/solicitacoes.xlsx' ou 'public/data/solicitacoes.json' existem e estão acessíveis.");
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
