import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { textoObrigatorio, textoOpcional } from '../comum/validacao';

const incluirAluno = {
  turmas: { include: { turma: true } },
} satisfies Prisma.AlunoInclude;

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  listar(busca?: string) {
    return this.prisma.aluno.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { matricula: { contains: busca } },
            ],
          }
        : {},
      include: incluirAluno,
      orderBy: { nome: 'asc' },
    });
  }

  async buscar(id: number) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id }, include: incluirAluno });
    if (!aluno) throw new NotFoundException('Aluno não encontrado.');
    return aluno;
  }

  criar(corpo: Record<string, unknown>) {
    return this.prisma.aluno.create({
      data: {
        nome: textoObrigatorio(corpo.nome, 'nome'),
        matricula: textoObrigatorio(corpo.matricula, 'matricula'),
      },
      include: incluirAluno,
    });
  }

  atualizar(id: number, corpo: Record<string, unknown>) {
    return this.prisma.aluno.update({
      where: { id },
      data: {
        nome: textoOpcional(corpo.nome, 'nome'),
        matricula: textoOpcional(corpo.matricula, 'matricula'),
      },
      include: incluirAluno,
    });
  }

  remover(id: number) {
    return this.prisma.aluno.delete({ where: { id } });
  }
}
