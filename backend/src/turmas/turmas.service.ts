import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { idObrigatorio, textoObrigatorio, textoOpcional } from '../comum/validacao';

// Tudo que a tela de turmas precisa: contagens e a lista de alunos matriculados.
const incluirTurma = {
  _count: { select: { alunos: true, aulas: true } },
  alunos: { include: { aluno: true }, orderBy: { aluno: { nome: 'asc' } } },
} satisfies Prisma.TurmaInclude;

@Injectable()
export class TurmasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.turma.findMany({ include: incluirTurma, orderBy: { nome: 'asc' } });
  }

  async buscar(id: number) {
    const turma = await this.prisma.turma.findUnique({ where: { id }, include: incluirTurma });
    if (!turma) throw new NotFoundException('Turma não encontrada.');
    return turma;
  }

  criar(corpo: Record<string, unknown>) {
    return this.prisma.turma.create({
      data: {
        nome: textoObrigatorio(corpo.nome, 'nome'),
        codigo: textoObrigatorio(corpo.codigo, 'codigo'),
        horario: textoObrigatorio(corpo.horario, 'horario'),
      },
      include: incluirTurma,
    });
  }

  atualizar(id: number, corpo: Record<string, unknown>) {
    return this.prisma.turma.update({
      where: { id },
      data: {
        nome: textoOpcional(corpo.nome, 'nome'),
        codigo: textoOpcional(corpo.codigo, 'codigo'),
        horario: textoOpcional(corpo.horario, 'horario'),
      },
      include: incluirTurma,
    });
  }

  remover(id: number) {
    return this.prisma.turma.delete({ where: { id } });
  }

  async matricular(turmaId: number, corpo: Record<string, unknown>) {
    const alunoId = idObrigatorio(corpo.alunoId, 'alunoId');
    await this.prisma.matricula.create({ data: { turmaId, alunoId } });
    return this.buscar(turmaId);
  }

  async desmatricular(turmaId: number, alunoId: number) {
    await this.prisma.matricula.delete({ where: { alunoId_turmaId: { alunoId, turmaId } } });
    return this.buscar(turmaId);
  }
}
