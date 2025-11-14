import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import AuthGate from "./AuthGate";
import PainelLogistica from "./pages/PainelLogistica";
import Calendario from "./pages/Calendario";
import SolicitacoesTransporte from "./pages/SolicitacoesTransporte";
import TransportesConcluidos from "./pages/TransportesConcluidos";
import Demonstracoes from "./pages/Demonstracoes";

export default function App() {
  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="/painel" element={<PainelLogistica />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/solicitacoes" element={<SolicitacoesTransporte />} />
          <Route path="/concluidos" element={<TransportesConcluidos />} />
          <Route path="/demos" element={<Demonstracoes />} />
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </Layout>
    </AuthGate>
  );
}
