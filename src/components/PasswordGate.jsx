import React, { useState } from 'react'

export default function PasswordGate({ children }){
  const [ok, setOk] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const check = (e)=>{
    e.preventDefault()
    if(pw === 'MPA'){ setOk(true); setErr('') }
    else { setErr('Senha incorreta'); }
  }
  if(ok) return children
  return (
    <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'#0f172a'}}>
      <form onSubmit={check} style={{width:360, background:'#ffffff', borderRadius:12, padding:20, boxShadow:'0 8px 30px rgba(0,0,0,.25)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
          <div style={{width:42,height:42,borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#2563eb)',display:'grid',placeItems:'center',color:'#fff',fontWeight:800}}>LG</div>
          <div>
            <div style={{fontWeight:800, fontSize:18}}>Logística 2026</div>
            <div style={{fontSize:12, color:'#6b7280'}}>Acesso restrito</div>
          </div>
        </div>
        <label style={{fontSize:12, color:'#374151'}}>Senha</label>
        <input
          autoFocus
          type="password"
          placeholder="Digite a senha"
          value={pw}
          onChange={(e)=>setPw(e.target.value)}
          style={{marginTop:6, width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'10px 12px'}}
        />
        {err && <div style={{color:'#b91c1c', fontSize:12, marginTop:8}}>{err}</div>}
        <button type="submit" style={{marginTop:12, width:'100%', border:'1px solid #2563eb', background:'#2563eb', color:'#fff', borderRadius:8, padding:'10px 12px', fontSize:12, cursor:'pointer'}}>Entrar</button>
        <div style={{fontSize:10, color:'#9ca3af', marginTop:10}}>Dica: MPA</div>
      </form>
    </div>
  )
}
