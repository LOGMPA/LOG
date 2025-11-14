// src/hooks/useLogisticaBase.js

// Alias de compatibilidade: reaproveita o hook oficial useSolicitacoes
import { useSolicitacoes } from "./useSolicitacoes";

export function useLogisticaBase() {
  const query = useSolicitacoes();

  return {
    // compat com o jeito antigo
    linhas: query.data ?? [],
    loading: query.isLoading,
    erro: query.error ?? null,

    // expõe tudo também, se quiser usar igual react-query
    ...query,
  };
}
