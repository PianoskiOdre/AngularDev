import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { IconName, ICONS } from '../canvas/shared/icons/icons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string | number | null = null;
  @Input() subtitle: string = '';
  @Input() iconClass: string = 'icon-blue'; // Valor padrão
  @Input() iconName: IconName = 'cube';

  protected readonly ICONS = ICONS;

  // Injeta o DomSanitizer no construtor
  constructor(private sanitizer: DomSanitizer) {}

  // Cria um método seguro para retornar o HTML do ícone
  getIconSvg(iconName: IconName): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.ICONS[iconName]);
  }
}
