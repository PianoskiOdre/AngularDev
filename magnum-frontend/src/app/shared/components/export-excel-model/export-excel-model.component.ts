import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-export-excel-model',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './export-excel-model.component.html',
  styleUrl: './export-excel-model.component.css',
})
export class ExportExcelModelComponent {
  // Recebe do Dashboard quantos itens foram selecionados (apenas para exibição ou validação)
  @Input() qtdSelecionados: number = 0;
  
  // Recebe do Dashboard a lista real de IDs para enviar ao backend
  @Input() idsSelecionados: number[] = [];

  // Emite um evento para o Dashboard executar o download (ou pode chamar o serviço direto aqui)
  @Output() confirmarExportacao = new EventEmitter<void>();
  
  exibirModal: boolean = false;

  constructor(private produtoService: ProdutoService) {}

  abrirModal() {
    if (this.idsSelecionados.length === 0) {
      alert("Selecione pelo menos um produto.");
      return;
    }
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
  }

  processarExportacao() {
    this.fecharModal();
    
    // Chama o serviço diretamente aqui
    this.produtoService.exportarSelecionadosExcel(this.idsSelecionados).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `selecionados_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao exportar.');
      }
    });
  }
}
