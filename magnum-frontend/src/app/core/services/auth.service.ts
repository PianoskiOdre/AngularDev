import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../models/auth.response';
import { User } from '../../models/user.response';
import { UsuarioLogado } from '../../models/logado.usuarios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Environment é variáveis chama API
  apiEndpoint = environment.apiUrl;
  apiDuration = environment.apiTimeout;

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly refreshKey = 'refresh_token';
  private readonly expiresKey = 'auth_expires';

  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const user = localStorage.getItem(this.userKey);
    this.userSubject = new BehaviorSubject<User | null>(user ? JSON.parse(user) : null);
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  login(identifier: string, password: string, rememberMe: boolean): Observable<any> {

    const body = {
      identifier: identifier,
      password: password,
      rememberMe: rememberMe
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiEndpoint}/auth/login`, body, { headers }).pipe(
      tap(response => {
        if (response.success) {
          const session: User = {
            email: response.email,
            expiracao: response.expiration, // ← AQUI ESTÁ A CORREÇÃO!
            id: response.userId,
            nome: response.userNametag,
            roles: response.roles,
            token: response.token,
            refreshToken: response.refreshToken
          };

          // Salva no localStorage (ou sessionStorage se preferir)
          localStorage.setItem(this.userKey, JSON.stringify(session));
          this.userSubject.next(session);
        }
        console.log('Resposta do BACKEND:', response);

        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedInSubject.next(true);

      }),
      catchError(error => {
        console.error('X Erro completo:', error);
        console.error('Status:', error.status);
        console.error('Headers da resposta:', error.headers);
        throw error;
      })
    );
  }

  setUsuarioLogado(usuario: UsuarioLogado): void {
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
  }

  getUsuarioLogado(): UsuarioLogado | null {
    const data = localStorage.getItem(this.userKey);
    if (!data) return null;

    try {
      return JSON.parse(data) as UsuarioLogado;
    } catch (e) {
      console.error('Erro ao parsear usuário logado:', e);
      return null;
    }
  }

  getPerfil(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiEndpoint}/Usuarios/perfil`, { headers })
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    const usuario = this.getUsuarioLogado();
    return usuario ? usuario.token : null;
  }

  getUserRole(): string | null {
    const usuario = this.getUsuarioLogado();
    if (usuario && usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0) {
      return usuario.roles[0]; // Retorna o primeiro role (ex: "Administrador")
    }
    return null;
  }

  hasRole(roleName: string): boolean {
    const usuario = this.getUsuarioLogado();
    if (usuario && usuario.roles && Array.isArray(usuario.roles)) {
      return usuario.roles.includes(roleName);
    }
    return false;
  }

  isAdmin(): boolean {
    return this.hasRole('Administrador') || this.hasRole('Admin');
  }

  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  logout(): Observable<any> {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.expiresKey);
    this.userSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
    return of({ success: true });
  }

  // Verifica se há usuário logado
  isLoggedIn(): boolean {
    return !!this.getUsuarioLogado();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  initAuth() {
    this.isLoggedInSubject.next(this.hasToken());
  }

  validateToken(): Observable<any> {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      return of({ isValid: false });
    }

    return this.http.get(`${this.apiEndpoint}/auth/validate-token`).pipe(
      map(res => ({ isValid: true })),
      catchError(err => {
        if (err.status === 401 || err.status === 0) {
          return of({ isValid: false });
        }
        throw err;
      })
    )
  }
}