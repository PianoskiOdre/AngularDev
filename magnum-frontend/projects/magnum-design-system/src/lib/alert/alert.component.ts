import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, EventEmitter, Output, AfterViewInit, ChangeDetectorRef } from '@angular/core';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'mds-alert',
  standalone: false,
  template: `
      <div [class.mds-alert-exit]="isLeaving" class="mds-alert {{ alertClass }}">
      <div class="mds-alert-icon">
        <ng-container [ngSwitch]="type">
          <mds-icon-success *ngSwitchCase="'success'"></mds-icon-success>
          <mds-icon-danger *ngSwitchCase="'danger'"></mds-icon-danger>
          <mds-icon-warning *ngSwitchCase="'warning'"></mds-icon-warning>
          <mds-icon-info *ngSwitchDefault></mds-icon-info>
        </ng-container>
      </div>
        <span class="mds-alert-message">{{ message }}</span>
        <button type="button" class="mds-alert-close" (click)="onCloseClick()" aria-label="Fechar">&times;</button>
      </div>
  `,
  styleUrls: ['./alert.component.css'],
  encapsulation: ViewEncapsulation.None,
  // Se quiser animação, precisa importar BrowserAnimationsModule no mds principal
  animations: []
})
export class AlertComponent implements OnInit, OnDestroy, AfterViewInit {
  
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  
  // Evento para fechar manualmente
  @Output() close = new EventEmitter<void>();

  isLeaving = false;
  private destroyTimer: any;

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Auto-fechar após 5 segundos (opcional)
    setTimeout(() => {
      this.startExitAnimation();
    }, 5000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isLeaving = true; // Dispara animação de entrada
      this.cdr.detectChanges();
    }, 5000); // Pequeno delay para garantir que a animação seja aplicada corretamente
  }

  ngOnDestroy() {
    // Limpeza se necessário
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer); // ← Limpa o timer ao destruir o componente
    }
  }

  startExitAnimation() {
    this.isLeaving = true; // Dispara animação de saída
    
    // Espera a animação terminar antes de emitir close
    setTimeout(() => {
      this.isLeaving = true;
      this.close.emit();
    }, 300); // Mesmo tempo da animação CSS/TS
  }

  onCloseClick() {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer); // ← Cancela o auto-fechamento!
    }
    this.startExitAnimation();
  }

  get alertClass(): string {
    switch (this.type) {
      case 'success': return 'mds-alert-success';
      case 'danger': return 'mds-alert-danger';
      case 'warning': return 'mds-alert-warning';
      case 'info': return 'mds-alert-info';
      default: return 'mds-alert-info';
    }
  }
}