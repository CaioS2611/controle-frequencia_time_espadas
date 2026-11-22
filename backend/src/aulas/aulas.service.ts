import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dataObrigatoria, idObrigatorio, textoObrigatorio } from '../comum/validacao';

const incluirAula = {
  turma: true,
  presencas: { include: { aluno: true }, orderBy: { aluno: { nome: 'asc' } } },
} satisfies Prisma.AulaInclude;

@Injectable()
export class AulasService {
  constructor(private readonly prisma: PrismaService) {}

  listar(turmaId?: number) {
    return this.prisma.aula.findMany({
      where: turmaId ? { turmaId } : {},
      include: incluirAula,
      orderBy: [{ data: 'desc' }, { id: 'desc' }],
    });
  }

  async buscar(id: number) {
    const aula = await this.prisma.aula.findUnique({ where: { id }, include: incluirAula });
    if (!aula) throw new NotFoundException('Aula não encontrada.');
    return aula;
  }

  /**
   * Registra uma aula com a chamada completa.
   * Corpo: { turmaId, data: "2026-11-22", horario: "14:00",
   *          presencas: [{ alunoId: 1, presente: true }, ...] }
   * Aluno matriculado que não vier na lista é registrado como presente.
   */
  async registrarChamada(corpo: Record<string, unknown>) {
    const turmaId = idObrigatorio(corpo.turmaId, 'turmaId');
    const data = dataObrigatoria(corpo.data, 'data');
    const horario = textoObrigatorio(corpo.horario, 'horario');

    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: { alunos: true },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada.');
    if (turma.alunos.length === 0) {
      throw new BadRequestException('A turma não tem alunos matriculados.');
    }

    const enviadas = Array.isArray(corpo.presencas) ? (corpo.presencas as unknown[]) : [];
    const mapa = new Map<number, boolean>();
    for (const item of enviadas) {
      const registro = (item ?? {}) as Record<string, unknown>;
      const alunoId = idObrigatorio(registro.alunoId, 'presencas.alunoId');
      if (typeof registro.presente !== 'boolean') {
        throw new BadRequestException('Cada presença precisa do campo "presente" (true/false).');
      }
      mapa.set(alunoId, registro.presente);
    }

    const matriculados = new Set(turma.alunos.map((m) => m.alunoId));
    for (const alunoId of mapa.keys()) {
      if (!matriculados.has(alunoId)) {
        throw new BadRequestException(`O aluno ${alunoId} não está matriculado nesta turma.`);
      }
    }

    return this.prisma.aula.create({
      data: {
        turmaId,
        data,
        horario,
        presencas: {
          create: turma.alunos.map((m) => ({
            alunoId: m.alunoId,
            presente: mapa.get(m.alunoId) ?? true,
          })),
        },
      },
      include: incluirAula,
    });
  }

  // Corrige a presença de um aluno em uma aula já registrada. Corpo: { "presente": false }
  async atualizarPresenca(aulaId: number, alunoId: number, corpo: Record<string, unknown>) {
    if (typeof corpo.presente !== 'boolean') {
      throw new BadRequestException('O campo "presente" deve ser true ou false.');
    }
    await this.prisma.presenca.update({
      where: { aulaId_alunoId: { aulaId, alunoId } },
      data: { presente: corpo.presente },
    });
    return this.buscar(aulaId);
  }

  remover(id: number) {
    return this.prisma.aula.delete({ where: { id } });
  }
}
