// src/app/services/dashboard.service.mock.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardStats, MOCK_DASHBOARD_STATS, MOCK_PRODUCTS, Product } from '../models/mock-data';

@Injectable({ providedIn: 'root' })
export class DashboardServiceMock {

  private STORAGE_KEY = 'magnum_products_mock';

  // Helper para ler do localStorage (igual ao ProductService)
  private getProductsFromStorage(): Product[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getDashboardStats(): Observable<DashboardStats> {
    // ✅ CORREÇÃO: Lê os produtos ATUAIS do localStorage, não da constante MOCK_PRODUCTS
    const currentProducts = this.getProductsFromStorage();

    // Calcula estatísticas baseadas nos dados reais salvos
    const totalProducts = currentProducts.length;

    const stockValue = currentProducts.reduce((sum, p) => {
      // Garante que preço e estoque sejam números válidos
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      return sum + (price * stock);
    }, 0);

    // Simula lucro e margem (pode ser ajustado conforme sua regra de negócio)
    // Aqui estamos assumindo uma margem média fixa para demonstração
    const totalProfit = stockValue * 0.3889; // Exemplo baseado na sua margem de ~38%
    const averageMargin = 38.89;

    // Filtra alertas de estoque baixo (<= 5 unidades)
    const lowStockAlerts = currentProducts
      .filter(p => (Number(p.stock) || 0) <= 5)
      .map(p => ({
        count: 1,
        message: `Produto "${p.name}" tem apenas ${p.stock} unidades.`
      }));

    const stats: DashboardStats = {
      totalProducts,
      stockValue,
      totalProfit,
      averageMargin,
      lowStockAlerts
    };

    console.log('Estatísticas Calculadas:', stats); // Debug
    return of(stats).pipe(delay(1000));
  }
}