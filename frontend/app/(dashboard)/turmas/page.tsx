'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Turma } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Clock,
  Hash,
  X,
  Search,
} from 'lucide-react';

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [turmaEditando, setTurmaEditando] = useState<Turma | null>(null);
  const [turmaVisualizandoAlunos, setTurmaVisualizandoAlunos] =
    useState<Turma | null>(null);

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [horario, setHorario] = useState('');

  useEffect(() => {
    apiService.getTurmas().then(setTurmas);
  }, []);

  const abrirModalCriar = () => {
    setTurmaEditando(null);
    setNome('');
    setCodigo('');
    setHorario('');
    setModalAberto(true);
  };

  const abrirModalEditar = (turma: Turma) => {
    setTurmaEditando(turma);
    setNome(turma.nome);
    setCodigo(turma.codigo);
    setHorario(turma.horario);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (turmaEditando) {
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === turmaEditando.id ? { ...t, nome, codigo, horario } : t
        )
      );
    } else {
      const novaTurma: Turma = {
        id: Date.now(),
        nome,
        codigo,
        horario,
        _count: { alunos: 0, aulas: 0 },
        alunos: [],
      };
      setTurmas((prev) => [novaTurma, ...prev]);
    }
    setModalAberto(false);
  };

  const handleRemover = (id: number) => {
    if (confirm('Deseja realmente remover esta turma?')) {
      setTurmas((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const turmasFiltradas = turmas.filter(
    (t) =>
      t.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Gerenciamento de Turmas
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cadastre, edite e visualize os estudantes matriculados em cada laboratório.
          </p>
        </div>

        <button
          onClick={abrirModalCriar}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Nova Turma
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar turma por nome ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {turmasFiltradas.map((turma) => (
          <article
            key={turma.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Hash className="h-3 w-3" />
                  {turma.codigo}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(turma)}
                    aria-label="Editar turma"
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemover(turma.id)}
                    aria-label="Remover turma"
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h2 className="mt-3 text-lg font-bold leading-snug">{turma.nome}</h2>

              <div className="mt-4 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {turma.horario}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  {turma._count?.alunos ?? turma.alunos?.length ?? 0} alunos matriculados
                </p>
              </div>
            </div>

            <button
              onClick={() => setTurmaVisualizandoAlunos(turma)}
              className="mt-6 w-full rounded-xl border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-orange-500 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
            >
              Visualizar Lista de Estudantes
            </button>
          </article>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {turmaEditando ? 'Editar Turma' : 'Cadastrar Nova Turma'}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Nome da Disciplina / Turma
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laboratório de Física 1"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Código
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FIS0012"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
                  Horário
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seg/Qua 10:00 - 11:50"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-zinc-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {turmaVisualizandoAlunos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <span className="font-mono text-xs font-bold text-orange-500">
                  {turmaVisualizandoAlunos.codigo}
                </span>
                <h2 className="text-lg font-bold">{turmaVisualizandoAlunos.nome}</h2>
              </div>
              <button
                onClick={() => setTurmaVisualizandoAlunos(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {turmaVisualizandoAlunos.alunos &&
              turmaVisualizandoAlunos.alunos.length > 0 ? (
                turmaVisualizandoAlunos.alunos.map(({ aluno }) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium">{aluno.nome}</span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {aluno.matricula}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-zinc-500">
                  Nenhum estudante vinculado a esta turma ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}