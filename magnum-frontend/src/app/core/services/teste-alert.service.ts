// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class TesteAlertService {
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  alert$: Observable<Alert | null> = this.alertSubject.asObservable();

  success(message: string) {
    console.log('✅ Sucesso:', message); // ← Adicione este log para debug
    this.alertSubject.next({ type: 'success', message });
  }

  danger(message: string, error?: any) {
    console.log('❌ Erro:', message, error); // ← Adicione este log
    this.alertSubject.next({ type: 'danger', message });
  }

  warning(message: string) {
    console.log('Warning:', message)
    this.alertSubject.next({ type: 'warning', message});
  }

  info(message: string) {
    console.log('ℹ️ Info:', message);
    this.alertSubject.next({ type: 'info', message });
  }

  // Método privado interno
  private showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string) {
    this.alertSubject.next({
      type,
      message
    });

    // Opcional: Auto-esconder após 5 segundos (se quiser comportamento temporário)
    setTimeout(() => this.alertSubject.next(null), 5000);
  }

  close() {
    console.log('🧹 Limpando alerta...');
    this.alertSubject.next(null);
  }
}