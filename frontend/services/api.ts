import { Aula, DashboardResumo, Turma } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK = true;

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`);
    }

    return res.json();
}

export const mockTurmas: Turma[] = [
    {
        id: 1,
        nome: 'Laboratório de Circuitos Digitais',
        codigo: 'ENE0024',
        horario: 'Seg/Qua 14:00 - 15:50',
        _count: { alunos: 28, aulas: 12 },
        alunos: [
            { aluno: { id: 1, nome: 'Ana Clara Silva', matricula: '242001122' } },
            { aluno: { id: 2, nome: 'Bruno Henrique Costa', matricula: '242003344' } },
            { aluno: { id: 3, nome: 'Carlos Eduardo Lima', matricula: '242005566' } },
            { aluno: { id: 4, nome: 'Daniela Martins', matricula: '242007788' } },
        ],
    },
    {
        id: 2,
        nome: 'Práticas de Redes de Computadores',
        codigo: 'ENE0108',
        horario: 'Ter/Qui 10:00 - 11:50',
        _count: { alunos: 22, aulas: 10 },
        alunos: [
            { aluno: { id: 2, nome: 'Bruno Henrique Costa', matricula: '242003344' } },
            { aluno: { id: 5, nome: 'Eduardo Souza', matricula: '242009900' } },
        ],
    },
    {
        id: 3,
        nome: 'Sistemas Embarcados e Microcontroladores',
        codigo: 'ENE0152',
        horario: 'Sex 08:00 - 11:50',
        _count: { alunos: 18, aulas: 8 },
        alunos: [
            { aluno: { id: 1, nome: 'Ana Clara Silva', matricula: '242001122' } },
            { aluno: { id: 4, nome: 'Daniela Martins', matricula: '242007788' } },
        ],
    },
];

export const mockDashboard: DashboardResumo = {
    totalAlunos: 68,
    totalAulas: 30,
    taxaMediaPresenca: 84.5,
    alertasBaixaFrequencia: [
        {
            alunoId: 3,
            nome: 'Carlos Eduardo Lima',
            matricula: '242005566',
            turmaNome: 'Lab. Circuitos Digitais',
            percentualPresenca: 62.5,
        },
        {
            alunoId: 5,
            nome: 'Eduardo Souza',
            matricula: '242009900',
            turmaNome: 'Práticas de Redes',
            percentualPresenca: 70.0,
        },
    ],
    frequenciaPorTurma: [
        { codigo: 'ENE0024', nome: 'Circuitos Digitais', percentual: 88 },
        { codigo: 'ENE0108', nome: 'Práticas de Redes', percentual: 79 },
        { codigo: 'ENE0152', nome: 'Sistemas Embarcados', percentual: 86 },
    ],
};

export const mockAulas: Aula[] = [
    {
        id: 101,
        data: '2026-11-16T14:00:00.000Z',
        horario: '14:00',
        turmaId: 1,
        turma: mockTurmas[0],
        presencas: [
            { id: 1, presente: true, aulaId: 101, alunoId: 1 },
            { id: 2, presente: true, aulaId: 101, alunoId: 2 },
            { id: 3, presente: false, aulaId: 101, alunoId: 3 },
            { id: 4, presente: true, aulaId: 101, alunoId: 4 },
        ],
    },
];

export const apiService = {
    getDashboard: async (): Promise<DashboardResumo> => {
        if (USE_MOCK) return Promise.resolve(mockDashboard);
        return fetchApi<DashboardResumo>('/dashboard');
    },
    getTurmas: async (): Promise<Turma[]> => {
        if (USE_MOCK) return Promise.resolve(mockTurmas);
        return fetchApi<Turma[]>('/turmas');
    },
    getAulas: async (): Promise<Aula[]> => {
        if (USE_MOCK) return Promise.resolve(mockAulas);
        return fetchApi<Aula[]>('/aulas');
    },
};