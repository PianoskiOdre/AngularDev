import { Component, Input, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'ds-alert-stock',
    standalone: false,
    template: `
        <div [class]="'ds-alert-stock ds-alert-stock-' + type" role="alert">
      <div class="ds-alert-stock-icon">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="ds-alert-stock-content">
        <ng-content></ng-content>
      </div>
    </div>
    `,
    styleUrls: ['./alert-stock.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AlertStockComponent {
    @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';
}