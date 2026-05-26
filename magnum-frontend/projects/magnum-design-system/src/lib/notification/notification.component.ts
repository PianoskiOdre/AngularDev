import { Component, Input, OnInit, OnDestroy, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'mds-notification',
  standalone: false,
  template: `
    <div class="mds-notification mds-notification-{{ type }}" [@fadeInOut]>
      <div class="mds-notif-icon">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="mds-notif-content">
        <strong>{{ title }}</strong>
        <p>{{ message }}</p>
      </div>
      <button class="mds-notif-close" (click)="close.emit()">&times;</button>
    </div>
  `,
  styleUrls: ['./notification.component.css'],
  encapsulation: ViewEncapsulation.None,
  // Se quiser animação, precisa importar BrowserAnimationsModule no app principal
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ] 
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() type: 'success' | 'danger' | 'warning' | 'info' = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  
  // Evento para fechar manualmente
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    // Auto-fechar após 5 segundos (opcional)
    setTimeout(() => {
      this.close.emit();
    }, 5000);
  }

  ngOnDestroy() {
    // Limpeza se necessário
  }
}