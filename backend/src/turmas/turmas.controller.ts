import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TurmasService } from './turmas.service';

@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmas: TurmasService) {}

  @Get()
  listar() {
    return this.turmas.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.turmas.buscar(id);
  }

  @Post()
  criar(@Body() corpo: Record<string, unknown>) {
    return this.turmas.criar(corpo);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() corpo: Record<string, unknown>) {
    return this.turmas.atualizar(id, corpo);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.turmas.remover(id);
  }

  // Matricula um aluno na turma. Corpo: { "alunoId": 1 }
  @Post(':id/alunos')
  matricular(@Param('id', ParseIntPipe) id: number, @Body() corpo: Record<string, unknown>) {
    return this.turmas.matricular(id, corpo);
  }

  @Delete(':id/alunos/:alunoId')
  desmatricular(
    @Param('id', ParseIntPipe) id: number,
    @Param('alunoId', ParseIntPipe) alunoId: number,
  ) {
    return this.turmas.desmatricular(id, alunoId);
  }
}
