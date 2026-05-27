import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { Resumo } from '../../../core/models/resumo.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardServiceMock } from '../../../shared/services/dashboard.service.mock';
import { DashboardStats } from '../../../shared/models/mock-data';

@Component({
  selector: 'app-stock-alert',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './stock-alert.component.html',
  styleUrls: ['./stock-alert.component.css'],
})
export class StockAlertComponent implements OnInit{
  resumo: Resumo | null = null;
  hasStockAlert: boolean = false;

  stats: DashboardStats | null = null;

  constructor(private produtoService: ProdutoService, private cdr: ChangeDetectorRef, private dashService: DashboardServiceMock) {}

  ngOnInit() {
    this.stockAlerts();
    this.loadStockSummary();
    setInterval(() => this.loadStockSummary(), 5 * 60 * 1000); // a cada 5 min
    this.cdr.detectChanges();
  }

  stockAlerts() {
    this.dashService.getDashboardStats().subscribe( data => {
      this.stats = data;
    })
  }

  loadStockSummary() {
    this.dashService.getDashboardStats().subscribe(data => {
      console.log('Responde: ', data);
      this.stats = data;
      this.hasStockAlert = data.lowStockAlerts.length > 0;
      this.cdr.detectChanges();
    });
  }
}
