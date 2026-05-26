import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mds-checkbox',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label [for]="id" class="mds-checkbox-container" [class.disabled]="disabled">
        <input
            type="checkbox"
            [id]="id"
            [checked]="value"
            [disabled]="disabled"
            (change)="onCheckboxChange($event)"
            (blur)="onTouched()"
            class="mds-checkbox-input"
        />
        <span class="mds-checkbox-custom"></span>
        <span class="mds-checkbox-label" *ngIf="label">{{ label }}</span>
    </label>
  `,
  styles: [
    `
        .mds-checkbox-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-left: 30px;
  min-height: 20px;
}

.mds-checkbox-container.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.mds-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.mds-checkbox-input:checked ~ .mds-checkbox-custom {
  background-color: #007bff;
  border-color: #007bff;
}

.mds-checkbox-input:checked ~ .mds-checkbox-custom::after {
  display: block;
}

.mds-checkbox-input:focus ~ .mds-checkbox-custom {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.mds-checkbox-input:disabled ~ .mds-checkbox-custom {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.mds-checkbox-custom {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #ced4da;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.mds-checkbox-custom::after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.mds-checkbox-label {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
  
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() id: string = `mds-checkbox-${Math.random().toString(36).substr(2, 9)}`;

  private _value: boolean = false;
  public onChange: any = () => {};
  public onTouched: any = () => {};

  get value(): boolean {
    return this._value;
  }

  set value(val: boolean) {
    this._value = val;
    this.onChange(val);
  }

  writeValue(value: boolean): void {
    this._value = value || false;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.checked;
    this.onTouched();
  }
}