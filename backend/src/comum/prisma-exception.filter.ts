import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

const ERROS: Record<string, [number, string]> = {
  P2002: [409, 'Já existe um registro com esse valor (campo único duplicado).'],
  P2003: [400, 'Referência inválida: turma, aluno ou aula inexistente.'],
  P2025: [404, 'Registro não encontrado.'],
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(erro: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();
    const [status, mensagem] = ERROS[erro.code] ?? [500, 'Erro no banco de dados.'];
    resposta.status(status).json({ statusCode: status, message: mensagem, codigo: erro.code });
  }
}
