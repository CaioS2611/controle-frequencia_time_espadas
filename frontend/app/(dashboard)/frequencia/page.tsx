'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Aula, Turma } from '@/types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
  History,
  Search,
} from 'lucide-react';

export default function FrequenciaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [aulasHistorico, setAulasHistorico] = useState<Aula[]>([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number>(1);
  const [dataAula, setDataAula] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [horarioAula, setHorarioAula] = useState<string>('14:00');
  const [buscaAluno, setBuscaAluno] = useState<string>('');
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  useEffect(() => {
    Promise.all([apiService.getTurmas(), apiService.getAulas()]).then(
      ([listaTurmas, listaAulas]) => {
        setTurmas(listaTurmas);
        setAulasHistorico(listaAulas);
        if (listaTurmas.length > 0) {
          inicializarPresencas(listaTurmas[0]);
        }
      }
    );
  }, []);

  const inicializarPresencas = (turma: Turma) => {
    const mapaInicial: Record<number, boolean> = {};
    turma.alunos?.forEach(({ aluno }) => {
      mapaInicial[aluno.id] = true;
    });
    setPresencas(mapaInicial);
  };

  const handleTrocarTurma = (id: number) => {
    setTurmaSelecionadaId(id);
    const encontrada = turmas.find((t) => t.id === id);
    if (encontrada) inicializarPresencas(encontrada);
    setSalvoSucesso(false);
  };

  const togglePresenca = (alunoId: number) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: !prev[alunoId],
    }));
    setSalvoSucesso(false);
  };

  const turmaAtual = turmas.find((t) => t.id === turmaSelecionadaId);
  const alunosFiltrados =
    turmaAtual?.alunos?.filter(
      ({ aluno }) =>
        aluno.nome.toLowerCase().includes(buscaAluno.toLowerCase()) ||
        aluno.matricula.includes(buscaAluno)
    ) || [];

  const handleSalvarChamada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaAtual) return;

    const novaAula: Aula = {
      id: Date.now(),
      data: new Date(dataAula).toISOString(),
      horario: horarioAula,
      turmaId: turmaAtual.id,
      turma: turmaAtual,
      presencas: Object.entries(presencas).map(([alunoId, presente], idx) => ({
        id: idx + 1,
        alunoId: Number(alunoId),
        aulaId: Date.now(),
        presente,
      })),
    };

    setAulasHistorico((prev) => [novaAula, ...prev]);
    setSalvoSucesso(true);
    setTimeout(() => setSalvoSucesso(false), 4000);
  };

  const totalPresentes = Object.values(presencas).filter(Boolean).length;
  const totalAlunosTurma = turmaAtual?.alunos?.length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Controle de Frequência Digital
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Selecione a turma, informe a data e registre a presença dos estudantes sem papel.
        </p>
      </div>

      <form
        onSubmit={handleSalvarChamada}
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Turma
            </label>
            <select
              value={turmaSelecionadaId}
              onChange={(e) => handleTrocarTurma(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigo} - {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" /> Data da Aula
            </label>
            <input
              type="date"
              required
              value={dataAula}
              onChange={(e) => setDataAula(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3.5 w-3.5" /> Horário
            </label>
            <input
              type="time"
              required
              value={horarioAula}
              onChange={(e) => setHorarioAula(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center dark:border-zinc-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou matrícula..."
              value={buscaAluno}
              onChange={(e) => setBuscaAluno(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Presentes:{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalPresentes}
            </span>{' '}
            / {totalAlunosTurma}
          </div>
        </div>

        <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {alunosFiltrados.map(({ aluno }) => {
            const estaPresente = presencas[aluno.id] ?? true;
            return (
              <div
                key={aluno.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{aluno.nome}</p>
                  <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    Matrícula: {aluno.matricula}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePresenca(aluno.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      estaPresente
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Presente
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePresenca(aluno.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      !estaPresente
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Falta
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {salvoSucesso ? (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Frequência registrada com sucesso no sistema!
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Salvar Frequência da Aula
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Histórico de Aulas Registradas</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="py-3 pr-4">Data</th>
                <th className="py-3 pr-4">Horário</th>
                <th className="py-3 pr-4">Turma</th>
                <th className="py-3">Presentes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {aulasHistorico.map((aula) => {
                const qtdPresentes =
                  aula.presencas?.filter((p) => p.presente).length || 0;
                const total = aula.presencas?.length || 0;
                return (
                  <tr key={aula.id}>
                    <td className="py-3.5 pr-4 font-medium">
                      {new Date(aula.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 pr-4">{aula.horario}</td>
                    <td className="py-3.5 pr-4">
                      {aula.turma?.codigo} - {aula.turma?.nome}
                    </td>
                    <td className="py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {qtdPresentes} / {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}