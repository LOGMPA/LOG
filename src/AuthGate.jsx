import React, { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const PASS_HASH = "c25843621ae06bd4c3ca85707dae016e46f947efb83fef1c098e0221e21003cf"; // sha256("MPA")

async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function AuthGate({ children }) {
  const [ok, setOk] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const flag = localStorage.getItem("auth_v1");
    if (flag === PASS_HASH) setOk(true);
  }, []);

  async function handleEnter(e) {
    e.preventDefault();
    const h = await sha256(pwd);
    if (h === PASS_HASH) {
      localStorage.setItem("auth_v1", PASS_HASH);
      setOk(true);
    } else {
      setErr("Senha inválida.");
    }
  }

  if (ok) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-4">
      <form onSubmit={handleEnter} className="bg-white w-full max-w-sm rounded-xl border border-gray-200 shadow p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Acesso restrito</h1>
          <p className="text-sm text-gray-600">Digite a senha para acessar.</p>
        </div>
        <Input placeholder="Senha" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" className="w-full">Entrar</Button>
        <p className="text-[10px] text-gray-500 text-center">Dica: a senha padrão é definida no código (hash SHA-256).</p>
      </form>
    </div>
  );
}
