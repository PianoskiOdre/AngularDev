import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { AlertComponent, AlertType } from '../../../features/dashboard/alert/alert.component';
import { LoadingComponent } from '../../../features/dashboard/loading/loading.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-produto-adicionar-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    AlertComponent
  ],
  templateUrl: './produto-adicionar-modal.component.html',
  styleUrls: ['./produto-adicionar-modal.component.css'],
})
export class ProdutoComponent {
  @Output() closeModal = new EventEmitter<void>();

  adicionarForm: FormGroup;
  isOpen: boolean = false;
  novoProduto = { nome: '', categoria: '', estoque: 0, precoCusto: 0, precoVenda: 0 };
  adicionarProduto: string | null = null;
  produtos: Produto[] = [];
  alertMessage: string = '';
  alertType: AlertType = 'info';
  showAlert: boolean = false;
  loading: boolean = false;

  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.adicionarForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s.\-\/0-9]+$/)]],
      categoria: ['', Validators.required],
      estoque: [0, [Validators.min(0)]],
      precoCusto: [9.49, [Validators.min(0.01)]],
      precoVenda: [15.82, [Validators.min(0.01)]]
    });
  }

  openModal() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.closeModal.emit();
  }

  // onAdicionarProduto() {
  //   if (this.adicionarForm.invalid) {
  //     this.adicionarForm.markAllAsTouched();
  //     return;
  //   }

  //   const formValue = this.adicionarForm.value;
  //   const erros = [];

  //   // Nome
  //   const nome = formValue.nome?.toString().trim();
  //   if (!nome) {
  //     erros.push('Nome é obrigatório.');
  //   } else {
  //     // Regex ajustado para aceitar hífens, pontos e números
  //     if (!/^[a-zA-ZÀ-ÿ\s.\-0-9]+$/.test(nome)) {
  //       erros.push('Nome contém caracteres inválidos.');
  //     }
  //   }

  //   // Categoria (CRÍTICO)
  //   const categoria = formValue.categoria?.toString().trim().toLowerCase();
  //   if (!categoria || categoria === 'selecione') erros.push('Categoria inválida.');

  //   // Estoque
  //   const estoque = Number(formValue.estoque) || 0;
  //   if (estoque < 0) erros.push('Estoque negativo.');

  //   // Preços (Converte vírgula para ponto)
  //   const precoCusto = parseFloat((formValue.precoCusto + '').replace(',', '.')) || 0;
  //   const precoVenda = parseFloat((formValue.precoVenda + '').replace(',', '.')) || 0;
  //   if (precoCusto <= 0) erros.push('Preço Custo inválido.');
  //   if (precoVenda <= 0) erros.push('Preço Venda inválido.');

  //   // Se houver erros, mostra e PARA
  //   if (erros.length > 0) {
  //     console.log('Erros de Validação:', erros);
  //     this.mostrarAlerta(erros.join('\n'), 'error');
  //     return;
  //   }

  //   const payload = {
  //     nome,
  //     categoria,
  //     estoque,
  //     precoCusto,
  //     precoVenda
  //   };

  //   // Verificar duplicidade (como já fazia)
  //   const jaExiste = this.produtos.some(p =>
  //     p.nome === payload.nome &&
  //     p.categoria === payload.categoria &&
  //     p.estoque === payload.estoque &&
  //     p.precoCusto === payload.precoCusto &&
  //     p.precoVenda === payload.precoVenda
  //   );

  //   if (!jaExiste) {
  //     this.mostrarAlerta('Produto já cadastrado com esses dados. Verifique!', 'warning');
  //     return;
  //   }

  //   // Se tudo ok, prosseguir com a chamada ao serviço
  //   this.loading = true;

  //   this.produtoService.adicionarProduto(payload).subscribe({
  //     next: (produtoCriado) => {
  //       setTimeout(() => {
  //         console.log('Produtos atuais:', this.produtos);
  //         console.log('Produto novo:', payload);
  //         this.produtos = [...this.produtos, produtoCriado];
  //         this.limparFormulario();
  //         this.mostrarAlerta('Produto cadastrado com sucesso!', 'success');
  //         this.loading = false;
  //         this.cdr.detectChanges();
  //       }, 1000);

  //       setTimeout(() => {
  //         this.adicionarForm.reset();
  //         // window.location.reload();
  //       }, 2000);
  //     },
  //     error: (err) => {
  //       console.error('Erro ao cadastrar produto:', err);
  //       let mensagemErro = 'Erro ao cadastrar produto.';

  //       // Tentar extrair mensagem do backend, se disponível
  //       if (err.error?.message) {
  //         mensagemErro = err.error.message;
  //       } else if (err.message) {
  //         mensagemErro = err.message;
  //       }

  //       this.mostrarAlerta(mensagemErro, 'error');
  //       this.loading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  private mostrarAlerta(mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = mensagem;
    this.alertType = tipo;
    this.showAlert = true;
  }

  private limparFormulario(): void {
    // Reseta o formulário PARA OS VALORES PADRÃO definidos no construtor
    this.adicionarForm.reset({
      nome: '',
      categoria: '',
      estoque: 0,
      precoCusto: 9.49,   // ← Garante que volta para 9.49
      precoVenda: 15.82   // ← Garante que volta para 15.82
    });

    // Opcional: Se quiser zerar a variável novoProduto também para consistência
    this.novoProduto = {
      nome: '',
      categoria: '',
      estoque: 0,
      precoCusto: 9.49,
      precoVenda: 15.82
    };
  }

  onPrecoCustoChange() {
    console.log('onPrecoCustoChange chamado!'); // ← ADICIONE ISSO

    const custo = this.adicionarForm.get('precoCusto')?.value;
    console.log('Custo digitado:', custo);       // ← E ISSO

    if (custo > 0) {
      const vendaCalculada = custo * 1.667;
      console.log('Venda calculada:', vendaCalculada); // ← E ISSO

      this.adicionarForm.patchValue({
        precoVenda: parseFloat(vendaCalculada.toFixed(2))
      });

      console.log('Form atualizado:', this.adicionarForm.value); // ← E ISSO
    }
  }

  onAlertClosed() {
    setTimeout(() => this.showAlert = false, 2000)
  }
}
