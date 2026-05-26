import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'mds-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    // Previne scroll no body quando modal está aberto
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  onClose(): void {
    this.close.emit();
    document.body.style.overflow = 'auto';
  }

  // Fecha ao clicar no backdrop (fundo escuro)
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
  
  // Acessibilidade: Fechar com ESC
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.onClose();
    }
  }
}