import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Produto } from '../../../core/models/produto.model';
import { AuthService } from '../../../core/services/auth.service';
import { MagnumDesignSystemModule } from 'magnum-design-system';
import { ProdutoService } from '../../../core/services/produto.service';
import { TesteAlertService } from '../../../core/services/teste-alert.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { LoadingComponent } from '../../dashboard/loading/loading.component';

@Component({
  selector: 'app-produtos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MagnumDesignSystemModule,
    LoadingComponent
  ],
  providers: [RealtimeService],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  novoProduto = { nome: '', categoria: '', codigoBarras: '', estoque: 0, precoCusto: 0, precoVenda: 0 };
  filtroTexto: string = '';
  isAdmin = false;
  selecionarTodos: boolean = false;
  public selecionados: number[] = [];
  public configuradas: any[] = [];
  categoriaFiltro: string = 'Todas';
  error: string | null = null;
  loading: boolean = false;
  categorias: { value: any, label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'Fixação', label: 'Fixação' },
    { value: 'Portas, Janelas e Portões', label: 'Portas, Janelas e Portões' },
    { value: 'Casa e Jardim', label: 'Casa e Jardim' },
    { value: 'Ferramentas', label: 'Ferramentas' },
    { value: 'Agrícolas', label: 'Agrícolas' },
    { value: 'Hidráulica', label: 'Hidráulica' },
    { value: 'Elétrica', label: 'Elétrica' },
    { value: 'Ferragens', label: 'Ferragens' },
    { value: 'Químicos', label: 'Químicos' },
    { value: 'Fitas e Vedação', label: 'Fitas e Vedação' },
    { value: 'Máquinas', label: 'Máquinas' },
    { value: 'Sacria', label: 'Sacria' },
    { value: 'Impermeabilizantes', label: 'Impermeabilizantes' },
    { value: 'Utilidades', label: 'Utilidades' },
    { value: 'Solda e Abrasivos', label: 'Solda e Abrasivos' },
    { value: 'Epcs e Epcs', label: 'Epcs e Epcs' },
    { value: 'Tintas e Acessórios', label: 'Tintas e Acessórios' },
    { value: 'Banheiro', label: 'Banheiro' }
  ];

  produtoForm!: FormGroup;
  modoEdicao: boolean = false;
  produtoSelecionado: any = null;

  // Modal Excluir
  modalExcluirVisivel = false;
  modalExcluirSelecionadosVisivel = false;
  produtoExcluir: any = null;

  termoBusca: string = '';

  formPronto = false; // ← NOVO FLAG
  currentPage: number = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private alertService: TesteAlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.produtoForm = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      codigoBarras: ['', Validators.required],
      categoria: ['', Validators.required],
      precoCusto: [0, [Validators.required, Validators.min(0.01)]],
      precoVenda: [0, [Validators.required, Validators.min(0.01)]],
      estoque: [0, [Validators.required, Validators.min(0)]],
      // estoqueMinimo: [5, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.formPronto = true;

    // this.initForm();
    this.carregarProdutos();
    this.inicializarFormulario();
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true; // Opcional: mostra spinner de carregamento

    this.produtoService.getProdutos().subscribe({
      next: (dados) => {
        this.produtos = dados.map(p => ({
          ...p,
          // Garante que a categoria esteja sempre em minúsculas na lista também
          categoria: p.categoria?.toLowerCase() || ''
        }));

        // Calcula métricas para exibição na tabela/dashboard
        this.configuradas = this.produtos.map(p => {
          const precoCusto = Number(p.precoCusto) || 0;
          const precoVenda = Number(p.precoVenda) || 0;
          const lucro = precoVenda - precoCusto;

          // Evita divisão por zero
          const margemSobreVenda = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

          return {
            ...p,
            precoCusto: parseFloat(precoCusto.toFixed(2)),
            precoVenda: parseFloat(precoVenda.toFixed(2)),
            lucro: parseFloat(lucro.toFixed(2)),
            margem: parseFloat(margemSobreVenda.toFixed(2))
          };
        });

        this.filtrarLista(); // Aplica filtros iniciais se houver
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
        this.loading = false;
        // Opcional: mostrar alerta visual de erro para o usuário
      }
    });
  }

  carregarProdutos() {
    this.loading = true;
    this.produtoService.listarProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.carregarDados();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Produtos carregados:', this.produtos);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.mostrarErro('Erro ao carregar produtos.', 'danger');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalExcluirSelecionados() {
    // Aqui você pode implementar a lógica para abrir um modal de confirmação
    if (this.selecionados.length === 0) {
      this.mostrarErro('Nenhum produto selecionado para exclusão.', 'warning');
      return;
    }
    this.modalExcluirSelecionadosVisivel = true;
  }

  fecharModalExcluirSelecionados() {
    this.modalExcluirSelecionadosVisivel = false;
  }

  confirmarExclusaoSelecionados() {
    // Aqui você pode implementar a lógica para excluir os produtos selecionados
    if (this.selecionados.length === 0) {
      this.mostrarErro('Nenhum produto selecionado para exclusão.', 'warning');
      return;
    }
    // Exemplo: Chamar um serviço para excluir os produtos
    this.produtoService.excluirProduto(this.selecionados[0]).subscribe({
      next: () => {
        this.fecharModalExcluirSelecionados();
        this.carregarProdutos();
      },
      error: (err) => {
        console.error('Erro ao excluir produtos:', err);
        this.mostrarErro('Erro ao excluir os produtos selecionados. Tente novamente.', 'danger');
      }
    });
  }

  abrirModalExcluir(produto: Produto) {
    this.produtoExcluir = produto;
    this.modalExcluirVisivel = true;
  }

  fecharModalExcluir() {
    this.modalExcluirVisivel = false;
    this.produtoExcluir = null;
  }

  confirmarExclusao() {
    if (!this.produtoExcluir) {
      return;
    }
    const id = this.produtoExcluir.id;
    const nome = this.produtoExcluir.nome;

    this.onExclusaoProduto(id, nome);
  }

  onExclusaoProduto(id: number, nome: string) {
    this.loading = true;
    this.produtoService.excluirProduto(id).subscribe({
      next: () => {
        if (this.produtos) {
          this.produtos = this.produtos.filter(p => p.id !== id);
        }

        this.carregarProdutos();

        this.mostrarErro(`Produto "${nome}" excluído com sucesso!`, 'success');
        this.loading = false;
        this.fecharModalExcluir();
        this.cdr.detectChanges();
      },
      error: (err) => {

        let msgErro: string = '';
        let tipoAlerta: 'success' | 'danger' | 'warning' | 'info' = 'danger';

        if (err.status === 400) {
          msgErro = err.error?.message || err.error?.error || 'Requisição inválida. Verifique os dados.';
          tipoAlerta = 'warning';
        } else if (err.status === 404) {
          msgErro = `Produto com ID ${id} não encontrado. Atualize a lista.`;
          tipoAlerta = 'warning';
          this.carregarProdutos();
        } else if (err.status === 500) {
          msgErro = 'Erro interno no servidor. Tente novamente.';
          tipoAlerta = 'danger';
        } else if (err.error?.message) {
          msgErro = err.error.message;
          tipoAlerta = 'danger';
        } else {
          msgErro = 'Erro ao excluir produto. Tente novamente.';
          tipoAlerta = 'danger';
        }

        this.mostrarErro(msgErro, tipoAlerta);
      }
    })
  }

  // Quando clicar no ícone do cabeçalho (Selecionar Todos)
  toggleSelecionarTodos() {
    // Inverte o estado atual
    this.selecionarTodos = !this.selecionarTodos;

    if (this.selecionarTodos) {
      // Marca todos os produtos visíveis
      this.selecionados = this.produtosFiltrados.map(p => p.id);
    } else {
      // Desmarca tudo
      this.selecionados = [];
    }

    console.log("Selecionar Todos:", this.selecionarTodos);
    console.log("Lista completa:", this.selecionados);
  }

  // Quando clicar no ícone individual (funciona com span/div)
  toggleSelecao(id: number) {
    // Verifica se o ID já está na lista
    const index = this.selecionados.indexOf(id);

    if (index > -1) {
      // Se existe, remove (desmarca)
      this.selecionados.splice(index, 1);
    } else {
      // Se não existe, adiciona (marca)
      this.selecionados.push(id);
    }

    console.log("Lista atual:", this.selecionados);

    // Atualiza o estado do "Selecionar Todos"
    this.atualizarSelecionarTodos();
  }

  atualizarSelecionarTodos() {
    // Se não houver produtos, desmarca o geral
    if (this.produtosFiltrados.length === 0) {
      this.selecionarTodos = false;
      return;
    }

    // Se a quantidade de selecionados for igual à quantidade de produtos visíveis
    this.selecionarTodos = this.selecionados.length === this.produtosFiltrados.length;
  }

  getEstoqueStatus(quantidade: number): { icon: string, color: string, tooltip: string } {
    if (quantidade === 0) {
      return {
        icon: 'warning',
        color: '#EE443F',
        tooltip: 'Estoque zerado! Repor urgentemente.'
      };
    } else if (quantidade >= 1 && quantidade <= 10) {
      return {
        icon: 'warning',
        color: '#ffd700',
        tooltip: 'Estoque baixo. Planejar reposição.'
      };
    } else if (quantidade >= 30 && quantidade <= 1000) {
      return {
        icon: 'check_circle',
        color: '#43B75D',
        tooltip: 'Estoque adequado.'
      };
    } else if (quantidade > 1000) {
      return {
        icon: 'star',
        color: '#9C27B0',
        tooltip: 'Estoque excelente!'
      };
    } else {
      return {
        icon: 'info',
        color: '#8bc34a',
        tooltip: 'Estoque regular.'
      };
    }
  }

  // Verifica se a margem é negativa
  isMargemNegativa(venda?: number, custo?: number): boolean {
    const margem = this.getMargemNumero(venda, custo);
    return margem !== null && margem < 0;
  }

  // Verifica se a margem é baixa (entre 0 e 20%)
  isMargemBaixa(venda?: number, custo?: number): boolean {
    const margem = this.getMargemNumero(venda, custo);
    return margem !== null && margem >= 0 && margem < 20;
  }

  // Verifica se a margem é alta (>= 50%)
  isMargemAlta(venda?: number, custo?: number): boolean {
    const margem = this.getMargemNumero(venda, custo);
    return margem !== null && margem >= 50;
  }

  calcularMargem(venda?: number, custo?: number): string {
    const margem = this.getMargemNumero(venda, custo);

    if (margem === null || !isFinite(margem)) {
      return '0.00';
    }

    return margem.toFixed(2);
  }

  getMargemNumero(venda?: number, custo?: number): number | null {
    const v = Number(venda) || 0;
    const c = Number(custo) || 0;

    if (v <= 0) {
      return null;
    }

    const resultado = ((v - c) / v) * 100;
    return resultado;
  }

  buscarPorNome() {

    if (!this.termoBusca || this.termoBusca.trim() === '') {

      this.carregarTodosOsProdutos();
    } else {

      // --- CASO 2: HÁ UM TERMO DE BUSCA -> FILTRA POR NOME ---
      this.produtoService.buscarPorNome(this.termoBusca).subscribe({
        next: (data: Produto[]) => {
          // Simula um delay para você ver o loading (pode remover o setTimeout depois)
          this.produtos = data; // Atualiza a lista na tela com o resultado filtrado
        },
        error: (err: any) => {
          console.error('Erro ao buscar produtos', err);
          this.mostrarErro('Falha ao buscar produtos.', 'danger');
        }
      });
    }
  }

  filtrarLista() {
    if (!this.filtroTexto) {
      this.configuradas = this.produtos;
    } else {
      const termo = this.filtroTexto.toLowerCase();
      this.configuradas = this.produtos.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.codigoBarras.toLowerCase().includes(termo)
      );
    }
  }

  // Função auxiliar para carregar todos os produtos
  carregarTodosOsProdutos() {
    this.produtoService.getProdutos().subscribe({ // Assumindo que você tem um método .listar()
      next: (data: Produto[]) => {
        setTimeout(() => {
          this.produtos = data;
        }, 1000);
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos', err);
        this.mostrarErro('Falha ao carregar a lista de produtos.', 'danger');
      }
    });
  }

  selecionarProduto(prod: any) {
    this.modoEdicao = true;
    this.produtoSelecionado = prod;
    this.produtoForm.patchValue(prod);
  }

  limparProduto() {
    this.limparForm();
  }

  editarProduto(produto: any) {
    if (!this.formPronto) {
      console.warn('⚠️ Formulário ainda não está pronto. Aguardando...');
      setTimeout(() => this.editarProduto(produto), 100);
      return;
    }

    this.produtoForm.patchValue({
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria?.toLowerCase() || '',
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda,
      estoque: produto.estoque,
      ativo: produto.ativo,
      codigoBarras: produto.codigoBarras,
    });

    this.modoEdicao = true;
    this.editarProduto = produto;

    // Debug opcional:
    console.log('ID preenchido:', this.produtoForm.get('id')?.value);
  }

  // initForm() {
  //   this.produtoForm = this.fb.group({
  //     id: [null], // ← Campo ID adicionado
  //     nome: ['', Validators.required],
  //     codigoBarras: ['', Validators.required],
  //     categoria: ['', Validators.required],
  //     precoCusto: [0, [Validators.required, Validators.min(0)]],
  //     precoVenda: [0, [Validators.required, Validators.min(0)]],
  //     estoque: [0, [Validators.required, Validators.min(0)]]
  //   });
  // }

  salvar() {
    console.log('--- INÍCIO DO SALVAR ---');

    if (this.produtoForm.invalid) {
      console.warn('Formulário Inválido');
      this.produtoForm.markAllAsTouched();
      return;
    }

    const formValue = this.produtoForm.value;
    console.log('Dados do Form:', formValue);

    // 1. Validação Rápida
    const nome = formValue.nome?.toString().trim();
    const codigoBarras = formValue.codigoBarras?.toString().trim();

    if (!nome) {
      this.mostrarErro('Nome obrigatório.', 'danger');
      return;
    }

    // 2. Montagem do Payload
    const payload = {
      id: formValue.id,
      nome: nome,
      categoria: formValue.categoria?.toString().trim().toLowerCase(),
      estoque: Number(formValue.estoque) || 0,
      precoCusto: parseFloat((formValue.precoCusto + '').replace(',', '.')) || 0,
      precoVenda: parseFloat((formValue.precoVenda + '').replace(',', '.')) || 0,
      codigoBarras: codigoBarras,
      ativo: true
    };

    console.log('Payload Enviado:', payload);
    console.log('Lista Atual de Produtos (antes da salvar):', this.produtos);

    // 3. Verificação de Duplicidade Local (Apenas para UX rápida)
    // Nota: A validação real deve ser feita no Backend (.NET)
    const duplicadoLocal = this.produtos.find(p =>
      p.id !== payload.id &&
      p.nome.toLowerCase() === payload.nome.toLowerCase()
    );

    if (duplicadoLocal) {
      console.warn('Duplicidade detectada localmente');
      this.mostrarErro('Já existe um produto com este nome.', 'warning');
      return;
    }

    this.loading = true;

    // 4. Chamada API
    const request$ = this.modoEdicao
      ? this.produtoService.atualizarProduto(payload.id, payload)
      : this.produtoService.adicionarProduto(payload);

    request$.subscribe({
      next: (resposta) => {
        console.log('Resposta do Backend:', resposta); // DEBUG: Olhe isso no console!

        this.mostrarErro(
          this.modoEdicao ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!',
          'success'
        );

        const index = this.produtos.findIndex(p => p.id === payload.id);
        if (index !== -1) {
          this.produtos[index] = payload;
        }

        // IMPORTANTE: Recarrega a lista do servidor para garantir dados frescos
        this.carregarProdutos();

        this.limparForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro da API:', err);
        this.loading = false;

        // Tratamento específico para erro 409 (Conflito/Duplicado no Backend)
        if (err.status === 409 || err.error?.message?.includes('já existe')) {
          this.mostrarErro('Este produto já está cadastrado no sistema.', 'warning');
        } else {
          this.mostrarErro(err.error?.message || 'Erro ao salvar.', 'danger');
        }
      }
    });
  }

  // Função auxiliar para validar (mantém seu código limpo)
  private validarCampos(formValue: any): string[] {
    const erros: string[] = [];
    const nome = formValue.nome?.toString().trim();

    if (!nome) erros.push('Nome é obrigatório.');
    else if (!/^[a-zA-ZÀ-ÿ\s.\-0-9]+$/.test(nome)) erros.push('Nome contém caracteres inválidos.');

    const categoria = formValue.categoria?.toString().trim().toLowerCase();
    if (!categoria || categoria === 'selecione') erros.push('Categoria inválida.');

    const estoque = Number(formValue.estoque) || 0;
    if (estoque < 0) erros.push('Estoque negativo.');

    const precoCusto = parseFloat((formValue.precoCusto + '').replace(',', '.')) || 0;
    const precoVenda = parseFloat((formValue.precoVenda + '').replace(',', '.')) || 0;

    if (precoCusto <= 0) erros.push('Preço Custo inválido.');
    if (precoVenda <= 0) erros.push('Preço Venda inválido.');

    return erros;
  }

  // Função auxiliar para montar o objeto
  private montarPayload(formValue: any): any {
    return {
      id: formValue.id,
      nome: formValue.nome?.toString().trim(),
      categoria: formValue.categoria?.toString().trim().toLowerCase(),
      estoque: Number(formValue.estoque) || 0,
      precoCusto: parseFloat((formValue.precoCusto + '').replace(',', '.')) || 0,
      precoVenda: parseFloat((formValue.precoVenda + '').replace(',', '.')) || 0,
      codigoBarras: formValue.codigoBarras?.toString().trim(),
      ativo: true
    };
  }

  limparForm() {
    this.modoEdicao = false;
    this.produtoSelecionado = null;
    this.produtoForm.reset({
      id: null, nome: '', codigoBarras: '', categoria: '',
      precoCusto: 0, precoVenda: 0, estoque: 0
    });
  }

  mostrarErro(mensagem: string, tipo: 'success' | 'danger' | 'warning' | 'info' = 'danger') {
    this.loading = false;
    switch (tipo) {
      case 'success':
        this.alertService.success(mensagem);
        break;
      case 'warning':
        this.alertService.warning(mensagem);
        break;
      case 'info':
        this.alertService.info(mensagem);
        break;
      default:
        this.alertService.danger(mensagem);
    }
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  onPageChange(event: any) {
    console.log('Página selecionada:', event);
    this.currentPage = event;
    // Aqui você pode implementar a lógica para carregar os dados da página selecionada
    this.carregarDadosDaPagina(event);
  }

  carregarDadosDaPagina(page: number, size: number = 10) {
    // Implemente a lógica para carregar os dados da página especificada
    console.log('Carregando dados da página:', page, size);
    // Exemplo: Chamar um serviço para obter os dados da página
    this.produtoService.getProdutosPorPagina(page, size).subscribe({
      next: (dados) => {
        this.produtos = [...dados];
        this.carregarDados(); // Reconfigura os dados para o mds-table
        // this.produtos = [...dados]; // Cria um novo array para forçar detecção de mudanças
        this.cdr.detectChanges(); // Força a detecção de mudanças
      },
      error: (err) => {
        console.error('Erro ao carregar dados da página:', err);
        this.mostrarErro('Erro ao carregar os dados da página. Tente novamente.', 'danger');
      }
    });
  }

  inicializarFormulario() {
    this.produtoForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      estoque: [0, [Validators.min(0)]],
      precoCusto: [0, [Validators.min(0.01)]],
      precoVenda: [0, [Validators.min(0.01)]],
      codigoBarras: ['', [Validators.required]]
    });

    // INSCREVA-SE NAS MUDANÇAS DO PREÇO DE CUSTO
    this.produtoForm.get('precoCusto')?.valueChanges.subscribe(custo => {
      console.log('Valor de custo mudou para:', custo); // Debug

      // 👇 ESCUTA MUDANÇAS NO PREÇO DE CUSTO E ATUALIZA O PREÇO DE VENDA AUTOMATICAMENTE
      this.produtoForm.get('precoCusto')?.valueChanges.subscribe(custo => {
        if (custo && custo > 0) {
          const vendaCalculada = custo * 1.667;
          const vendaFormatada = parseFloat(vendaCalculada.toFixed(2));

          console.log(`Custo: ${custo} → Venda calculada: ${vendaFormatada}`);

          this.produtoForm.patchValue({
            precoVenda: vendaFormatada
          }, { emitEvent: false }); // Evita loop infinito
        } else {
          this.produtoForm.patchValue({
            precoVenda: null
          }, { emitEvent: false });
        }
      });
    });
  }

  get produtosFiltrados() {
    // Garante que é uma string antes de chamar trim()
    const filtro = String(this.categoriaFiltro || '').trim();

    if (!filtro || filtro === 'Todas') {
      return this.produtos;
    }

    return this.produtos.filter(p => p.categoria === filtro);
  }

  // Getters para acessar os controles facilmente no template
  get nomeControl(): AbstractControl | null {
    return this.produtoForm.get('nome');
  }

  get categoriaControl(): AbstractControl | null {
    return this.produtoForm.get('categoria');
  }

  get estoqueControl(): AbstractControl | null {
    return this.produtoForm.get('estoque');
  }

  get precoCustoControl(): AbstractControl | null {
    return this.produtoForm.get('precoCusto');
  }

  get precoVendaControl(): AbstractControl | null {
    return this.produtoForm.get('precoVenda');
  }

  get codigoBarrasControl(): AbstractControl | null {
    return this.produtoForm.get('codigoBarras');
  }
}