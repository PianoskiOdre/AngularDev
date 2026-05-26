import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { FiltroMovimento, Movimento } from '../models/movimento.model';

@Injectable({
  providedIn: 'root'
})
export class MovimentoService {
  apiEndpoint = environment.apiUrl;

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getRelatorio(filtro: FiltroMovimento): Observable<Movimento[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json'); // Importante para POST
    
    return this.http.post<Movimento[]>(`${this.apiEndpoint}/Movimento/relatorio`, filtro, { headers });
  }
}