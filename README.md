# Lunari — instalação com NPM

## Instalar e abrir

1. Instale o **Node.js 22 LTS (22.12 ou mais recente)** com NPM 10 ou mais recente.
2. Extraia o ZIP em uma pasta no computador.
3. Abra o terminal nessa pasta e execute:

```sh
npm install
npm run dev
```

Abra **http://localhost:8080** no navegador. Para encerrar, pressione `Ctrl+C` no terminal. Para abrir novamente, execute apenas `npm run dev`.

Não é necessário instalar Bun. O comando de instalação cria `.env` a partir de `.env.example` automaticamente, sem substituir uma configuração existente. Para uma instalação usando exatamente as versões verificadas, use `npm ci` no lugar de `npm install`.

## O que esta versão mantém

O visual, as páginas de aluno, professor e administrador e o módulo de flashcards foram preservados. A configuração pública incluída conecta o aplicativo ao **mesmo Lovable Cloud** do projeto original: usuários e dados não são copiados para o computador. Alterações nos dados podem afetar o aplicativo online; não use contas reais para testes destrutivos.

**Esta não é uma versão offline nem uma migração completa do backend.** É preciso internet para login, dados, fontes e serviços conectados. O ZIP contém código e migrations, não contas, senhas, cópia do banco ou credenciais privadas.

## Limitações fora do Lovable

| Recurso | Situação no computador |
| --- | --- |
| Página inicial e navegação | Podem ser executadas com os comandos acima. |
| Login por e-mail e flashcards | Continuam conectados ao Lovable Cloud e sujeitos às permissões da conta; requerem internet. |
| Login com Google | Depende da autorização da origem local pelo serviço de login. Não foi validado neste pacote. |
| Verificação e reenvio de código | As funções atuais dependem de acesso privilegiado que não é exportado pelo Lovable Cloud; não funcionam integralmente só com a instalação local. |
| Gravação de voz | Depende de suporte e permissão do microfone no navegador; use localhost. |
| Feedback de pronúncia por IA | Requer acesso autorizado à IA e configuração privada no servidor local. Não está incluído no ZIP. |
| Aprovação/rejeição de professores | As permissões e ações no banco permanecem; o envio automático de e-mail depende de configuração privada adicional. |

As chaves privadas gerenciadas pelo Lovable Cloud não ficam disponíveis no computador. Não procure uma chave administrativa do Lovable Cloud nem coloque segredos em variáveis com prefixo `VITE_`: esse prefixo torna os valores visíveis ao navegador. Uma versão totalmente independente exige migrar os serviços de autenticação, e-mail e IA, além dos dados, para serviços sob seu controle; essa migração não faz parte deste pacote.

## Configuração

`.env.example` inclui apenas a URL e a chave pública já utilizadas pelo aplicativo, para que a página possa abrir após instalar. Não publique seu `.env` se você acrescentar credenciais privadas depois. O ZIP inclui um `.gitignore` que exclui `.env` e saídas geradas.

## Outros comandos

```sh
npm run lint
npm run format
```

O comando `npm run build` mantém o destino de publicação original do projeto. Ele não foi convertido em instalador desktop ou servidor de produção Node. Para trabalhar no computador, use `npm run dev`.

## Solução de problemas

- **Porta ocupada:** encerre o processo que usa a porta 8080 ou execute `npm run dev -- --port 8081` e abra http://localhost:8081.
- **Node incompatível:** confira `node --version` e atualize o Node.
- **Falha de instalação:** confira sua conexão e execute `npm ci` novamente.
- **Página abre, mas ação online falha:** confira a tabela de limitações acima; instalar dependências não cria credenciais privadas ou serviços online.

## Arquivos incluídos

- `src/`: aplicação e funções existentes.
- `supabase/migrations/`: histórico de estrutura do banco; não contém um backup dos usuários.
- `scripts/setup-local.mjs`: criação segura da configuração pública local.
- `package.json` e `package-lock.json`: comandos e versões NPM.
- `.env.example`: configuração pública de conexão.

Nenhuma publicação é necessária para usar esta versão no computador.