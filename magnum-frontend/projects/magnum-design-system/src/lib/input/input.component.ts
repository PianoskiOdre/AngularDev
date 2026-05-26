import { Component, forwardRef, input, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'mds-input',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="mds-input-wrapper">
      <label *ngIf="label" [for]="id" class="mds-label">{{ label }}</label>

      <div class="mds-input-container"> <!-- Wrapper para posicionar ícone -->

        <!-- Ícone à esquerda (opcional) -->
        <div class="mds-input-icon-left" *ngIf="hasLeftIcon">
          <ng-content select="[icon-left]"></ng-content>
        </div>
        
        <input 
          [id]="id" 
          [type]="type"
          [readonly]="readonly"
          [placeholder]="placeholder" 
          [disabled]="isDisabled"
          [value]="value" 
          (input)="onInput($event)"
          class="mds-input-field"
        />

        <!-- Ícone à direita (ex: mostrar/ocultar senha) -->
        <div class="mds-input-icon-right" *ngIf="hasRightIcon">
          <ng-content select="[icon-right]"></ng-content>
        </div>

        <!-- MENSAGEM DE ERRO (Small) -->
        <small *ngIf="errorMessage" class="mds-error-message">
          {{ errorMessage }}
        </small>

      </div>
    </div>
  `,
  styles: [`
    .mds-input-wrapper { 
      display: flex; 
      flex-direction: column;
    }

    .mds-input-error {
      margin-top: 4px;
    }

    .mds-error-message {
      color: var(--status-danger); /* Usa variável global para cor de erro */
      font-size: 0.8rem;
    }

    .mds-input-value {
      margin-top: 4px;
      font-size: 0.9rem;
      color: var(--mds-font-secondary); /* Usa variável global para cor de texto secundário */
    }
    
    .mds-label { 
      font-weight: 600; 
      margin-bottom: 4px; 
      font-size: 0.9rem; 
      color: var(--mds-font-base); /* Ou uma cor de texto definida */
    }
    
    .mds-input-field { 
      width: 100%;
      height: 48px;
      padding: var(--mds-spacing-sm) var(--mds-spacing-md);
      border: 1px solid #ccc; 
      border-radius: var(--mds-radius-sm);
      font-family: var(--mds-font-base);
      transition: border-color 0.2s;
    }

    .mds-input-field:focus {
      outline: none;
      border-color: var(--yellow-500);
      box-shadow: 0 0 0 2px #ffe3666e; /* Efeito de foco acessível */
    }

    /* ESTILO PARA CAMPOS READONLY */
    .mds-input-field[readonly] {
      background-color: #f8f9fa;       /* Fundo cinza claro */
      color: #6c757d;                  /* Texto cinza escuro */
      cursor: not-allowed;             /* Cursor de "proibido" */
      border-color: #dee2e6;           /* Borda mais clara */
    }

    /* Opcional: Efeito de foco removido para readonly */
    .mds-input-field[readonly]:focus {
      outline: none;
      box-shadow: none;
      border-color: #dee2e6;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() errorMessage: string = '';
  @Input() isDisabled: boolean = false;
  @Input() value?: string = '';
  hasLeftIcon: boolean = false;
  hasRightIcon: boolean = false;

  // Funções de callback do ControlValueAccessor
  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledstate?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }
}