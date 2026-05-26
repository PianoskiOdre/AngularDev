export interface Movimento {
    id: number;
    dataMovimento: string;
    tipoMovimento: string;
    produtoNome: string;
    categoriaNome: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    responsavel: string;
    observacao: string;
}

export interface FiltroMovimento {
    dataInicio: string;
    dataFim: string;
    tipoMovimento?: string; // Opcional: "Entrada", "Saída" ou vazio para todos
    produtoId?: number;     // Opcional
}