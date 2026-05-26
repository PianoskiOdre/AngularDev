import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Necessário para ngModel

@Component({
    selector: 'mds-search',
    standalone: false, // Conforme sua configuração atual
    template: `
        <div class="mds-search">
            <input
                class="mds-search-input"
                [type]="type"
                [placeholder]="placeholder"
                [(ngModel)]="value"
                (input)="onInputChange()"
                (keyup.enter)="onSearchClick()"
                aria-label="Campo de busca"
            />
            <button 
                class="mds-search-button" 
                (click)="onSearchClick()"
                type="button"
                aria-label="Executar busca"
            >
                <i class="material-icons" aria-hidden="true">search</i>
            </button>
        </div>
    `,
    styles: [`
        .mds-search {
            display: flex;
            align-items: center;
            border: 1px solid var(--mds-color-neutral-300);
            border-radius: 4px;
            padding: 4px 8px;
            background-color: var(--mds-color-white);
            transition: border-color 0.2s ease;
        }

        /* Feedback visual de foco para acessibilidade e UX */
        .mds-search:focus-within {
            border-color: var(--mds-color-primary-500); /* Ajuste para sua cor primária */
            box-shadow: 0 0 0 2px var(--mds-color-primary-100); /* Exemplo de anel de foco suave */
        }

        .mds-search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            color: var(--mds-color-neutral-900);
            background: transparent;
        }

        .mds-search-input::placeholder {
            color: var(--mds-color-neutral-500);
        }

        .mds-search-button {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }

        .mds-search-button:hover {
            background-color: var(--mds-color-neutral-100);
        }

        .mds-search-button i {
            font-size: 20px;
            color: var(--mds-color-neutral-600);
        }

        .mds-search-button:hover i {
            color: var(--mds-color-neutral-800);
        }
    `]
})
export class SearchComponent {
    @Input() type: string = 'text';
    @Input() placeholder: string = 'Pesquisar...'; // Traduzido para PT-BR
    
    // Output para emitir o termo de busca para o componente pai
    @Output() searchEvent = new EventEmitter<string>();

    value: string = '';

    /**
     * Chamado a cada digitação. 
     * Aqui você pode implementar debounce se desejar, 
     * ou apenas emitir imediatamente.
     */
    onInputChange(): void {
        // Opcional: Implementar debounce aqui se necessário para evitar muitas chamadas API
        this.searchEvent.emit(this.value);
    }

    /**
     * Chamado ao clicar no botão ou pressionar Enter.
     * Útil para buscas explícitas.
     */
    onSearchClick(): void {
        this.searchEvent.emit(this.value);
    }
}