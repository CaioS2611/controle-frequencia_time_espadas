'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { RelatorioFrequencia } from '@/types';

export default function RelatoriosPage() {
  const [dados, setDados] = useState<RelatorioFrequencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [apenasFaltosos, setApenasFaltosos] = useState(false);

  useEffect(() => {
    apiService
      .getRelatorioFrequencia()
      .then(setDados)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const listaFiltrada = dados.filter((item) => {
    const turma = `${item.turmaCodigo} - ${item.turmaNome}`.toLowerCase();
    const matchBusca =
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.matricula.includes(busca) ||
      turma.includes(busca.toLowerCase());
    const matchFaltoso = apenasFaltosos ? item.abaixoDoLimite : true;
    return matchBusca && matchFaltoso;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Relatórios de Assiduidade
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Acompanhe a frequência individual, percentual de presença e a lista de faltosos por turma.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrar por aluno, matrícula ou turma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <button
          onClick={() => setApenasFaltosos(!apenasFaltosos)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            apenasFaltosos
              ? 'bg-pink-600 text-white'
              : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          {apenasFaltosos ? 'Exibindo: Apenas Faltosos (<75%)' : 'Filtrar Lista de Faltosos'}
        </button>
      </div>

      {erro && (
        <p className="rounded-xl border border-pink-300 bg-pink-50 px-4 py-3 text-sm font-medium text-pink-700 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-300">
          {erro}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">Estudante</th>
                <th className="px-6 py-3.5">Turma</th>
                <th className="px-6 py-3.5 text-center">Presenças / Aulas</th>
                <th className="px-6 py-3.5 text-center">Faltas</th>
                <th className="px-6 py-3.5 text-right">Percentual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {carregando && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Carregando relatório...
                  </td>
                </tr>
              )}
              {!carregando && listaFiltrada.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {listaFiltrada.map((aluno) => {
                const semAulas = aluno.aulasTotais === 0;
                const critico = aluno.abaixoDoLimite;
                return (
                  <tr key={`${aluno.alunoId}-${aluno.turmaId}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{aluno.nome}</p>
                      <p className="font-mono text-xs text-zinc-500">{aluno.matricula}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {aluno.turmaCodigo} - {aluno.turmaNome}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {aluno.presencas} / {aluno.aulasTotais}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-pink-600 dark:text-pink-400">
                      {aluno.faltas}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {semAulas ? (
                        <span className="text-xs text-zinc-400">Sem aulas</span>
                      ) : (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          critico
                            ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {critico ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        {aluno.percentual}%
                      </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}