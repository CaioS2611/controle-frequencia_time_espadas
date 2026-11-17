// Seed do banco - Controle de Frequência (Time Espadas)
// Popula o banco com usuários, turmas, alunos, aulas e presenças de exemplo.
// Rodar com: npx prisma db seed
// ATENÇÃO: apaga os dados atuais antes de inserir os de exemplo.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Gerador pseudoaleatório com semente fixa: o seed gera sempre os mesmos dados.
let semente = 42;
function aleatorio(): number {
  semente = (semente * 1103515245 + 12345) % 2147483648;
  return semente / 2147483648;
}

const nomes = [
  'Ana Beatriz Souza', 'Bruno Carvalho', 'Camila Ferreira', 'Daniel Rocha',
  'Eduarda Lima', 'Felipe Martins', 'Gabriela Alves', 'Henrique Costa',
  'Isabela Ribeiro', 'João Pedro Santos', 'Larissa Gomes', 'Lucas Oliveira',
  'Mariana Barbosa', 'Matheus Pereira', 'Natália Araújo', 'Pedro Henrique Dias',
  'Rafaela Mendes', 'Rodrigo Teixeira', 'Sofia Cardoso', 'Thiago Nascimento',
];

// Alunos (pelo índice) com frequência baixa, para aparecerem nos alertas.
const alunosFaltosos = [3, 11, 17];

const turmas = [
  { nome: 'Algoritmos e Programação', codigo: 'APC-2026', horario: 'Seg/Qua 08:00-09:50', alunos: [0, 10] },
  { nome: 'Banco de Dados', codigo: 'BD-2026', horario: 'Ter/Qui 10:00-11:50', alunos: [5, 15] },
  { nome: 'Engenharia de Software', codigo: 'ES-2026', horario: 'Sex 14:00-17:50', alunos: [10, 20] },
];

const AULAS_POR_TURMA = 8;

async function main() {
  // Limpa na ordem certa por causa das chaves estrangeiras.
  await prisma.presenca.deleteMany();
  await prisma.aula.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.usuario.deleteMany();

  // Usuários para testar o login.
  await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@engnet.com',
      senha: await bcrypt.hash('admin123', 10),
      papel: 'ADMIN',
    },
  });
  await prisma.usuario.create({
    data: {
      nome: 'Professor Teste',
      email: 'professor@engnet.com',
      senha: await bcrypt.hash('prof123', 10),
      papel: 'PROFESSOR',
    },
  });

  // Alunos e a taxa de presença "real" de cada um.
  const alunosIds: number[] = [];
  const taxaPresenca: number[] = [];
  for (let i = 0; i < nomes.length; i++) {
    const aluno = await prisma.aluno.create({
      data: { nome: nomes[i], matricula: `2026${String(i + 1).padStart(5, '0')}` },
    });
    alunosIds.push(aluno.id);
    taxaPresenca.push(alunosFaltosos.includes(i) ? 0.5 + aleatorio() * 0.2 : 0.85 + aleatorio() * 0.15);
  }

  const hoje = new Date();
  let totalPresencas = 0;

  for (const t of turmas) {
    const turma = await prisma.turma.create({
      data: { nome: t.nome, codigo: t.codigo, horario: t.horario },
    });

    // Matricula os alunos da faixa [inicio, fim) nessa turma.
    const indices: number[] = [];
    for (let i = t.alunos[0]; i < t.alunos[1]; i++) indices.push(i);
    await prisma.matricula.createMany({
      data: indices.map((i) => ({ alunoId: alunosIds[i], turmaId: turma.id })),
    });

    // Uma aula por semana nas últimas semanas, com a chamada de cada uma.
    for (let k = 0; k < AULAS_POR_TURMA; k++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (AULAS_POR_TURMA - k) * 7);

      const aula = await prisma.aula.create({
        data: { data, horario: t.horario, turmaId: turma.id },
      });

      const presencas = indices.map((i) => ({
        aulaId: aula.id,
        alunoId: alunosIds[i],
        presente: aleatorio() < taxaPresenca[i],
      }));
      await prisma.presenca.createMany({ data: presencas });
      totalPresencas += presencas.length;
    }
  }

  console.log('Seed concluído:');
  console.log(`  2 usuários (admin@engnet.com / admin123 e professor@engnet.com / prof123)`);
  console.log(`  ${nomes.length} alunos, ${turmas.length} turmas, ${turmas.length * AULAS_POR_TURMA} aulas, ${totalPresencas} registros de presença`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });