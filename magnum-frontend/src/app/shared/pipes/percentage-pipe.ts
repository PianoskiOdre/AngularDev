import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage',
  standalone: true
})
export class PercentagePipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value == null) return '--';
    // Se o valor for menor que 1, assume que é decimal (ex: 0.4 = 40%)
    // Se for >= 1, assume que já é porcentagem (ex: 40 = 40%)
    const percentage = value < 1 ? value * 100 : value;
    return `${percentage.toFixed(decimals)}%`;
  }
}