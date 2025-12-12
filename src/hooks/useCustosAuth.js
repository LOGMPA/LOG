// src/hooks/useCustosAuth.js
import { useState } from "react";

const STORAGE_KEY = "logistica_custos_auth"; // sessionStorage

export function useCustosAuth() {
  const [autorizado, setAutorizado] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "ok";
  });

  const validarSenha = (senha) => {
    const limpa = String(senha || "").trim().toUpperCase();
    if (limpa === "MCM") {
      sessionStorage.setItem(STORAGE_KEY, "ok");
      setAutorizado(true);
      return true;
    }
    return false;
  };

  const reset = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAutorizado(false);
  };

  return { autorizado, validarSenha, reset };
}
