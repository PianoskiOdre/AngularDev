export interface Product {
  id: number;
  name: string;
  category: string;
  code_sku: string;
  price: number;
  sale: number;
  stock: number;
  // lastUpdate: string;
  ativo: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  stockValue: number;
  totalProfit: number;
  averageMargin: number;
  lowStockAlerts: { count: number; message: string }[];
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Tubo PVC 50mm', category: 'PVC', code_sku: 'TUB-050', price: 15.90, sale: 26.50, stock: 120, ativo: true },
  { id: 2, name: 'Conexão Tê', category: 'Ferragens',code_sku: 'CT', price: 8.50, sale: 14.16, stock: 45, ativo: true },
  { id: 3, name: 'Válvula de Retenção', category: 'Válvulas', code_sku: 'VR', price: 22.00, sale: 36.66, stock: 0, ativo: true },
  { id: 4, name: 'Curva 90°', category: 'PVC', code_sku: 'C-90', price: 6.75, sale: 11.25, stock: 88, ativo: true },
  { id: 5, name: 'Registro de Gaveta', category: 'Válvulas', code_sku: 'RG', price: 35.00, sale: 58.33, stock: 12, ativo: true },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalProducts: MOCK_PRODUCTS.length,
  stockValue: MOCK_PRODUCTS.reduce((sum, p) => sum + (p.price * p.stock), 0),
  totalProfit: 65.00, // Exemplo fixo
  averageMargin: 38.89,
  lowStockAlerts: [
    { count: 1, message: 'Existem 1 produto(s) com quantidade zero.' }
  ]
};