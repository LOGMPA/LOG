# Painel Logística

Painel estático que lê `public/data/Solicitacoes.xlsx` e replica as páginas do seu painel (cards, calendário, listas e gráficos) com as mesmas cores e ícones. Proteção simples por senha no primeiro acesso.

## Como usar

1. **Crie um repositório** e envie estes arquivos.
2. **Coloque seus dados** em `public/data/Solicitacoes.xlsx` (mesmo layout do Excel que você já usa).
   - Dica: evite acentos no nome do arquivo.
3. **Habilite o GitHub Pages** em *Settings → Pages* e selecione *GitHub Actions*.
4. **Commit na `main`**: o workflow já publica automaticamente.

### Rodar local
```bash
npm i
npm run dev
```

### Construir
```bash
npm run build
```

## Senha (primeiro acesso)

- A senha padrão é `MPA`. O front compara só o **hash SHA‑256** (não armazena senha em texto), mas **não é segurança de banco**. Quem for inspecionar o código encontra o hash.
- Troque a senha alterando a constante `PASS_HASH` em `src/AuthGate.jsx` (use qualquer gerador SHA‑256).

## Estrutura do Excel

O leitor faz o mapeamento automático das colunas:

| Excel | Campo |
|---|---|
| STATUS | status |
| FRETE | frete |
| HR | hr |
| KM | km |
| R$ PROP | valor_prop |
| R$ TERC | valor_terc |
| CHASSI | chassi_lista (separa por vírgula, ponto e vírgula ou quebra de linha) |
| PREV | previsao (YYYY-MM-DD) |
| REAL | real (YYYY-MM-DD) |
| CLIENTE/NOTA | nota |
| SOLICITANTE | solicitante |
| ESTÁ: | esta |
| VAI: | vai |
| TIPO | tipo |
| ESTÁ EM: | estao_em |
| VAI PARA: | vai_para |
| OBS | obs |

> Se houver `ESTÁ EM:` / `VAI PARA:` no lugar de `ESTÁ:` / `VAI:`, o código usa como fallback.

## Observações

- **Router**: `HashRouter` evita 404 no Pages.
- **Assets**: `vite.config.js` usa `base: './'` para caminhos relativos.
- **Bibliotecas**: `lucide-react` (ícones), `recharts` (gráficos), `@tanstack/react-query` (cache), `xlsx` (Excel).
- **Estilo**: Tailwind básico com componentes mínimos (Card, Button, Badge, Table, Sidebar).

## Onde trocar coisas rápidas

- Senha: `src/AuthGate.jsx`
- Cores/status: `src/pages/PainelLogistica.jsx`
- Lista de cidades do gráfico: `src/pages/PainelLogistica.jsx` (array `cidades`)
- Mapeamento de colunas do Excel: `src/api/excelClient.js`
