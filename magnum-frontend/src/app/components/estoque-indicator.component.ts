import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-estoque-indicator',
  template: `
    <div [title]="tooltip" style="display: flex; align-items: center; gap: 8px;">
      <span [innerHTML]="iconSvg" [style.color]="color"></span>
      <span>{{ quantidade }}</span>
    </div>
  `
})
export class EstoqueIndicatorComponent {
  @Input() quantidade!: number;
  
  get iconSvg(): string {
    return this.getEstoqueData().svg;
  }
  
  get color(): string {
    return this.getEstoqueData().color;
  }
  
  get tooltip(): string {
    return this.getEstoqueData().tooltip;
  }
  
  private getEstoqueData() {
    if (this.quantidade === 0) {
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
        color: '#ff9800',
        tooltip: 'Estoque zerado!'
      };
    }
    // ... restante da lógica
    return { svg: '', color: '', tooltip: '' };
  }
}