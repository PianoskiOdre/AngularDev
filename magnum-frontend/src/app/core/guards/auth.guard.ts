import { inject, Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');

  // Verifica permissão específica (se definida na rota)
  const expectedRole = route.data['role'];
  if (expectedRole) {
    const userRole = authService.getUserRole(); // Você precisa criar esse método no AuthService

    // Se o role do usuário não bater com o esperado, bloqueia
    if (userRole !== expectedRole && userRole !== 'Administrador') {
      // Dica: Admin geralmente pode acessar tudo, então liberamos se for Admin
      alert('Acesso negado: Você não tem permissão para acessar esta página.');
      router.navigate(['/dashboard']);
      return false;
    }
  }

  // Verifica se está logado
  if (!token) {
    console.log('Sem token. Redirecionando para login...');
    router.navigate(['/login']);
    return false;
  }

  console.log('Validando token no backend...');

  return authService.validateToken().pipe(
    map(res => {
      if (res.isValid) {
        console.log('Token válido!');
        return true;
      } else {
        console.log('Toekn inválido. Redirecionando para login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(err => {
      console.log('Erro ao validar token (backend offline?):', err);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      router.navigate(['/login']);
      return of(false);
    })
  );
}