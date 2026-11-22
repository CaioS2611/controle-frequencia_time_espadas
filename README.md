# EngNet Presença: Controle de Frequência

> Desafio 4 (Projeto Final) do processo trainee da **EngNet**, desenvolvido pelo **Time Espadas**.

Sistema web para registrar e acompanhar a frequência dos alunos em aulas práticas e laboratórios. Ele substitui as listas de presença em papel por uma chamada digital, com gestão de turmas, relatórios automáticos e alertas de baixa frequência.

---

## Sumário
- [O problema](#o-problema)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
- [Modelo de dados](#modelo-de-dados)
- [API REST](#api-rest)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Scripts úteis](#scripts-úteis)
- [Fluxo de trabalho com Git](#fluxo-de-trabalho-com-git)
- [Equipe](#equipe)

---

## O problema

A instituição cliente controlava a presença das aulas práticas com listas em papel e planilhas. Isso causava:

- alunos assinando a presença por outros colegas;
- erros humanos no lançamento das presenças;
- dificuldade para rastrear presenças reais;
- excesso de papel e desperdício de recursos;
- lentidão para gerar relatórios;
- sobrecarga administrativa no controle de turmas e horários;
- falta de organização com grande volume de estudantes.

O **EngNet Presença** centraliza turmas, alunos e chamadas em um único sistema, com os dados em um banco de dados na nuvem.

---

## Funcionalidades

| Área | O que faz |
|---|---|
| **Dashboard** | Total de alunos e de aulas, taxa média de presença, alertas de baixa frequência e frequência média por turma |
| **Turmas** | Criar, editar e remover turmas; ver a lista de estudantes de cada turma |
| **Frequência** | Selecionar turma, data e horário e marcar presença ou falta de cada aluno; histórico das aulas registradas |
| **Relatórios** | Frequência individual, percentual de presença, lista de faltosos (abaixo de 75%) e busca por aluno, matrícula ou turma |
| **Responsividade** | Interface adaptada para desktop, tablet e celular |

Regra de negócio: o aluno com presença **abaixo de 75%** em uma turma entra nos alertas e na lista de faltosos.

> **Em desenvolvimento:** autenticação com JWT. A tela de login já existe, mas ainda não valida usuário e senha no backend.

---

## Tecnologias

**Frontend**
- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Lucide (ícones)

**Backend**
- [NestJS](https://nestjs.com) (API REST)
- TypeScript
- [Prisma ORM 6](https://www.prisma.io)

**Banco de dados**
- PostgreSQL hospedado no [Neon](https://neon.tech) (nuvem)

---

## Arquitetura e estrutura de pastas

O projeto é um **monorepo**, com o frontend e o backend no mesmo repositório:

```
frontend (Next.js, porta 3000)  ──HTTP/JSON──▶  backend (NestJS, porta 3001)  ──Prisma──▶  PostgreSQL (Neon)
```

```
controle-frequencia_time_espadas/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/         # tela de login
│   │   └── (dashboard)/          # dashboard, turmas, frequencia, relatorios
│   ├── components/layout/        # Sidebar e layout
│   ├── services/api.ts           # todas as chamadas à API
│   └── types/index.ts            # tipos compartilhados
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma         # modelo do banco
    │   ├── migrations/           # histórico de alterações do banco
    │   ├── seed.ts               # dados de exemplo (apaga e recria tudo)
    │   └── turma-exemplo.ts      # cria a turma "Fundamentos de Redes 1"
    └── src/
        ├── prisma/               # PrismaService (conexão com o banco)
        ├── comum/                # validações e tratamento de erros do banco
        ├── turmas/               # CRUD de turmas e matrículas
        ├── alunos/               # CRUD de alunos
        ├── aulas/                # registro de aulas e chamada
        ├── relatorios/           # cálculos de frequência
        └── dashboard/            # indicadores da página inicial
```

Cada módulo do backend segue o padrão do NestJS: **controller** (rotas), **service** (regras de negócio e acesso ao banco) e **module**.

---

## Modelo de dados

| Tabela | Descrição |
|---|---|
| `Usuario` | Quem acessa o sistema: nome, e-mail, senha (hash bcrypt) e papel (`ADMIN` ou `PROFESSOR`) |
| `Turma` | Nome, código (único) e horário |
| `Aluno` | Nome e matrícula (única) |
| `Matricula` | Liga alunos a turmas (relação N:N) |
| `Aula` | Data e horário de cada aula de uma turma |
| `Presenca` | Presença ou falta de um aluno em uma aula (um registro por aluno por aula) |

```
Turma 1──N Aula 1──N Presenca N──1 Aluno
Turma N──N Aluno (pela tabela Matricula)
```

Ao remover uma turma, um aluno ou uma aula, os registros ligados a eles são removidos juntos (`onDelete: Cascade`).

---

## API REST

URL base local: `http://localhost:3001`

### Turmas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/turmas` | Lista turmas com contagem e lista de alunos |
| GET | `/turmas/:id` | Detalhes de uma turma |
| POST | `/turmas` | Cria uma turma: `{ "nome", "codigo", "horario" }` |
| PATCH | `/turmas/:id` | Edita uma turma |
| DELETE | `/turmas/:id` | Remove uma turma |
| POST | `/turmas/:id/alunos` | Matricula um aluno: `{ "alunoId": 1 }` |
| DELETE | `/turmas/:id/alunos/:alunoId` | Remove o aluno da turma |

### Alunos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/alunos?busca=` | Lista alunos (busca opcional por nome ou matrícula) |
| GET | `/alunos/:id` | Detalhes de um aluno e suas turmas |
| POST | `/alunos` | Cria um aluno: `{ "nome", "matricula" }` |
| PATCH | `/alunos/:id` | Edita um aluno |
| DELETE | `/alunos/:id` | Remove um aluno |

### Aulas e chamada
| Método | Rota | Descrição |
|---|---|---|
| GET | `/aulas?turmaId=` | Histórico de aulas com as presenças |
| GET | `/aulas/:id` | Detalhes de uma aula |
| POST | `/aulas` | Registra a aula e a chamada (exemplo abaixo) |
| PATCH | `/aulas/:id/presencas/:alunoId` | Corrige uma presença: `{ "presente": false }` |
| DELETE | `/aulas/:id` | Remove uma aula |

```json
POST /aulas
{
  "turmaId": 1,
  "data": "2026-11-22",
  "horario": "14:00",
  "presencas": [
    { "alunoId": 1, "presente": true },
    { "alunoId": 2, "presente": false }
  ]
}
```
Alunos matriculados que não aparecerem na lista são registrados como presentes.

### Relatórios e dashboard
| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard` | Indicadores da página inicial |
| GET | `/relatorios/frequencia?turmaId=` | Frequência e percentual de cada aluno por turma |
| GET | `/relatorios/faltosos?turmaId=` | Alunos abaixo de 75% de presença |
| GET | `/relatorios/alunos/:id` | Frequência de um aluno em todas as turmas |
| GET | `/relatorios/turmas/:id/historico` | Histórico de aulas da turma com o total de presentes |

Os erros voltam em JSON, no formato `{ "statusCode": 409, "message": "..." }`. O código 409 indica um código de turma ou uma matrícula repetidos.

---

## Como rodar o projeto

### Pré-requisitos
- [Node.js LTS](https://nodejs.org) (confira com `node -v`)
- [Git](https://git-scm.com)
- O arquivo **`backend/.env`** com as credenciais do banco. Ele **não** fica no repositório: peça a um integrante da equipe.

```env
# backend/.env
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://...neon.tech/neondb?sslmode=require"
```

> **Windows / PowerShell:** rode um comando por vez, porque o PowerShell não aceita `&&`.
> Se aparecer "a execução de scripts foi desabilitada", rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### 1. Clonar
```bash
git clone https://github.com/CaioS2611/controle-frequencia_time_espadas.git
cd controle-frequencia_time_espadas
```

### 2. Backend (terminal 1)
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```
A API sobe em **http://localhost:3001**. Deve aparecer "Nest application successfully started".

O banco já está criado na nuvem. Para usar um banco **novo e vazio**, rode antes `npx prisma migrate deploy` e depois `npx prisma db seed`.

### 3. Frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Acesse **http://localhost:3000**.

### Variáveis de ambiente opcionais
| Onde | Variável | Padrão | Para que serve |
|---|---|---|---|
| backend | `PORT` | `3001` | Porta da API |
| backend | `FRONTEND_URL` | qualquer origem | URL(s) liberadas no CORS, separadas por vírgula |
| frontend (`.env.local`) | `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Endereço da API |
| frontend (`.env.local`) | `NEXT_PUBLIC_USE_MOCK` | `false` | `true` usa dados falsos, sem precisar do backend |

---

## Scripts úteis

Todos rodam dentro de `backend/`:

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Sobe a API recarregando a cada alteração |
| `npx prisma studio` | Abre uma interface no navegador para ver e editar o banco |
| `npx prisma db seed` | **Apaga todos os dados** e recria os dados de exemplo (20 alunos, 3 turmas, 24 aulas) |
| `npx tsx prisma/turma-exemplo.ts` | Cria a turma "Fundamentos de Redes 1" com 10 alunos, sem apagar nada |
| `npx prisma migrate dev --name <descricao>` | Cria uma migration depois de alterar o `schema.prisma` |

Usuários criados pelo seed: `admin@engnet.com` / `admin123` e `professor@engnet.com` / `prof123`.

---

## Fluxo de trabalho com Git

- `main`: versão estável. Tudo entra por **Pull Request**.
- `feature/<nome-da-tarefa>`: uma branch para cada funcionalidade.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`, `chore:`.

```bash
git checkout -b feature/minha-tarefa
git add .
git commit -m "feat: descreve o que foi feito"
git push -u origin feature/minha-tarefa
```

> O arquivo `.env` **nunca** deve ser enviado ao GitHub.

---

## Equipe

**Time Espadas**: processo trainee EngNet

| Integrante | Matrícula | Responsabilidades |
|---|---|---|
| Caio Soares | 231025495 | Repositório Git, banco de dados (PostgreSQL + Prisma) e API (NestJS) |
| Roberto Filho | | Frontend (telas de dashboard, turmas, frequência, relatórios e login) |
| | | |
| | | |
