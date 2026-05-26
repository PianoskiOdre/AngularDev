import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-chart',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loading-chart.component.html',
  styleUrls: ['./loading-chart.component.css']
})
export class LoadingChartComponent implements OnInit {

  @Input() progressFill: number = 0;

  // Dados simulados para os gráficos
  pieData = [30, 45, 25]; // valores das fatias
  barData = [10, 25, 40, 60, 80]; // alturas das barras

  loadingProgress = 0;

  ngOnInit() {
    this.startLoading();
  }

  startLoading() {
    const interval = setInterval(() => {
      if (this.loadingProgress >= 100) {
        clearInterval(interval);
        return;
      }
      this.loadingProgress += 2; // incrementa 2% a cada 50ms
    }, 50);
  }

  // Função auxiliar para calcular o ângulo de cada fatia do pie chart
  getPieSliceAngle(value: number): number {
    const total = this.pieData.reduce((a, b) => a + b, 0);
    return (value / total) * 360;
  }

  // Função para gerar o estilo de rotação de cada fatia
  getPieSliceStyle(index: number): { transform: string; background: string } {
    const colors = ['#4facfe', '#ff9a9e', '#f6d365'];
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += this.getPieSliceAngle(this.pieData[i]);
    }
    return {
      transform: `rotate(${startAngle}deg)`,
      background: `conic-gradient(from ${startAngle}deg, ${colors[index]} 0deg ${this.getPieSliceAngle(this.pieData[index])}deg, transparent ${this.getPieSliceAngle(this.pieData[index])}deg)`
    };
  }
}