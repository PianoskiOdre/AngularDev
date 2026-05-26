import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertType } from '../../features/dashboard/alert/alert.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  showAlert: boolean = false;
  alertMessage = '';
  alertType: AlertType = 'info';

  constructor(
    private authService: AuthService,
    private router?: Router
  ) { }

  private readonly userKey = 'auth_user';
  private readonly tokenKey = 'auth_token';

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    if (token && typeof token === 'string') {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Verifica se o token está prestes a expirar
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        
        // Se faltam menos de 5 minutos para expirar, avisa o usuário
        if (expiry - Date.now() < 300000 && expiry > Date.now()) {
          console.warn('⚠️ Token prestes a expirar em 5 minutos!');
        }
        
        // Se já expirou, faz logout automático
        if (Date.now() >= expiry) {
          console.error('❌ Token expirado! Fazendo logout...');
          this.fazerLogout();
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }



    // 3. Envia a requisição e trata erros
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // Se o erro for 401 (Não Autorizado), significa que o token expirou ou é inválido
        if (error.status === 401) {
          console.warn('Sessão expirada ou token inválido. Realizando logout...');

          // Chama o logout do serviço para limpar localStorage/cookies
          this.authService.logout();

          // Opcional: Redireciona para login automaticamente
          if (this.router) {
            this.router.navigate(['/login']);
          } else {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
          }
        }

        return throwError(() => error);
      })
    );
  }

  private fazerLogout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.alertMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
    this.alertType = 'warning';
    this.showAlert = true;
    setTimeout(() => {
      this.router?.navigate(['/login']);
    }, 5000);
  }
}