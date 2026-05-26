import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'mds-select',
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ],
    template: `
    <div class="mds-select-wrapper" [class.mds-select--disabled]="disabled">
  <label *ngIf="label" [attr.for]="id" class="mds-select__label">
    {{ label }}
  </label>
  
  <div class="mds-select__container">
    <select 
      [id]="id" 
      [value]="value" 
      (change)="onSelectChange($event)"
      [disabled]="disabled"
      class="mds-select__input"
      [attr.aria-required]="required"
      [attr.aria-invalid]="!!errorMessage"
    >
      <option *ngFor="let option of normalizedOptions" [value]="getOptionValue(option)">
        {{ getOptionLabel(option) }}
      </option>
    </select>
    
    <!-- Ícone de seta customizado (SVG) -->
    <span class="mds-select__icon">
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>

  <span *ngIf="errorMessage" class="mds-select__error">
    {{ errorMessage }}
  </span>
</div>
  `,
    styles: [`
    /* Container Principal */
.mds-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Ou sua fonte padrão */
  width: 100%;
  max-width: 300px; /* Ajuste conforme necessário */
}

/* Label */
.mds-select__label {
  font-size: 14px;
  font-weight: 500;
  color: #333; /* Cor neutra escura */
  margin-bottom: 4px;
}

/* Container do Input (para posicionar o ícone) */
.mds-select__container {
  position: relative;
  width: 100%;
}

/* O Select Nativo Estilizado */
.mds-select__input {
  width: 100%;
  padding: 10px 32px 10px 12px; /* Espaço à direita para o ícone */
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none; /* Remove estilo nativo do browser */
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Estado Hover */
.mds-select__input:hover:not(:disabled) {
  border-color: #007bff; /* Azul padrão ou cor da sua marca */
}

/* Estado Focus (Crucial para acessibilidade) */
.mds-select__input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); /* Anel de foco visível */
}

/* Estado Disabled */
.mds-select__input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}

/* Ícone de Seta Customizado */
.mds-select__icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Clique passa através do ícone */
  color: #666;
}

/* Mensagem de Erro */
.mds-select__error {
  font-size: 12px;
  color: #d32f2f; /* Vermelho de erro */
  margin-top: 4px;
}

/* Borda vermelha quando há erro */
.mds-select__input[aria-invalid="true"] {
  border-color: #d32f2f;
}

.mds-select__input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.25);
}
  `]
})
export class SelectComponent implements ControlValueAccessor {
    @Input() label?: string = '';
    @Input() options?: { value: any, label: string }[] | string[] = [];
    @Input() disabled: boolean = false;
    @Input() required: boolean = false;
    @Input() errorMessage: string = '';
    @Input() id: string = 'mds-select-' + Math.random().toString(36).substr(2, 9);
    @Input() value?: string = '';

    @Output() valueChange = new EventEmitter<any>();

    onChange: any = () => { };
    onTouched: any = () => { };

    // GETTER QUE NORMALIZA OS DADOS PARA O TEMPLATE
    get normalizedOptions(): ({ value: any, label: string })[] {
        if (!this.options) return [];
        
        // Se for array de strings, converte para array de objetos
        if (Array.isArray(this.options) && this.options.length > 0 && typeof this.options[0] === 'string') {
            return (this.options as string[]).map(str => ({ value: str, label: str }));
        }
        
        // Se já for array de objetos, retorna como está
        return this.options as { value: any, label: string }[];
    }

    // Funções auxiliares para extrair valor e label
    getOptionValue(option: { value: any, label: string }): any {
        return option.value;
    }

    getOptionLabel(option: { value: any, label: string }): string {
        return option.label;
    }

    writeValue(obj: any): void {
        this.value = obj;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onSelectChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        if (target) {
            const val = target.value;
            this.value = val;
            this.onChange(val); // Notifica o Angular Forms
            this.valueChange.emit(val); // Emite para uso externo se necessário
        }
    }
}