import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  // @Input() labels: string[] = [];
  // @Input() data: number[] = [];
  // @Input() title: string = 'Gráfico';
  // @Input() colorScheme: 'default' | 'pastel' | 'vibrant' = 'default';
  // @Input() type: 'bar' | 'pie' = 'bar';

  // === GRÁFICO DE PIZZA (Produtos por Categoria) ===
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Produtos por Categoria'
      }
    }
  };

  public pieChartLabels: string[] = [];
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartColors = [
    {
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }
  ];

  // === GRÁFICO DE BARRAS (Top 5 Produtos Mais Caros) ===
  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 Produtos Mais Caros'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return 'R$ ' + value;
          }
        }
      }
    }
  };

  public barChartLabels: string[] = [];
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Preço (R$)', backgroundColor: '#36A2EB' }]
  };
  public barChartType: ChartType = 'bar';

  public opcoesGrafico: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.carregarGraficos();
  }

  // getColors(): string[] {
  //   const schemes = {
  //     default: ['#4CAF50', '#9C27B0', '#2196F3', '#00BCD4', '#E91E63', '#FF9800'],
  //     pastel: ['#A8E6CF', '#DCEDC8', '#FFD3B6', '#FFAAA5', '#FF8B94'],
  //     vibrant: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
  //     rainbow: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
  //     purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
  //   };
  //   return schemes[this.colorScheme];
  // }

  // getMax(): number {
  //   return this.data.length ? Math.max(...this.data) : 1;
  // }

  // getTotal(): number {
  //   return this.data.reduce((a, b) => a + b, 0);
  // }

  // getPieSegments() {
  //   if (!this.data.length) return [];

  //   const colors = this.getColors();
  //   const total = this.getTotal();
  //   let currentAngle = -90; // Começa do topo
  //   const centerX = 150;
  //   const centerY = 150;
  //   const radius = 125;

  //   return this.data.map((value, index) => {
  //     const percentage = (value / total) * 100;
  //     const angle = (value / total) * 360;
  //     const endAngle = currentAngle + angle;

  //     // Converte ângulos para radianos
  //     const startRad = (currentAngle * Math.PI) / 180;
  //     const endRad = (endAngle * Math.PI) / 180;

  //     // Calcula as coordenadas
  //     const x1 = centerX + radius * Math.cos(startRad);
  //     const y1 = centerY + radius * Math.sin(startRad);
  //     const x2 = centerX + radius * Math.cos(endRad);
  //     const y2 = centerY + radius * Math.sin(endRad);

  //     // Cria o path SVG
  //     const largeArcFlag = angle > 180 ? 1 : 0;
  //     const pathData = [
  //       `M ${centerX} ${centerY}`,
  //       `L ${x1} ${y1}`,
  //       `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
  //       'Z'
  //     ].join(' ');

  //     // Calcula a posição do label
  //     const midAngle = currentAngle + angle / 2;
  //     const midRad = (midAngle * Math.PI) / 180;
  //     const labelDist = radius + 40;
  //     const lineDist = radius + 20;

  //     const segment = {
  //       label: this.labels[index] || '',
  //       value,
  //       percentage,
  //       color: colors[index % colors.length],
  //       path: pathData,
  //       // Coordenadas para linha e texto
  //       lineX1: centerX + radius * Math.cos(midRad),
  //       lineY1: centerY + radius * Math.sin(midRad),
  //       lineX2: centerX + lineDist * Math.cos(midRad),
  //       lineY2: centerY + lineDist * Math.sin(midRad),
  //       textX: centerX + labelDist * Math.cos(midRad),
  //       textY: centerY + labelDist * Math.sin(midRad)
  //     };

  //     currentAngle = endAngle;
  //     return segment;
  //   });
  // }

  // getSegments() {
  //   return this.getPieSegments();
  // }

  carregarGraficos() {
    // Carregar produtos por categoria
    this.dashboardService.getProdutosPorCategoria().subscribe(dados => {
      this.pieChartLabels = dados.map(d => d.categoria);
      this.pieChartData = {
        labels: this.pieChartLabels,
        datasets: [{
          data: dados.map(d => d.quantidade),
          backgroundColor: dados.map(d => d.cor || this.gerarCorAleatoria())
        }]
      };
    });

    // Carregar top 5 produtos mais caros
    this.dashboardService.getTop5ProdutosCaros().subscribe(dados => {
      this.barChartLabels = dados.map(d => d.nome);
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [{
          data: dados.map(d => d.preco),
          label: 'Preço (R$)',
          backgroundColor: '#36A2EB'
        }]
      };
    });
  }

  gerarCorAleatoria() {
    const cores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return cores[Math.floor(Math.random() * cores.length)];
  }
}