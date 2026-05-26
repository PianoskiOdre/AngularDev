// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeoutMs?: number; // opcional: sobrescreve padrão
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  private nextId = 1;
  private timeouts: Map<number, any> = new Map(); // id → timeout ref

  add(message: string, type: Alert['type'], timeoutMs: number = 3000): void {
    const id = this.nextId++;
    const alert: Alert = { id, message, type, timeoutMs };

    // Adiciona ao array
    const current = this.alertsSubject.value;
    this.alertsSubject.next([...current, alert]);

    // Agenda remoção
    const timer = setTimeout(() => {
      this.remove(id);
    }, timeoutMs);

    this.timeouts.set(id, timer);
  }

  remove(id: number): void {
    const current = this.alertsSubject.value;
    const updated = current.filter(a => a.id !== id);
    this.alertsSubject.next(updated);

    // Limpa timeout
    const timer = this.timeouts.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(id);
    }
  }

  // Para limpar todos (ex: ao sair da página)
  clearAll(): void {
    this.alertsSubject.next([]);
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
  }
}