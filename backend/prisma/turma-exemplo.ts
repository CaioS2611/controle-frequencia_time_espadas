// Cria a turma de exemplo "Fundamentos de Redes 1" com 10 alunos matriculados.
// Rodar dentro de backend/:  npx tsx prisma/turma-exemplo.ts
// Pode rodar mais de uma vez: não duplica nada e NÃO apaga os outros dados.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const turma = {
  nome: 'Fundamentos de Redes 1',
  codigo: 'FR1-2026',
  horario: 'Ter/Qui 14:00 - 15:50',
};

// Matrículas fictícias: dá para corrigir depois pela API (PATCH /alunos/:id).
const alunos = [
  'Caio Soares',
  'Victor Lima',
  'Melissa Aragão',
  'Natália Domingos',
  'Ana Cecília Braga',
  'Beatriz Nascimento',
  'Ester Chaves',
  'Huan Giorno',
  'Igor Rocha',
  'Rafael Hossoe',
].map((nome, i) => ({ nome, matricula: `FR1${String(i + 1).padStart(4, '0')}` }));

async function main() {
  const t = await prisma.turma.upsert({
    where: { codigo: turma.codigo },
    update: { nome: turma.nome, horario: turma.horario },
    create: turma,
  });

  for (const a of alunos) {
    const aluno = await prisma.aluno.upsert({
      where: { matricula: a.matricula },
      update: { nome: a.nome },
      create: a,
    });
    await prisma.matricula.upsert({
      where: { alunoId_turmaId: { alunoId: aluno.id, turmaId: t.id } },
      update: {},
      create: { alunoId: aluno.id, turmaId: t.id },
    });
  }

  const total = await prisma.matricula.count({ where: { turmaId: t.id } });
  console.log(`Turma "${t.nome}" (${t.codigo}) pronta, com ${total} alunos matriculados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
