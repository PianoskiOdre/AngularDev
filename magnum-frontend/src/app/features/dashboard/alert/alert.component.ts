import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorIconCompoment } from '../../../canvas/shared/icons/error-icon.component';
import { WarningIconComponent } from '../../../canvas/shared/icons/warning-icon.component';
import { SuccessIconComponent } from '../../../canvas/shared/icons/success-icon.component';
import { InfoIconComponent } from '../../../canvas/shared/icons/info-icon.component';
import { trigger, transition, style, animate } from '@angular/animations';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  imports: [
    FormsModule,
    CommonModule,
    ErrorIconCompoment,
    WarningIconComponent,
    SuccessIconComponent,
    InfoIconComponent
  ],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
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
export class AlertComponent implements OnInit, AfterViewInit {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';
  @Input() autoClose: boolean = true;
  @Input() duration: number = 5000;

  @Output() closed = new EventEmitter<void>();

  visible: boolean = false;

  isLeaving: boolean = false;

  ngOnInit(): void {
    if(this.autoClose) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngAfterViewInit(): void {
    
  }

  close() {
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, 100);
  }

  get alertClass(): string {
    switch (this.type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-error';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  }
}
