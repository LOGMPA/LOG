// src/components/auth/CustosGuard.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { LockKeyhole } from "lucide-react";
import { useCustosAuth } from "@/hooks/useCustosAuth.js";

export default function CustosGuard({ children }) {
  const { autorizado, validarSenha } = useCustosAuth();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  if (autorizado) {
    return children;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = validarSenha(senha);
    if (!ok) {
      setErro("Senha inválida.");
    } else {
      setErro("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-6">
      <Card className="max-w-md w-full shadow-lg border-amber-100">
        <CardHeader className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200">
            <LockKeyhole className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl font-extrabold text-slate-900">
            Acesso restrito · Custos
          </CardTitle>
          <p className="text-sm text-slate-600">
            Área exclusiva de <b>Operações</b>. Informe a senha para visualizar o
            Painel de Custos.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Senha de acesso
              </label>

              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
                className="text-sm"
              />

              {erro && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  {erro}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Entrar
            </Button>

            <p className="text-[11px] text-slate-500 text-center mt-1">
              A senha será pedida novamente apenas quando a página for recarregada.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
