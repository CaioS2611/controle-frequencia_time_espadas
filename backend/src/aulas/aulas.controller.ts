import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { idOpcional } from '../comum/validacao';
import { AulasService } from './aulas.service';

@Controller('aulas')
export class AulasController {
  constructor(private readonly aulas: AulasService) {}

  // GET /aulas?turmaId=1  (filtro opcional) — histórico de aulas com a chamada
  @Get()
  listar(@Query('turmaId') turmaId?: string) {
    return this.aulas.listar(idOpcional(turmaId, 'turmaId'));
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.aulas.buscar(id);
  }

  // Registra a aula e a chamada de uma vez
  @Post()
  registrarChamada(@Body() corpo: Record<string, unknown>) {
    return this.aulas.registrarChamada(corpo);
  }

  @Patch(':id/presencas/:alunoId')
  atualizarPresenca(
    @Param('id', ParseIntPipe) id: number,
    @Param('alunoId', ParseIntPipe) alunoId: number,
    @Body() corpo: Record<string, unknown>,
  ) {
    return this.aulas.atualizarPresenca(id, alunoId, corpo);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.aulas.remover(id);
  }
}
