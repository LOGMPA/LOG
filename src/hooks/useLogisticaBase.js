// src/hooks/useLogisticaBase.js
import { useEffect, useState } from "react";

// LINK DO BASE.xlsx SERVIDO PELO GITHUB PAGES
const EXCEL_URL =
  "https://logmpa.github.io/LOG/data/BASE.xlsx";

// Nome exato da guia que vamos ler dentro do BASE.xlsx
const SHEET_NAME = "FRETE MÁQUINAS";

export function useLogisticaBase() {
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const resp = await fetch(EXCEL_URL, { cache: "no-store" });
        if (!resp.ok) {
          throw new Error(
            `Falha ao buscar BASE.xlsx (${resp.status}).`
          );
        }

        const buf = await resp.arrayBuffer();

        // usa XLSX global se existir (só pra debug)
        const XLSXlib = window.XLSX;
        if (!XLSXlib) {
          throw new Error(
            "window.XLSX não está disponível. Esse hook é só pra debug local."
          );
        }

        const wb = XLSXlib.read(buf, {
          type: "array",
          cellDates: true,
          dense: true,
        });

        const ws = wb.Sheets[SHEET_NAME] || wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          throw new Error(
            `Guia "${SHEET_NAME}" não encontrada no BASE.xlsx.`
          );
        }

        const rows = XLSXlib.utils.sheet_to_json(ws, {
          defval: "",
          raw: true,
        });

        if (!cancelado) {
          setLinhas(rows);
        }
      } catch (e) {
        console.error("[useLogisticaBase]", e);
        if (!cancelado) setErro(e);
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    load();

    return () => {
      cancelado = true;
    };
  }, []);

  return { linhas, loading, erro };
}
