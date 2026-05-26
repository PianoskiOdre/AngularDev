export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  estoque: number;
  precoCusto?: number;
  precoVenda?: number;
  codigoBarras: string;
}

export interface ProdutoPut {
  id: number;
  nome: string;
  categoria: string;
  estoque: number;
  precoCusto?: number;
  precoVenda?: number;
}