import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Resumo } from '../models/resumo.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  apiEndpoint = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProdutosPorCategoria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiEndpoint}/Dashboard/produtos-por-categoria`);
  }

  getTop5ProdutosCaros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiEndpoint}/Dashboard/top-5-produtos-caros`);
  }

  getResumo(): Observable<Resumo> {
    return this.http.get<Resumo>(`${this.apiEndpoint}/Dashboard/resumo`);
  }
}