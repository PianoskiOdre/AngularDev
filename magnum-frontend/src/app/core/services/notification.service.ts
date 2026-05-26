import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationData {
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root' // Disponível em todo o app
})
export class NotificationService {
  // Usamos BehaviorSubject para avisar quem está ouvindo quando muda
  private notificationSubject = new BehaviorSubject<NotificationData | null>(null);
  
  // Observable público para o App Component assinar
  notification$ = this.notificationSubject.asObservable();

  // Métodos fáceis para chamar
  success(title: string, message: string) {
    this.show('success', title, message);
  }

  danger(title: string, message: string) {
    this.show('danger', title, message);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  private show(type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) {
    this.notificationSubject.next({ type, title, message });
    
    // Opcional: Limpa a notificação após 5 segundos automaticamente
    setTimeout(() => {
      this.notificationSubject.next(null);
    }, 5000);
  }

  close() {
    this.notificationSubject.next(null);
  }
}