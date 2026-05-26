import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Produto } from '../../../core/models/produto.model';
import { AlertComponent, AlertType } from '../../../features/dashboard/alert/alert.component';
import { ProdutoService } from '../../../core/services/produto.service';
import { LoadingComponent } from '../../../features/dashboard/loading/loading.component';

@Component({
  selector: 'app-produto-editar-model',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlertComponent,
    LoadingComponent
  ],
  templateUrl: './produto-editar-model.component.html',
  styleUrls: ['./produto-editar-model.component.css'],
})
export class ProdutoEditarModelComponent implements OnChanges {
  @Output() produtoAtualizado = new EventEmitter<Produto>();
  @Output() closeModal = new EventEmitter<void>();


  @Input() set atualizarProduto(value: any) {
    // Se for null/undefined, usa objeto vazio
    this._atualizarProduto = value || { id: 0, nome: '', categoria: '', estoque: 0, precoCusto: 0, precoVenda: 0 };

    console.log('🔄 Setter recebeu:', this._atualizarProduto);

    // Se tiver um ID válido, preenche o formulário
    if (this._atualizarProduto.id > 0) {
      setTimeout(() => {
        this.atualizarForm.patchValue({
          nome: this._atualizarProduto.nome,
          categoria: this._atualizarProduto.categoria,
          estoque: this._atualizarProduto.estoque,
          precoCusto: this._atualizarProduto.precoCusto,
          precoVenda: this._atualizarProduto.precoVenda
        });
        console.log('✅ Formulário preenchido!');
      }, 0);
    }
  }

  get atualizarProduto(): any {
    return this._atualizarProduto;
  }

  private _atualizarProduto: any = { id: 0, nome: '', categoria: '', estoque: 0, precoCusto: 0, precoVenda: 0 };

  atualizarForm: FormGroup;
  isOpen: boolean = false;
  produto: Produto[] = [];
  alertMessage: string = '';
  alertType: AlertType = 'info';
  showAlert: boolean = true;
  loading: boolean = false;

  lucroCalculado: number = 0;
  margemCalculada: number = 0;
  produtoOriginal: any = {};

