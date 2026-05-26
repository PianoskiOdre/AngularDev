import { Component, Input } from '@angular/core';
import { IconName, ICONS } from '../icons/icons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'mds-card',
    standalone: false,
    template: `
      <div class="mds-card__grid">
        <div *ngIf="title || value ?? '--' || subtitle" class="mds-card">

          <div class="mds-card__header">
            <h3 *ngIf="title" class="mds-card__title">{{ title }}</h3>
          <div [ngClass]="iconClass" class="mds-icon__circle" [innerHTML]="getIconSvg(iconName)"></div>
          </div>
          <div class="mds-card__container">
            <p *ngIf="value" class="mds-card__value">{{ value ?? '--' }}</p>
            <p *ngIf="subtitle" class="mds-card__subtitle">{{ subtitle }}</p>
          </div>

        </div>
      </div>
    `,
    styles: [`
    :host {
      display: block;
      /* Variáveis do Design System para consistência */
      --mds-card-bg: #ffffff;
      --mds-card-border-radius: 8px;
      --mds-card-padding: 16px;
      --mds-card-shadow-0: none;
      --mds-card-shadow-1: 0 2px 4px rgba(0,0,0,0.1);
      --mds-card-shadow-2: 0 4px 8px rgba(0,0,0,0.12);
    }

    .mds-card__grid {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    .mds-card {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .mds-card:hover {
      transform: translateY(-2px);
    }

    .mds-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .mds-card__title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: #333;
    }

    .mds-card__container {
      display: flex;
      align-items: center;
    }

    .mds-card__value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
    }

    .mds-card__subtitle {
      margin-left: 15px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .mds-icon__circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .mds-icon__circle:not([class*="mds-icon__"]) {
      background-color: #6b7280;
    }

    .mds-card__content {
      padding: var(--mds-card-padding);
      color: #444;
      line-height: 1.5;
    }

    .mds-card__actions {
      padding: 8px var(--mds-card-padding);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Acessibilidade: Foco visível para navegação por teclado */
    .mds-card:focus-within {
      outline: 2px solid #0056b3; /* Cor de destaque do seu sistema */
      outline-offset: 2px;
    }

    /* Cores dos fundos dos ícones */
    .icon-blue {
        background-color: #4f46e5 !important;
        /* Azul indigo */
    }

    .icon-green {
        background-color: #10b981;
        /* Verde esmeralda */
    }

    .icon-emerald {
        background-color: #22c55e;
        /* Verde padrão */
    }

    .icon-orange {
        background-color: #f97316;
        /* Laranja */
    }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CardComponent {
    @Input() title?: string;
    @Input() value?: string | number | null = null;
    @Input() subtitle?: string;
    @Input() iconClass: string = 'icon-blue'; // Valor padrão
    @Input() iconName: IconName = 'cube';

    // Nível de elevação (0, 1, 2) para sombras
    @Input() elevation: number = 1;

    // Verifica se há conteúdo projetado nas ações
    hasActions: boolean = false;

    // Você pode usar ngAfterContentInit para detectar se há ações projetadas
    // ou simplificar deixando sempre o footer renderizado condicionalmente via CSS se vazio.
    protected readonly ICONS = ICONS;

    // Injeta o DomSanitizer no construtor
    constructor(private sanitizer: DomSanitizer) {}

    // Cria um método seguro para retornar o HTML do ícone
    getIconSvg(iconName: IconName): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(this.ICONS[iconName]);
    }
}