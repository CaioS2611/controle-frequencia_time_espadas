'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { DashboardResumo } from '@/types';
import {
    Users,
    BookOpen,
    TrendingUp,
    AlertTriangle,
    BarChart3,
    ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [dados, setDados] = useState<DashboardResumo | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        apiService
            .getDashboard()
            .then(setDados)
            .finally(() => setCarregando(false));
    }, []);

    if (carregando || !dados) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Dashboard de Frequência
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Visão geral das aulas práticas, presença média e alertas acadêmicos.
                    </p>
                </div>
                <Link
                    href="/frequencia"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                >
                    Realizar Chamada
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Total de Alunos
                        </span>
                        <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold">{dados.totalAlunos}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Matriculados nas turmas ativas
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Aulas Cadastradas
                        </span>
                        <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-600 dark:text-purple-400">
                            <BookOpen className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold">{dados.totalAulas}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Sessões práticas registradas
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Taxa Média de Presença
                        </span>
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold">{dados.taxaMediaPresenca}%</p>
                    {dados.taxaMediaPresenca >= 75 ? (
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            Acima da meta mínima de 75%
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                            Abaixo da meta mínima de 75%
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Alertas de Baixa Frequência
                        </span>
                        <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-600 dark:text-pink-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-pink-600 dark:text-pink-400">
                        {dados.alertasBaixaFrequencia.length}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Alunos abaixo de 75% de presença
                    </p>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-lg font-semibold">Frequência Média por Turma</h2>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Comparativo de assiduidade entre disciplinas laboratoriais
                    </p>

                    <div className="mt-6 space-y-5">
                        {dados.frequenciaPorTurma.map((item) => (
                            <div key={item.codigo} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        <span className="mr-2 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                            {item.codigo}
                                        </span>
                                        {item.nome}
                                    </span>
                                    <span className="font-bold">{item.percentual}%</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 transition-all duration-500"
                                        style={{ width: `${item.percentual}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        <h2 className="text-lg font-semibold">Alunos em Risco de Reprovação</h2>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Estudantes com índice de presença inferior ao limite institucional (75%)
                    </p>

                    <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {dados.alertasBaixaFrequencia.map((alerta) => (
                            <div
                                key={`${alerta.alunoId}-${alerta.turmaNome}`}
                                className="flex items-center justify-between py-3.5"
                            >
                                <div>
                                    <p className="font-medium">{alerta.nome}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Matrícula: {alerta.matricula} • {alerta.turmaNome}
                                    </p>
                                </div>
                                <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                                    {alerta.percentualPresenca}%
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}