# Logística 2026 – Base44 (CSV → GitHub)

Pronto para rodar local e publicar no GitHub Pages.

## Como usar (local)
1. `npm i`
2. Coloque seu arquivo **CSV** em `public/data/solicitacoes.csv` com os headers:
   `STATUS,FRETE,HR,KM,R$ PROP,R$ TERC,CHASSI,PREVISÃO,REAL,NOTA,SOLICITANTE,ESTÁ:,VAI:,TIPO,ESTÃO EM:,VAI PARA:,OBS`
3. `npm run dev` e abra a URL que aparecer.

## Publicar no GitHub Pages
- Se o repositório se chamar `meu-repo`, rode:
  ```bash
  GH_PAGES_BASE=/meu-repo/ npm run build
  ```
- Publique a pasta `dist/` nas configurações do Pages.

## Páginas
- Painel Logística 2026
- Calendário (Semanal + Mensal)
- Solicitações de Transporte (com filtros)
- Transportes Concluídos (com filtros)
- Demonstrações (calendário mensal, cores por status)

## Notas
- O app lê o CSV e faz o parsing automaticamente (datas `dd/mm/aa` ou `dd/mm/aaaa`).
- `LOC` é extraído do primeiro link encontrado em **ESTÁ:** ou **VAI:**.
- Para múltiplos chassi na mesma linha, separe por vírgula ou ponto e vírgula.
