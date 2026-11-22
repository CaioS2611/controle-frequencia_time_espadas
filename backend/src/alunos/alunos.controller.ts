import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AlunosService } from './alunos.service';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunos: AlunosService) {}

  // GET /alunos?busca=ana  (busca opcional por nome ou matrícula)
  @Get()
  listar(@Query('busca') busca?: string) {
    return this.alunos.listar(busca);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.alunos.buscar(id);
  }

  @Post()
  criar(@Body() corpo: Record<string, unknown>) {
    return this.alunos.criar(corpo);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() corpo: Record<string, unknown>) {
    return this.alunos.atualizar(id, corpo);
  }

  @Delete(':id')
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.alunos.remover(id);
  }
}
