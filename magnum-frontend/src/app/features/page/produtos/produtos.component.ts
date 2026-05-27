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
import { ProductServiceMock } from '../../../shared/services/product.service.mock';
import { Product } from '../../../shared/models/mock-data';

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

  stats: Product | null = null;
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private alertService: TesteAlertService,
    private cdr: ChangeDetectorRef,
    private prodServiceMock: ProductServiceMock
  ) {
    this.produtoForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code_sku: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      sale: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      // estoqueMinimo: [5, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.formPronto = true;

    this.prodStatsMock();

    // this.initForm();
    // this.carregarProdutos();
    this.inicializarFormulario();
    // this.carregarDados();
    this.carregarFakeAPI();
  }

  prodStatsMock() {
    this.loading = true;
    this.prodServiceMock.getProducts().subscribe(data => {
      this.products = data;
      console.log("Produto com sucesso!", data);
      this.loading = false;
      this.cdr.detectChanges();
    })
  }

  carregarFakeAPI() {
    this.loading = true;

    this.prodServiceMock.getProducts().subscribe({
      next: (data) => {
        this.products = data.map(p => ({
          ...p,
          category: p.category || ''
        }));

        // Calcula métricas para exibição na tabela/dashboard
        this.configuradas = this.products = data.map(p => {
          const precoCusto = Number(p.price) || 0;
          const precoVenda = Number(p.sale) || 0;
          const lucro = precoVenda - precoCusto;

          // Evita divisão por zero
          const margemSobreVenda = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

          return {
            ...p,
            price: parseFloat(precoCusto.toFixed(2)),
            sale: parseFloat(precoVenda.toFixed(2)),
            lucro: parseFloat(lucro.toFixed(2)),
            margem: parseFloat(margemSobreVenda.toFixed(2))
          };
        });

        this.filtrarLista(); // Aplica filtros iniciais se houver
        this.loading = false;
      }, error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
        this.loading = false;
        // Opcional: mostrar alerta visual de erro para o usuário
      }
    });
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
    this.prodServiceMock.deleteProduct(this.selecionados[0]).subscribe({
      next: () => {
        this.fecharModalExcluirSelecionados();
        this.carregarFakeAPI();
      },
      error: (err) => {
        console.error('Erro ao excluir produtos:', err);
        this.mostrarErro('Erro ao excluir os produtos selecionados. Tente novamente.', 'danger');
      }
    });
  }

  abrirModalExcluir(produto: Product) {
    this.stats = produto;
    this.modalExcluirVisivel = true;
  }

  fecharModalExcluir() {
    this.modalExcluirVisivel = false;
    this.stats = null;
  }

  confirmarExclusao() {
    if (!this.stats) {
      return;
    }
    const id = this.stats.id;
    const name = this.stats.name;

    this.onExclusaoProduto(id, name);
  }

  onExclusaoProduto(id: number, nome: string) {
    this.loading = true;
    this.prodServiceMock.deleteProduct(id).subscribe({
      next: () => {
        if (this.products) {
          this.products = this.products.filter(p => p.id !== id);
        }

        this.carregarFakeAPI();

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

  // buscarPorNome() {

  //   if (!this.termoBusca || this.termoBusca.trim() === '') {

  //     this.carregarTodosOsProdutos();
  //   } else {

  //     // --- CASO 2: HÁ UM TERMO DE BUSCA -> FILTRA POR NOME ---
  //     this.produtoService.buscarPorNome(this.termoBusca).subscribe({
  //       next: (data: Produto[]) => {
  //         // Simula um delay para você ver o loading (pode remover o setTimeout depois)
  //         this.produtos = data; // Atualiza a lista na tela com o resultado filtrado
  //       },
  //       error: (err: any) => {
  //         console.error('Erro ao buscar produtos', err);
  //         this.mostrarErro('Falha ao buscar produtos.', 'danger');
  //       }
  //     });
  //   }
  // }

  buscarPorNome() {
    if (!this.termoBusca || this.termoBusca.trim() === '') {
      this.carregarTodosOsProdutos();
    } else {

      // --- CASO 2: HÁ UM TERMO DE BUSCA -> FILTRA POR NOME ---
      this.prodServiceMock.buscarPorNome(this.termoBusca).subscribe({
        next: (data: Product[]) => {
          // Simula um delay para você ver o loading (pode remover o setTimeout depois)
          this.products = data; // Atualiza a lista na tela com o resultado filtrado
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
      this.configuradas = this.products;
    } else {
      const termo = this.filtroTexto.toLowerCase();
      this.configuradas = this.products.filter(p =>
        p.name.toLowerCase().includes(termo) ||
        p.code_sku.toLowerCase().includes(termo)
      );
    }
  }

  // Função auxiliar para carregar todos os produtos
  // carregarTodosOsProdutos() {
  //   this.produtoService.getProdutos().subscribe({ // Assumindo que você tem um método .listar()
  //     next: (data: Produto[]) => {
  //       setTimeout(() => {
  //         this.produtos = data;
  //       }, 1000);
  //     },
  //     error: (err: any) => {
  //       console.error('Erro ao carregar produtos', err);
  //       this.mostrarErro('Falha ao carregar a lista de produtos.', 'danger');
  //     }
  //   });
  // }

  carregarTodosOsProdutos() {
    this.prodServiceMock.getProducts().subscribe({ // Assumindo que você tem um método .listar()
      next: (data: Product[]) => {
        setTimeout(() => {
          this.products = data;
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
      categoria: produto.categoria || '',
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
    const name = formValue.name?.toString().trim() || ''; // Mantém case original ou ajuste conforme necessidade
    const codeSku = formValue.code_sku?.toString().trim() || '';

    if (!name) {
      this.mostrarErro('Nome obrigatório.', 'danger');
      return;
    }

    // 2. Montagem do Payload (Objeto Completo)
    const payload = {
      id: formValue.id, // Pode ser null se for novo
      name: name,
      category: formValue.category?.toString().trim() || '',
      stock: Number(formValue.stock) || 0,
      price: parseFloat((formValue.price + '').replace(',', '.')) || 0,
      sale: parseFloat((formValue.sale + '').replace(',', '.')) || 0,
      code_sku: codeSku,
      ativo: true
    };

    console.log('Payload Enviado:', payload);

    this.loading = true;

    // 3. Chamada API CORRETA: Passe o OBJETO (payload), não apenas o ID
    const request$ = this.modoEdicao
      ? this.prodServiceMock.updateProduct(payload) // ✅ Correto: Passa o objeto
      : this.prodServiceMock.addProduct(payload);   // ✅ Correto: Passa o objeto

    request$.subscribe({
      next: (resposta) => {
        console.log('Resposta do Backend/Mock:', resposta);

        this.mostrarErro(
          this.modoEdicao ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!',
          'success'
        );

        // Opcional: Atualização otimista na lista local
        // Se for edição, atualiza o item existente. Se for criação, adiciona ao final.
        if (this.modoEdicao) {
          const index = this.products.findIndex(p => p.id === resposta.id);
          if (index !== -1) {
            this.products[index] = resposta;
          }
        } else {
          // Adiciona o novo produto retornado pela API (que já tem o ID gerado)
          this.products.push(resposta);
        }

        // Recarrega a lista para garantir consistência (especialmente com Mock/LocalStorage)
        this.carregarFakeAPI();

        this.limparForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro da API:', err);
        this.loading = false;

        // Tratamento de erro
        let msg = 'Erro ao salvar.';
        if (err.message) msg = err.message; // Mock costuma retornar mensagem direta

        this.mostrarErro(msg, 'danger');
      }
    });
  }

  // Função auxiliar para validar (mantém seu código limpo)
  private validarCampos(formValue: any): string[] {
    const erros: string[] = [];
    const name = formValue.name?.toString().trim().toLowerCase() || '';

    if (!name) erros.push('Nome é obrigatório.');
    else if (!/^[a-zA-ZÀ-ÿ\s.\-0-9]+$/.test(name)) erros.push('Nome contém caracteres inválidos.');

    const categoria = formValue.categoria?.toString().trim().toLowerCase() || '';
    if (!categoria || categoria === 'selecione') erros.push('Categoria inválida.');

    const stock = Number(formValue.stock) || 0;
    if (stock < 0) erros.push('Estoque negativo.');

    const price = parseFloat((formValue.price + '').replace(',', '.')) || 0;
    const sale = parseFloat((formValue.sale + '').replace(',', '.')) || 0;

    if (price <= 0) erros.push('Preço Custo inválido.');
    if (sale <= 0) erros.push('Preço Venda inválido.');

    return erros;
  }

  // Função auxiliar para montar o objeto
  private montarPayload(formValue: any): any {
    return {
      id: formValue.id,
      name: formValue.name?.toString().trim(),
      category: formValue.category?.toString().trim().toLowerCase() || '',
      stock: Number(formValue.stock) || 0,
      price: parseFloat((formValue.price + '').replace(',', '.')) || 0,
      sale: parseFloat((formValue.sale + '').replace(',', '.')) || 0,
      code_sku: formValue.code_sku?.toString().trim(),
      ativo: true
    };
  }

  limparForm() {
    this.modoEdicao = false;
    this.produtoSelecionado = null;
    this.produtoForm.reset({
      id: null, name: '', ccode_sku: '', category: '',
      price: 0, sale: 0, stock: 0
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
      name: ['', [Validators.required]],
      category: ['', [Validators.required]],
      stock: [0, [Validators.min(0)]],
      price: [0, [Validators.min(0.01)]],
      sale: [0, [Validators.min(0.01)]],
      code_sku: ['', [Validators.required]]
    });

    // INSCREVA-SE NAS MUDANÇAS DO PREÇO DE CUSTO
    this.produtoForm.get('price')?.valueChanges.subscribe(custo => {
      console.log('Valor de custo mudou para:', custo); // Debug

      // 👇 ESCUTA MUDANÇAS NO PREÇO DE CUSTO E ATUALIZA O PREÇO DE VENDA AUTOMATICAMENTE
      this.produtoForm.get('price')?.valueChanges.subscribe(custo => {
        if (custo && custo > 0) {
          const vendaCalculada = custo * 1.667;
          const vendaFormatada = parseFloat(vendaCalculada.toFixed(2));

          console.log(`Custo: ${custo} → Venda calculada: ${vendaFormatada}`);

          this.produtoForm.patchValue({
            sale: vendaFormatada
          }, { emitEvent: false }); // Evita loop infinito
        } else {
          this.produtoForm.patchValue({
            sale: null
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

  // Fake API é situação.
  get prodStatsFake() {
    const filtro = String(this.categoriaFiltro || '').trim();

    if (!filtro || filtro === 'Todas') {
      return this.products;
    }

    return this.products.filter(p => p.category === filtro);
  }

  // Getters para acessar os controles facilmente no template
  get nomeControl(): AbstractControl | null {
    return this.produtoForm.get('name');
  }

  get categoriaControl(): AbstractControl | null {
    return this.produtoForm.get('category');
  }

  get estoqueControl(): AbstractControl | null {
    return this.produtoForm.get('stock');
  }

  get precoCustoControl(): AbstractControl | null {
    return this.produtoForm.get('price');
  }

  get precoVendaControl(): AbstractControl | null {
    return this.produtoForm.get('sale');
  }

  get codigoBarrasControl(): AbstractControl | null {
    return this.produtoForm.get('code_sku');
  }
}