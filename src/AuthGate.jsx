import { useEffect, useState } from "react";
import logisticaLogo from "./assets/ICONLOG.jpg"; // arquivo em: src/assets/ICONLOG.jpg

// 
const PASS_HASH = "c25843621ae06bd4c3ca85707dae016e46f947efb83fef1c098e0221e21003cf";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export default function AuthGate({ children }) {
  const [input, setInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("log-auth");
    if (stored === "ok") {
      setIsAuthed(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = input.trim();
    if (!value) {
      setError("Digite a senha.");
      return;
    }

    try {
      const hash = await sha256(value);
      if (hash === PASS_HASH) {
        setIsAuthed(true);
        localStorage.setItem("log-auth", "ok");
      } else {
        setError("Senha incorreta.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao validar senha.");
    }
  };

  if (isAuthed) return children;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <div className="flex flex-col items-center">
        {/* LOGO REDONDA GRANDE */}
        <div className="w-40 h-40 mb-4 rounded-full overflow-hidden shadow-lg border-4 border-white bg-white">
          <img
            src={logisticaLogo}
            alt="Logística MacPonta Agro"
            className="w-full h-full object-cover"
          />
        </div>

        {/* CARD DE LOGIN */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            Acesso restrito
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Digite a senha para acessar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Senha
              </label>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#3C6F1F]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-md px-4 py-2 text-sm font-semibold text-white
                         bg-[#3C6F1F] hover:bg-[#335a19]
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3C6F1F]
                         transition"
            >
              Entrar
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Logística 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
