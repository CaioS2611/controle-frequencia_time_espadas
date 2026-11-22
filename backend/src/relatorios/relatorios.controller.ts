import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { idOpcional } from '../comum/validacao';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatorios: RelatoriosService) {}

  // GET /relatorios/frequencia?turmaId=1 — frequência individual e percentual de presença
  @Get('frequencia')
  frequencia(@Query('turmaId') turmaId?: string) {
    return this.relatorios.frequencias({ turmaId: idOpcional(turmaId, 'turmaId') });
  }

  // GET /relatorios/faltosos?turmaId=1 — alunos abaixo de 75%
  @Get('faltosos')
  faltosos(@Query('turmaId') turmaId?: string) {
    return this.relatorios.faltosos(idOpcional(turmaId, 'turmaId'));
  }

  // GET /relatorios/alunos/3 — frequência de um aluno em todas as turmas
  @Get('alunos/:id')
  aluno(@Param('id', ParseIntPipe) id: number) {
    return this.relatorios.frequenciaDoAluno(id);
  }

  // GET /relatorios/turmas/1/historico — histórico de aulas da turma
  @Get('turmas/:id/historico')
  historico(@Param('id', ParseIntPipe) id: number) {
    return this.relatorios.historicoDaTurma(id);
  }
}
