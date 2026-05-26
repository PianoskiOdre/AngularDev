import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Produto, ProdutoPut } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  apiEndpoint = environment.apiUrl;

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getProdutos(): Observable<Produto[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Produto[]>(`${this.apiEndpoint}/Produtos`, { headers });
  }

  // Dentro da classe ProdutoService
  adicionarProduto(produto: Omit<Produto, 'id'>): Observable<Produto> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Produto>(`${this.apiEndpoint}/Produtos`, produto, { headers });
  }

  excluirProduto(id: number): Observable<void> {
    const token = localStorage.getItem(this.tokenKey); // ou use seu AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiEndpoint}/Produtos/${id}`, { headers }).pipe(
      catchError(error => {
        console.error('O servidor retornou 400:', error.error); // Log the actual server message
        throw error;
      })
    );
  }

  // Adicione este novo método ao seu serviço
  buscarPorNome(nome: string): Observable<Produto[]> {
    const token = localStorage.getItem(this.tokenKey);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // A URL agora aponta para o novo endpoint que criamos
    // E passa o 'nome' como um parâmetro de query
    return this.http.get<Produto[]>(`${this.apiEndpoint}/Produtos/buscar`, {
      headers,
      params: { nome: nome } // Isso adiciona ?nome=... à URL
    });
  }

  atualizarProduto(id: number, produtoPut: ProdutoPut): Observable<ProdutoPut> {
    const token = localStorage.getItem(this.tokenKey);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<ProdutoPut>(`${this.apiEndpoint}/Produtos/${id}`, produtoPut, { headers });
  }

  exportarExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return this.http.get(`${this.apiEndpoint}/Produtos/exportar/excel`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  getProdutosPorPagina(page: number, size: number): Observable<any> {
    const token = localStorage.getItem(this.tokenKey);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiEndpoint}/Produtos/paginacao`, {
      headers,
      params: { page, size }
    });
  }

  // NOVO MÉTODO: Exportar apenas selecionados
  exportarSelecionadosExcel(ids: number[]): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return this.http.post(`${this.apiEndpoint}/Produtos/exportar/excel/selecionados`, ids, {
      headers: headers,
      responseType: 'blob'
    });
  }
  
  // Método para listar produtos (se ainda não tiver)
  listarProdutos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiEndpoint}/Produtos/teste`);
  }

  getStockSummary(): Observable<any> {
    return this.http.get(`${this.apiEndpoint}/Produtos/summary/stock`);
  }
}