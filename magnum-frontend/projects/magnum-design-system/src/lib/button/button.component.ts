import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'mds-button',
  standalone: false,
  template: `
    <button 
      [class]="'mds-btn mds-btn-' + variant + ' mds-btn-' + size" 
      [disabled]="disabled"
      [attr.aria-disabled]="disabled">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'danger' | 'warning' | 'success' | 'info' | 'outline-primary' | 'outline-secondary' | 'outline-tertiary' | 'outline-neutral' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' = 'primary';
  @Input() size: 'G' | 'L' | 'M' | 'S' | 'T' = 'M';
  @Input() disabled = false;
}
