import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { arredondar } from '../comum/validacao';
import { RelatoriosService } from '../relatorios/relatorios.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly relatorios: RelatoriosService,
  ) {}

  // Formato igual ao tipo DashboardResumo do frontend.
  async resumo() {
    const [totalAlunos, totalAulas, totalTurmas, totalRegistros, totalPresentes, turmas, frequencias] =
      await Promise.all([
        this.prisma.aluno.count(),
        this.prisma.aula.count(),
        this.prisma.turma.count(),
        this.prisma.presenca.count(),
        this.prisma.presenca.count({ where: { presente: true } }),
        this.prisma.turma.findMany({ select: { id: true, codigo: true, nome: true }, orderBy: { nome: 'asc' } }),
        this.relatorios.frequencias(),
      ]);

    const alertasBaixaFrequencia = frequencias
      .filter((f) => f.abaixoDoLimite)
      .sort((a, b) => a.percentual - b.percentual)
      .map((f) => ({
        alunoId: f.alunoId,
        nome: f.nome,
        matricula: f.matricula,
        turmaNome: f.turmaNome,
        percentualPresenca: f.percentual,
      }));

    const frequenciaPorTurma = turmas.map((t) => {
      const daTurma = frequencias.filter((f) => f.turmaId === t.id);
      const total = daTurma.reduce((soma, f) => soma + f.aulasTotais, 0);
      const presentes = daTurma.reduce((soma, f) => soma + f.presencas, 0);
      return {
        codigo: t.codigo,
        nome: t.nome,
        percentual: total ? arredondar((presentes / total) * 100) : 0,
      };
    });

    return {
      totalAlunos,
      totalAulas,
      totalTurmas,
      taxaMediaPresenca: totalRegistros ? arredondar((totalPresentes / totalRegistros) * 100) : 0,
      alertasBaixaFrequencia,
      frequenciaPorTurma,
    };
  }
}
