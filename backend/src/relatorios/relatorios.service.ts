import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { arredondar } from '../comum/validacao';

// Abaixo deste percentual o aluno entra nos alertas e na lista de faltosos.
export const LIMITE_FREQUENCIA = 75;

export interface FrequenciaAluno {
  alunoId: number;
  nome: string;
  matricula: string;
  turmaId: number;
  turmaCodigo: string;
  turmaNome: string;
  aulasTotais: number;
  presencas: number;
  faltas: number;
  percentual: number; // 0 quando ainda não há aulas registradas
  abaixoDoLimite: boolean;
}

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Frequência de cada aluno em cada turma em que está matriculado. */
  async frequencias(filtro: { turmaId?: number; alunoId?: number } = {}): Promise<FrequenciaAluno[]> {
    const [matriculas, registros] = await Promise.all([
      this.prisma.matricula.findMany({
        where: { turmaId: filtro.turmaId, alunoId: filtro.alunoId },
        include: { aluno: true, turma: true },
      }),
      this.prisma.presenca.findMany({
        where: { alunoId: filtro.alunoId, aula: { turmaId: filtro.turmaId } },
        select: { alunoId: true, presente: true, aula: { select: { turmaId: true } } },
      }),
    ]);

    const contagem = new Map<string, { total: number; presentes: number }>();
    for (const r of registros) {
      const chave = `${r.alunoId}-${r.aula.turmaId}`;
      const atual = contagem.get(chave) ?? { total: 0, presentes: 0 };
      atual.total += 1;
      if (r.presente) atual.presentes += 1;
      contagem.set(chave, atual);
    }

    return matriculas
      .map((m) => {
        const { total, presentes } = contagem.get(`${m.alunoId}-${m.turmaId}`) ?? { total: 0, presentes: 0 };
        const percentual = total ? arredondar((presentes / total) * 100) : 0;
        return {
          alunoId: m.alunoId,
          nome: m.aluno.nome,
          matricula: m.aluno.matricula,
          turmaId: m.turmaId,
          turmaCodigo: m.turma.codigo,
          turmaNome: m.turma.nome,
          aulasTotais: total,
          presencas: presentes,
          faltas: total - presentes,
          percentual,
          abaixoDoLimite: total > 0 && percentual < LIMITE_FREQUENCIA,
        };
      })
      .sort((a, b) => a.turmaNome.localeCompare(b.turmaNome) || a.nome.localeCompare(b.nome));
  }

  async faltosos(turmaId?: number) {
    const lista = await this.frequencias({ turmaId });
    return lista.filter((f) => f.abaixoDoLimite).sort((a, b) => a.percentual - b.percentual);
  }

  async frequenciaDoAluno(alunoId: number) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id: alunoId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado.');
    return { aluno, turmas: await this.frequencias({ alunoId }) };
  }

  /** Histórico da turma: cada aula com o total de presentes. */
  async historicoDaTurma(turmaId: number) {
    const turma = await this.prisma.turma.findUnique({
      where: { id: turmaId },
      include: {
        aulas: {
          include: { presencas: { select: { presente: true } } },
          orderBy: { data: 'desc' },
        },
      },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada.');

    const aulas = turma.aulas.map((aula) => {
      const presentes = aula.presencas.filter((p) => p.presente).length;
      const total = aula.presencas.length;
      return {
        id: aula.id,
        data: aula.data,
        horario: aula.horario,
        presentes,
        faltas: total - presentes,
        total,
        percentual: total ? arredondar((presentes / total) * 100) : 0,
      };
    });

    return { id: turma.id, nome: turma.nome, codigo: turma.codigo, horario: turma.horario, aulas };
  }
}
