export type Papel = 'ADMIN' | 'PROFESSOR';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    papel: Papel;
}

export interface Aluno {
    id: number;
    nome: string;
    matricula: string;
}

export interface Turma {
    id: number;
    nome: string;
    codigo: string;
    horario: string;
    _count?: {
        alunos: number;
        aulas: number;
    };
    alunos?: {
        aluno: Aluno;
    }[];
}

export interface Presenca {
    id: number;
    presente: boolean;
    aulaId: number;
    alunoId: number;
    aluno?: Aluno;
}

export interface Aula {
    id: number;
    data: string;
    horario: string;
    turmaId: number;
    turma?: Turma;
    presencas?: Presenca[];
}

export interface DashboardResumo {
    totalAlunos: number;
    totalAulas: number;
    taxaMediaPresenca: number;
    alertasBaixaFrequencia: {
        alunoId: number;
        nome: string;
        matricula: string;
        turmaNome: string;
        percentualPresenca: number;
    }[];
    frequenciaPorTurma: {
        codigo: string;
        nome: string;
        percentual: number;
    }[];
}