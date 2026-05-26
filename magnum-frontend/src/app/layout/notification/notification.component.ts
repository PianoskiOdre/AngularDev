import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type NotType = 'success' | 'error';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
    @Input() message: string = '';
    @Input() type: NotType = 'error';
    @Input() autoClose: boolean = true;
    @Input() duration: number = 5000;
    visible: boolean = false;

    isLeaving: boolean = false;

    ngAfterViewInit(): void {
    if(this.autoClose) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

    open() {
        this.visible = true;
    }

    close() {
        this.visible = true;

        setTimeout(() => {
            this.visible = false;
            this.isLeaving = false;
        }, 100);
    }

    get notFon(): string {
        switch (this.type) {
            case 'success': return 'success';
            case 'error' : return 'error';
            default: return 'error';
        }
    }
}