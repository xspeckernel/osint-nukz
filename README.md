# OSINT Nukz

Ferramenta gratuita de consulta pública de e-mail: verifica formato, domínio,
Gravatar, vazamentos conhecidos (via XposedOrNot) e presença pública no
GitHub. Não faz scraping de redes sociais nem coleta dados privados —
só consulta APIs públicas.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Deploy na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Não é necessário configurar nenhuma variável de ambiente — todas as
   APIs usadas (Gravatar, XposedOrNot, GitHub) são públicas e gratuitas,
   sem chave de API.
4. Clique em **Deploy**.

## Limites conhecidos

- **XposedOrNot (gratuito)**: retorna só os nomes dos vazamentos, sem
  detalhes. Tem rate limit informal (~1 req/segundo). Se quiser dados mais
  detalhados (data do vazamento, tipo de dado exposto), dá pra migrar para
  a API paga (Plus) deles depois.
- **GitHub Search API** (sem autenticação): limite de 10 requisições por
  minuto por IP. Só encontra o usuário se ele tiver o e-mail configurado
  como público no perfil do GitHub.
- **Verificação de e-mail descartável**: usa uma lista curta embutida no
  código (`DISPOSABLE_DOMAINS` em `app/api/lookup/route.js`), não é
  exaustiva.

## Escopo ético

Este projeto foi feito para consultar apenas o que já é público e
verificável (formato do e-mail, domínio, Gravatar, vazamentos já
divulgados, perfil público do GitHub). Ele não tenta montar um perfil
completo de uma pessoa a partir de redes sociais, nem acessa dados
privados. Adicionar esse tipo de coleta pode infringir a LGPD e os termos
de uso das plataformas — recomendo manter o escopo assim.