  constructor(
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.atualizarForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s.\-\/0-9]+$/)]],
      categoria: ['', Validators.required],
      estoque: [0, [Validators.min(0)]],
      precoCusto: [0, [Validators.min(0.01)]],
      precoVenda: [0, [Validators.min(0.01)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['atualizarProduto'] && this.atualizarProduto?.id > 0) {
      this.atualizarForm.patchValue({
        nome: this.atualizarProduto.nome,
        categoria: this.atualizarProduto.categoria,
        estoque: this.atualizarProduto.estoque,
        precoCusto: this.atualizarProduto.precoCusto,
        precoVenda: this.atualizarProduto.precoVenda
      });
    }
  }

  ngOnInit() {
    console.log('Response da API: ', this.produto)
  }

  criarFormulario() {
    this.atualizarForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s.\-\V0-9]+$/)
      ]],
      categoria: ['', [
        Validators.required,
        this.validarCategoria
      ]],
      estoque: [0, [
        Validators.min(0)
      ]],
      precoCusto: ['', [
        Validators.required,
        Validators.min(0.01)
      ]],
      precoVenda: ['', [
        Validators.required,
        Validators.min(0.01)
      ]]
    });
  }

  // Validator customizado para categoria
  validarCategoria(control: AbstractControl): ValidationErrors | null {
    const valor = control.value?.toString().trim().toLowerCase();
    if (!valor || valor === '' || valor === 'selecione') {
      return { categoriaInvalida: true };
    }
    return null;
  }

  inicializarFormulario(): void {
    this.atualizarForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s.\-\/0-9]+$/)]],
      categoria: ['', Validators.required],
      estoque: [0, [Validators.required, Validators.min(0)]],
      precoCusto: [0, [Validators.required, Validators.min(0)]],
      precoVenda: [0, [Validators.required, Validators.min(0)]]
    });

    // Se estiver editando, preenche com dados existentes
    if (this.produto) {
      this.atualizarProduto = this.produto;
      this.atualizarForm.patchValue({
        nome: this.atualizarProduto.nome,
        categoria: this.atualizarProduto.categoria,
        estoque: this.atualizarProduto.estoque,
        precoCusto: this.atualizarProduto.precoCusto || 0,
        precoVenda: this.atualizarProduto.precoVenda || this.atualizarProduto.precoCusto || 0
      });

      // Calcula lucro e margem iniciais
      this.calcularLucroMargem();
    }
  }

  calcularLucroMargem(): void {
    const custo = Number(this.atualizarForm.get('precoCusto')?.value) || 0;
    const venda = Number(this.atualizarForm.get('precoVenda')?.value) || 0;

    this.lucroCalculado = venda - custo;

    if (venda > 0) {
      this.margemCalculada = ((this.lucroCalculado / venda) * 100);
    } else {
      this.margemCalculada = 0;
    }

    // Arredonda para 2 casas decimais
    this.margemCalculada = Math.round(this.margemCalculada * 100) / 100;
  }

  onPrecoCustoChange() {
    console.log('onPrecoCustoChange chamado!'); // ← ADICIONE ISSO

    const custo = this.atualizarForm.get('precoCusto')?.value;
    console.log('Custo digitado:', custo);       // ← E ISSO

    if (custo > 0) {
      const vendaCalculada = custo * 1.667;
      console.log('Venda calculada:', vendaCalculada); // ← E ISSO

      this.atualizarForm.patchValue({
        precoVenda: parseFloat(vendaCalculada.toFixed(2))
      });

      console.log('Form atualizado:', this.atualizarForm.value); // ← E ISSO
    }
  }

  editarProduto(produto: Produto) {
    this.atualizarProduto = produto;

    this.atualizarForm.patchValue({
      nome: produto.nome,
      categoria: produto.categoria,
      estoque: produto.estoque,
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda
    });
  }

  // No seu método de submit
  onSubmit() {
    // Validação do formulário
    if (this.atualizarForm.invalid) {
      this.atualizarForm.markAllAsTouched();
    }
    // 3. Agora sim: verificar se os dados realmente mudaram
    const formValue = this.atualizarForm.value; // ou onde você guarda o valor original
    const erros = [];

    // Nome
    const nome = formValue.nome?.toString().trim();
    if (!nome) {
      erros.push('Nome é obrigatório.');
    } else {
      // Regex ajustado para aceitar hífens, pontos e números
      if (!/^[a-zA-ZÀ-ÿ\s.\-\V0-9]+$/.test(nome)) {
        erros.push('Nome contém caracteres inválidos.');
      }
    }

    // Categoria (CRÍTICO)
    const categoria = formValue.categoria?.toString().trim().toLowerCase();
    if (!categoria || categoria === 'selecione') erros.push('Categoria inválida.');

    // Estoque
    const estoque = Number(formValue.estoque) || 0;
    if (estoque < 0) erros.push('Estoque negativo.');

    // Preços (Converte vírgula para ponto)
    const precoCusto = parseFloat((formValue.precoCusto + '').replace(',', '.')) || 0;
    const precoVenda = parseFloat((formValue.precoVenda + '').replace(',', '.')) || 0;
    if (precoCusto <= 0) erros.push('Preço Custo inválido.');
    if (precoVenda <= 0) erros.push('Preço Venda inválido.');

    // Se houver erros, mostra e PARA
    if (erros.length > 0) {
      console.log('Erros de Validação:', erros);
      this.mostrarAlerta(erros.join('\n'), 'error');
      return;
    }

    // Verificação de Mudança (CORRIGIDA)
    const nomeOrig = (this.atualizarProduto.nome || '').toString().trim().toLowerCase();
    const catOrig = (this.atualizarProduto.categoria || '').toString().trim().toLowerCase();
    const estOrig = Number(this.atualizarProduto.estoque) || 0;
    const pcOrig = parseFloat((this.atualizarProduto.precoCusto + '').replace(',', '.')) || 0;
    const pvOrig = parseFloat((this.atualizarProduto.precoVenda + '').replace(',', '.')) || 0;

    const mudou =
      nome !== nomeOrig ||
      categoria !== catOrig ||
      estoque !== estOrig ||
      precoCusto !== pcOrig ||
      precoVenda !== pvOrig;

    if (!mudou) {
      this.mostrarAlerta('Nenhuma alteração detectada.', 'warning');
      return;
    }

    // --- PREPARA PAYLOAD E ENVIA ---

    const payload = {
      id: this.atualizarProduto.id,
      nome: nome,
      categoria: formValue.categoria, // Envia o valor exato do select (ex: "Elétrica")
      estoque: estoque,
      precoCusto: precoCusto, // Envia como NÚMERO
      precoVenda: precoVenda  // Envia como NÚMERO
    };

    if (!payload.id) {
      this.mostrarAlerta('Erro: ID não encontrado.', 'error');
      return;
    }

    console.log('Enviando Payload:', payload);

    this.loading = true;

    // 4. Chamar o Serviço
    this.produtoService.atualizarProduto(payload.id, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.mostrarAlerta('Produto atualizado com sucesso!', 'success');
        this.produtoAtualizado.emit();

        setTimeout(() => {
          this.atualizarForm.reset(); // ← ISSO LIMPA TUDO!
          this.closeModal.emit();
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.mostrarAlerta(err.error?.message || 'Erro ao atualizar.', 'error');
      }
    });
  }

  fecharModal() {
    this.atualizarForm.reset(); // Limpa só ao fechar
  }

  abrirModalDeConfirmacao(produto: Produto) {
    this.atualizarProduto = { ...produto };
    this.isOpen = true;
    this.showAlert = false;
  }

  close() {
    this.isOpen = false;
    this.closeModal.emit();
  }

  // Getters para acessar os controles facilmente no template
  get nomeControl(): AbstractControl | null {
    return this.atualizarForm.get('nome');
  }

  get categoriaControl(): AbstractControl | null {
    return this.atualizarForm.get('categoria');
  }

  get estoqueControl(): AbstractControl | null {
    return this.atualizarForm.get('estoque');
  }

  get precoCustoControl(): AbstractControl | null {
    return this.atualizarForm.get('precoCusto');
  }

  get precoVendaControl(): AbstractControl | null {
    return this.atualizarForm.get('precoVenda');
  }

  private mostrarAlerta(mensagem: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    this.alertMessage = mensagem;
    this.alertType = tipo;
    this.showAlert = true;
  }

  onAlertClosed() {
    this.showAlert = false;
  }
}
