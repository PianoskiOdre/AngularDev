import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Venda } from '../models/venda.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  apiEndpoint = environment.apiUrl;

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private authService: AuthService) { }

//   getProdutos(): Observable<Produto[]> {
//     const token = this.authService.getToken();
//     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
//     return this.http.get<Produto[]>(`${this.apiEndpoint}/Produtos`, { headers });
//   }

  adicionarVenda(venda: Omit<Venda, 'id'>): Observable<Venda> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Venda>(`${this.apiEndpoint}/Venda`, venda, { headers });
  }
}