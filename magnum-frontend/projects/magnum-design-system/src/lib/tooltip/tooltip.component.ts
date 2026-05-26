import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'mds-tooltip',
    standalone: false,
    template: `
        <div class="mds-tooltip">
            <ng-content></ng-content>
            <span class="mds-tooltip__text">{{ text }}</span>
        </div>
    `,
    styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent {
    @Input() text: string = '';
    @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
    @Input() disabled: boolean = false;
    @Output() tooltipShown = new EventEmitter<void>();
    @Output() tooltipHidden = new EventEmitter<void>();

    showTooltip(): void {
        if (!this.disabled) {
            this.tooltipShown.emit();
        }
    }

    hideTooltip(): void {
        if (!this.disabled) {
            this.tooltipHidden.emit();
        }
    }

}