import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { Resumo } from '../../../core/models/resumo.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  constructor(private produtoService: ProdutoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStockSummary();
    setInterval(() => this.loadStockSummary(), 5 * 60 * 1000); // a cada 5 min
    this.cdr.detectChanges();
  }

  loadStockSummary() {
    this.produtoService.getStockSummary().subscribe(data => {
      console.log('Responde: ', data);
      this.resumo = data;
      this.hasStockAlert = data.semEstoque > 0;
      this.cdr.detectChanges();
    });
  }
}
