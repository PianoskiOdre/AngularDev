// src/app/services/movement.service.mock.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_MOVEMENTS, Movement } from '../models/mock-movement';

@Injectable({ providedIn: 'root' })
export class MovementServiceMock {

  private STORAGE_KEY = 'magnum_movements_mock';

  constructor() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(MOCK_MOVEMENTS));
    }
  }

  private getMovementsFromStorage(): Movement[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveMovementsToStorage(movements: Movement[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movements));
  }

  // ✅ OBTER TODAS AS MOVIMENTAÇÕES
  getAllMovements(): Observable<Movement[]> {
    const movements = this.getMovementsFromStorage();
    return of(movements).pipe(delay(800));
  }

  // ✅ FILTRAR POR PERÍODO E TIPO
  filterMovements(startDate: string, endDate: string, type?: 'entrada' | 'saida'): Observable<Movement[]> {
    let movements = this.getMovementsFromStorage();

    // Filtra por data
    movements = movements.filter(m => m.date >= startDate && m.date <= endDate);

    // Filtra por tipo se informado
    if (type) {
      movements = movements.filter(m => m.type === type);
    }

    return of(movements).pipe(delay(800));
  }

  // ✅ ADICIONAR NOVA MOVIMENTAÇÃO (para testes futuros)
  addMovement(movement: Movement): Observable<Movement> {
    const movements = this.getMovementsFromStorage();
    const newMovement = { ...movement, id: Date.now() };
    movements.push(newMovement);
    this.saveMovementsToStorage(movements);
    return of(newMovement).pipe(delay(600));
  }
}