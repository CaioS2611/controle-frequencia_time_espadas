import { BadRequestException } from '@nestjs/common';

export function textoObrigatorio(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new BadRequestException(`O campo "${campo}" é obrigatório.`);
  }
  return valor.trim();
}

export function textoOpcional(valor: unknown, campo: string): string | undefined {
  return valor === undefined ? undefined : textoObrigatorio(valor, campo);
}

export function idObrigatorio(valor: unknown, campo: string): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new BadRequestException(`O campo "${campo}" deve ser um id válido.`);
  }
  return numero;
}

export function idOpcional(valor: unknown, campo: string): number | undefined {
  return valor === undefined || valor === '' ? undefined : idObrigatorio(valor, campo);
}

// Aceita "2026-11-22" ou uma data ISO completa.
// Datas sem horário são gravadas ao meio-dia (UTC) para não "voltarem" um dia no fuso do Brasil.
export function dataObrigatoria(valor: unknown, campo: string): Date {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new BadRequestException(`O campo "${campo}" é obrigatório.`);
  }
  const texto = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T12:00:00.000Z` : valor;
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) {
    throw new BadRequestException(`O campo "${campo}" não é uma data válida.`);
  }
  return data;
}

export function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10;
}
