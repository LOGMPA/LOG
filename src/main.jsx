import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Painel from './pages/PainelLogistica.jsx'
import PasswordGate from './components/PasswordGate.jsx'
import Calendario from './pages/Calendario.jsx'
import Solicitacoes from './pages/SolicitacoesTransporte.jsx'
import Concluidos from './pages/TransportesConcluidos.jsx'
import Demos from './pages/Demonstracoes.jsx'

function Sidebar() {
  const nav = [
    { to: '/', label: 'Painel Logística 2026' },
    { to: '/calendario', label: 'Calendário' },
    { to: '/solicitacoes', label: 'Solicitações de Transporte' },
    { to: '/concluidos', label: 'Transportes Concluídos' },
    { to: '/demos', label: 'Demonstrações' },
  ]
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">LG</div>
        <div>
          <div style={{fontWeight:800}}>Logística</div>
          <div className="tiny muted">Sistema 2026</div>
        </div>
      </div>
      <nav className="nav">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} className={({isActive}) => isActive?'active':''}>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Painel />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/concluidos" element={<Concluidos />} />
            <Route path="/demos" element={<Demos />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <PasswordGate><App /></PasswordGate>
)
