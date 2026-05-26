import { Component, forwardRef, Input, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mds-pagination',
  standalone: false,
  template: `
    <div class="mds-pagination">
        <button class="mds-pagination-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1; onChange(currentPage)">
            &laquo; Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="mds-pagination-btn" [disabled]="currentPage === totalPages || disabled" (click)="currentPage = currentPage + 1; onChange(currentPage)">
            Próxima &raquo;
        </button>
    </div>
  `,
  styles: [`
    .mds-pagination {
      display: flex;
      justify-content: center;
    }

    .mds-pagination-btn {
      background-color: var(--mds-color-primary);
      color: black;
    }

    .mds-pagination-btn:disabled {
      background-color: var(--mds-color-disabled);
      cursor: not-allowed;
    }
  `]
})
export class PaginationComponent implements OnChanges {
    @Input() totalItems: number = 0;
    @Input() itemsPerPage: number = 10;
    @Input() disabled: boolean = false;
    currentPage: number = 1;
    totalPages: number = 1;
    onChange: any = () => {};
    onTouchedCallback: any = () => {};

    ngOnChanges() {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
            this.onChange(this.currentPage);
        }
    }

    writeValue(value: any): void {
        if (value !== undefined) {
            this.currentPage = value;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }
}