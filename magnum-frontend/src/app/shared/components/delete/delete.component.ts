// delete.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent, AlertType } from '../../../features/dashboard/alert/alert.component';
import { LoadingChartComponent } from '../../../features/dashboard/loading-chart/loading-chart.component';
import { LoadingComponent } from '../../../features/dashboard/loading/loading.component';
import { ProdutoService } from '../../../core/services/produto.service';
import { Subscription } from 'rxjs';
import { ModalService } from '../../../core/services/modal.service';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlertComponent,
    LoadingComponent
  ],
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent {

  // Variáveis para controlar o estado do modal
  isOpen = false;
  loading = false;
  alertMessage: string = '';
  alertType: AlertType = 'info';
  showAlert: boolean = true;
  produto: Produto[] = [];

  // Objeto para armazenar os dados do produto que será excluído
  produtoSelecionado: any = null;

  // Evento para comunicar ao componente pai que a exclusão foi confirmada
  @Output() produtoExcluido = new EventEmitter<number>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private produtoService: ProdutoService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Abre o modal e armazena o produto selecionado.
   * @param produto O objeto do produto vindo da tabela.
   */
  abrirModalDeConfirmacao(produto: any) {
    this.produtoSelecionado = produto;
    this.isOpen = true;
    this.showAlert = false;
  }

  close() {
    this.isOpen = false;
    this.closeModal.emit();
  }

  /**
   * Função chamada quando o usuário clica em "Sim" no modal.
   * @param id O ID do produto a ser excluído.
   */
  confirmarExclusao(id: number) {
    if (!id) {
      this.alertMessage = 'ID inválido!';
      this.alertType = 'error';
      this.showAlert = true;
      return;
    }

    this.loading = true; // Mostra um indicador de carregamento, se tiver
    this.showAlert = false;

    // --- AQUI VOCÊ FARÁ A CHAMADA AO SEU SERVIÇO/API ---
    // Exemplo fictício de como seria a chamada:

    this.produtoService.excluirProduto(id).subscribe({
      next: (resposta) => {
        this.loading = false;
        this.showAlert = true;
        this.alertMessage = 'Produto excluído com sucesso!';
        this.alertType = 'success';
        this.cdr.detectChanges();

        // Emite o evento para o componente pai saber que pode atualizar a lista
        this.produtoExcluido.emit(id);

        // Fecha o modal após alguns segundos
        setTimeout(() => {
          // this.close();
          window.location.reload();
        }, 2000);
      },
      error: (erro) => {
        this.loading = false;
        this.showAlert = true;
        this.alertMessage = 'Erro ao excluir o produto. Tente novamente.';
        this.alertType = 'error';
        console.error('Erro na exclusão:', erro);
        this.cdr.detectChanges();
      }
    });

    // Para fins de teste, vamos simular a exclusão:
    // console.log(`Confirmando exclusão do produto com ID: ${id}`);

    // setTimeout(() => {
    //   this.loading = false;
    //   this.showAlert = true;
    //   this.alertMessage = 'Produto excluído com sucesso! (Simulação)';
    //   this.alertType = 'success';
    //   this.produtoExcluido.emit(id);
    //   setTimeout(() => this.closeModal(), 2000);
    // }, 1000);
  }
}