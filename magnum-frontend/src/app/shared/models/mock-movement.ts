export interface Movement {
  id: number;
  date: string; // formato 'YYYY-MM-DD'
  productId: number;
  productName: string;
  category: string;
  type: 'entrada' | 'saida'; // entrada = compra, saida = venda
  quantity: number;
  unitPrice: number;
  totalValue: number;
  responsible: string;
  observation?: string;
}

export interface FiltroMoviment {
    startDate: string;
    endDate: string;
    type?: string; // Opcional: "Entrada", "Saída" ou vazio para todos
    productId?: number;     // Opcional
}

// Dados fictícios iniciais
export const MOCK_MOVEMENTS: Movement[] = [
  {
    id: 1,
    date: '2026-05-27',
    productId: 1,
    productName: 'Tubo PVC 50mm',
    category: 'PVC',
    type: 'entrada',
    quantity: 50,
    unitPrice: 15.90,
    totalValue: 795.00,
    responsible: 'João Silva',
    observation: 'Compra fornecedor XYZ'
  },
  {
    id: 2,
    date: '2026-05-28',
    productId: 1,
    productName: 'Tubo PVC 50mm',
    category: 'PVC',
    type: 'saida',
    quantity: 10,
    unitPrice: 26.50,
    totalValue: 265.00,
    responsible: 'Maria Oliveira',
    observation: 'Venda cliente ABC'
  },
  {
    id: 3,
    date: '2026-05-29',
    productId: 2,
    productName: 'Conexão Tê',
    category: 'Ferragens',
    type: 'entrada',
    quantity: 100,
    unitPrice: 8.50,
    totalValue: 850.00,
    responsible: 'Pedro Santos',
    observation: 'Reposição estoque'
  },
  {
    id: 4,
    date: '2026-05-30',
    productId: 3,
    productName: 'Válvula de Retenção',
    category: 'Válvulas',
    type: 'saida',
    quantity: 5,
    unitPrice: 36.66,
    totalValue: 183.30,
    responsible: 'Ana Costa',
    observation: 'Venda projeto industrial'
  }
];