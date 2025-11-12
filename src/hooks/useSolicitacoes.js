import { useQuery } from "@tanstack/react-query";
import { loadSolicitacoesFromExcel } from "../api/excelClient";

export function useSolicitacoes() {
  return useQuery({
    queryKey: ["solicitacoes"],
    queryFn: () => loadSolicitacoesFromExcel(),
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });
}
