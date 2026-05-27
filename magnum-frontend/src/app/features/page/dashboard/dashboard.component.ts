import { Component, OnInit, ChangeDetectorRef, ViewChild, NO_ERRORS_SCHEMA, Output, EventEmitter, OnDestroy, AfterViewInit, ElementRef, Input, SimpleChanges, OnChanges, Inject } from '@angular/core';
import { ProdutoService } from '../../../core/services/produto.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LoadingComponent } from '../../dashboard/loading/loading.component';
import { finalize, forkJoin, Subscription, tap, timeout } from 'rxjs';
import { AlertService } from '../../../core/services/alert.service';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { environment } from '../../../../environments/environment';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { LoadingChartComponent } from '../../dashboard/loading-chart/loading-chart.component';
import { Resumo } from '../../../core/models/resumo.model';
// import { saveAs } from 'file-saver';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DeleteComponent } from '../../../shared/components/delete/delete.component';
import { ModalService } from '../../../core/services/modal.service';
import { Produto } from '../../../core/models/produto.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { StockAlertComponent } from '../../dashboard/stock-alert/stock-alert.component';
import { PercentagePipe } from '../../../shared/pipes/percentage-pipe';
import { RealtimeService } from '../../../core/services/realtime.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TesteAlertService } from '../../../core/services/teste-alert.service';
import { MagnumDesignSystemModule } from 'magnum-design-system';
import { DashboardServiceMock } from '../../../shared/services/dashboard.service.mock';
import { ProductServiceMock } from '../../../shared/services/product.service.mock';
import { Product } from '../../../shared/models/mock-data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PercentagePipe,
    StockAlertComponent,
    NgChartsModule,
    MagnumDesignSystemModule
  ],
  providers: [RealtimeService],
  schemas: [NO_ERRORS_SCHEMA],
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('500ms ease-out')
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {

  showSelectAll: boolean = true; // Controla a exibição do checkbox de selecionar todos

  chart!: Chart;

  apiEndpoint = environment.apiUrl;
  dataAtualizacao = environment.ultimaAtualizacao;

  dataHoraAtualizacao: string = '';
  private timerId: any;

  form: FormGroup
  mostrarForm = false;
  novoProduto = { nome: '', categoria: '', codigoBarras: '', estoque: 0, precoCusto: 0, precoVenda: 0 };
  mensagemSucesso: string | null = null;
  produtos: Produto[] = [];
  error: string | null = null;
  loading: boolean = false;
  isLoading: boolean = false;
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
  categoriaFiltro: string = 'Todas';
  resumo: Resumo | null = null;
  modelOpen: boolean = false;
  produtoSelecionado: any = null;
  isAdmin = false;
  loadingChart: boolean = false;
  progressFill!: number;

  termoBusca: string = '';

  selecionarTodos: boolean = false;
  public selecionados: number[] = [];

  // Propriedades do Modal
  exibirModalExportacao: boolean = false;

  isChecked: boolean = false;
  faturamento: any;
  modalAberto = false;

  modalAdicionarVisivel = false;
  modalExcluirVisivel = false;
  modalEditarVisivel = false;
  modalExportarVisivel = false;
  modalExcluirSelecionadosVisivel = false;

  adicionarProduto: string | null = null;
  produtoExcluir: any = null;
  produto: Produto[] = [];

  lucroCalculado: number = 0;
  margemCalculada: number = 0;
  produtoOriginal: any = {};

  public configuradas: any[] = [];

  stats: any;

  product: Product[] = [];
  
  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
    private testealertService: TesteAlertService,
    private dashService: DashboardServiceMock,
    private prodService: ProductServiceMock
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s.\-0-9]+$/)]],
      estoque: [0, [Validators.min(0)]],
      categoria: ['', Validators.required],
      codigoBarras: ['', [Validators.required]],
      precoCusto: [0, [Validators.min(0.01)]],
      precoVenda: [0, [Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();

    this.dashboradStats();
    this.prodStats();
    // this.carregarDadosIniciais();
    this.carregarGraficos();
    // this.buscarProdutos();
    // this.carregarResumo();
    // this.carregarProdutos();
    this.iniciarRelogio();
  }

  dashboradStats() {
    this.loading = true;
    this.dashService.getDashboardStats().subscribe(data => {
      this.stats = data;
      console.log('Dados do Dashboard', data);
      this.mostrarErro("Produtos com sucesso!", "success");
      this.loading = false;
      this.cdr.detectChanges();
    }
    )
  }

  prodStats() {
    this.prodService.getProducts().subscribe(data => {
      this.product = data;
      this.dataHoraAtualizacao = new Date().toLocaleString('pt-BR');
    })
  }

  ngOnDestroy(): void {
    // Limpa o timer quando sair da página para evitar vazamento de memória
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  carregarDados() {

    // AQUI ESTÁ O TRUQUE:
    // Nós preparamos os dados EXATAMENTE como o mds-table precisa

    // Passo A: Definir quais colunas existem
    // this.colunasConfiguradas = [
    //   { field: 'checkbox', header: '', templateRef: 'checkbox', headerTemplateRef: 'checkboxHeader' },
    //   { field: 'id', header: 'ID' },
    //   { field: 'nome', header: 'Nome' },
    //   { field: 'categoria', header: 'Categoria' },
    //   { field: 'estoque', header: 'Estoque', templateRef: 'estoque' }, // O rowClassFn vai pintar essa linha
    //   { field: 'precoCusto', header: 'P. Custo', type: 'currency: BRL' }
    // ];

    // Se for Admin, adiciona mais colunas no array
    // if (this.isAdmin) {
    //   this.colunasConfiguradas.push(
    //     { field: 'precoVenda', header: 'P. Venda (R$)', type: 'currency: BRL' },
    //     { field: 'lucro', header: 'P. Lucro (R$)', type: 'currency: BRL' }, // Veja que criei um campo 'lucro' nos dados abaixo
    //     { field: 'margem', header: 'Margem (%)', type: 'percentage', templateRef: 'margem' }
    //   );
    // }

    // Passo B: Preparar os dados (Adicionar campos calculados se necessário)
    this.configuradas = this.produtosFiltrados.map(p => {
      const precoCusto = p.precoCusto || 0; // Tanta faz se precisa funcionar no 'currency' ou não, o importante é garantir que seja número
      const precoVenda = p.precoVenda || 0;
      const lucro = precoVenda - precoCusto || 0; // Campo calculado para mostrar o lucro

      // Margem sobre venda (padrão comercial)
      const margemSobreVenda = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;

      // OU: Margem sobre custo (alternativa)
      // const margemSobreCusto = precoCusto > 0 ? (lucro / precoCusto) * 100 : 0;
      return {
        ...p,
        precoCusto: parseFloat(precoCusto.toFixed(2)), //por favor funcione "currency"???
        precoVenda: parseFloat(precoVenda.toFixed(2)),
        lucro: parseFloat(lucro.toFixed(2)),
        margem: parseFloat(margemSobreVenda.toFixed(2)),
      };
    });

    // Coluna de ações sempre no final
    // this.colunasConfiguradas.push({ field: 'acoes', header: 'Ações', templateRef: 'acoes', stickyEnd: true });

    // Opcional: Resetar seleção ao recarregar dados
    this.selecionados = [];
  }

  // Lógica visual condicional (verde/vermelho) que você mencionou gostar
  definirClasseEstoque(row: any): string {
    if (row.quantidade < 5) return 'estoque-critico'; // Classe CSS global ou :host-context
    if (row.quantidade < 20) return 'estoque-baixo';
    return '';
  }

  mostrarErro(mensagem: string, tipo: 'success' | 'danger' | 'warning' | 'info' = 'danger') {
    this.loading = false;
    switch (tipo) {
      case 'success':
        this.testealertService.success(mensagem);
        break;
      case 'warning':
        this.testealertService.warning(mensagem);
        break;
      case 'info':
        this.testealertService.info(mensagem);
        break;
      default:
        this.testealertService.danger(mensagem);
    }
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  private carregarDadosIniciais() {
    this.loadingChart = true;
    // Exemplo usando forkJoin para paralelismo controlado
    forkJoin({
      produtos: this.produtoService.getProdutos(),
      resumo: this.dashboardService.getResumo(),
      categorias: this.dashboardService.getProdutosPorCategoria(),
      topProdutos: this.dashboardService.getTop5ProdutosCaros()
    }).subscribe({
      next: ({ produtos, resumo, categorias, topProdutos }) => {
        this.produtos = produtos;
        this.resumo = resumo;
        this.prepararGraficos(categorias, topProdutos);
        this.loadingChart = false;
      },
      error: (err) => {
        this.loadingChart = false;
        this.alertService.add(
          'Erro ao carregar dashboard', 'error');
      }
    });
  }

  // ngAfterViewInit() {
  //   setTimeout(() => this.criarGrafico(), 0);
  //   console.log(this.canvasRef);
  // }

  // carregarDados() {
  //   this.dashboardService.getTop5ProdutosCaros().subscribe(() => {
  //     setTimeout(() => this.criarGrafico(), 0);
  //   })
  // }

  // criarGrafico() {
  //   if (!this.canvasRef?.nativeElement) {
  //     console.error('Canvas NÃO encontrado');
  //     return;
  //   }

  //   // To avoid "Canvas is already in use" errors, destroy the old chart if it exists
  //   if (this.chart) {
  //     this.chart.destroy();
  //   }

  //   const ctx = this.canvasRef.nativeElement.getContext('2d');
  //   if (!ctx) return;

  //   this.chart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: [''],
  //       datasets: [{
  //         data: [],
  //         label: '',
  //         backgroundColor: ['#843292', '#848372'],
  //         borderColor: '#992673',
  //         borderWidth: 1
  //       }]
  //     }
  //   });
  // }

  // atualizarGrafico(data: any) {
  //   if (!this.chart) return;

  //   const dataset = this.chart.data.datasets[0].data as number[];
  //   this.chart.data.labels?.push(new Date().toLocaleTimeString());
  //   dataset.push(data.total);

  //   this.chart.update();
  // }

  carregarProdutos() {
    this.loading = true;
    this.produtoService.listarProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.carregarDados();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Produtos carregados:', this.produtos);

        // Salva a hora exata que os dados chegaram
        this.dataHoraAtualizacao = new Date().toLocaleString('pt-BR');
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.testealertService.danger(
          'Erro ao carregar produtos.'
        );
      }
    });
  }

  iniciarRelogio() {
    this.atualizarDataHora(); // Atualiza imediatamente

    // Atualiza a cada 1000ms (1 segundo)
    this.timerId = setInterval(() => {
      this.atualizarDataHora();
    }, 1000);
  }

  atualizarDataHora() {
    const agora = new Date();

    // Formata para: DD/MM/AAAA, HH:MM:SS
    this.dataHoraAtualizacao = agora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.cdr.detectChanges();
  }

  // Getter para facilitar a leitura no HTML
  get hasStockAlert(): boolean {
    return this.resumo?.semEstoque ? this.resumo.semEstoque > 0 : false;
  }

  // get gridColumns() {
  //   return this.isAdmin ? 'auto auto auto auto' : 'auto auto';
  // }

  get gridColumns() {
    return 'auto auto auto auto';
  }

  get gridColumns2() {
    return 'auto auto';
  }

  // Função para selecionar/desmarcar todos
  selecionarTds(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selecionados = this.configuradas.map(row => row.id);
    } else {
      this.selecionados = [];
    }
  }

  // Abrir modal
  abrirModalExportacao() {
    if (this.selecionados.length === 0) {
      alert('Selecione pelo menos um produto.');
      return;
    }
    this.exibirModalExportacao = true;
  }

  // Fechar modal
  fecharModalExportacao() {
    this.exibirModalExportacao = false;
  }

  // Confirmar exportação
  confirmarExportacaoSelecionados() {
    this.fecharModalExportacao();

    this.produtoService.exportarSelecionadosExcel(this.selecionados).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `produtos_selecionados_${this.selecionados.length}_itens.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Limpar seleção após sucesso
        this.selecionados = [];
        this.selecionarTodos = false;
      },
      error: (err) => {
        console.error('Erro ao exportar:', err);
        alert('Erro ao gerar o arquivo.');
      }
    });
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

  onModalEditar(produto: any) {
    console.log('🚀 abrindoModalEditar chamado com produto:', produto);

    // ✅ Primeiro, verifique se o produto é válido
    if (!produto || !produto.id) {
      console.error('❌ Produto inválido!', produto);
      return;
    }

    // ✅ Defina o produto selecionado
    this.produtoSelecionado = produto;
    console.log('✅ produtoSelecionado definido:', this.produtoSelecionado);

    // ✅ Abra o modal
    this.modelOpen = true;
    console.log('✅ Modal aberto:', this.modelOpen);

    // ❌ REMOVA ou COMENTE qualquer chamada como:
    // this.algumaCoisa.abrirModalDeConfirmacao();
    // Isso está causando o erro!
  }

  // Função auxiliar para carregar todos os produtos
  carregarTodosOsProdutos() {
    this.produtoService.getProdutos().subscribe({ // Assumindo que você tem um método .listar()
      next: (data: Produto[]) => {
        setTimeout(() => {
          this.produtos = data;
          this.isLoading = false; // Não esqueça de desligar o loading aqui também!
          this.cdr.detectChanges();
        }, 1000);
      },
      error: (err: any) => {
        console.error('Erro ao carregar produtos', err);
        this.testealertService.danger(
          'Falha ao carregar a lista de produtos.'
        )
        this.isLoading = false; // Desliga o loading no erro
      }
    });
  }

  // === GRÁFICO DE PIZZA (Produtos por Categoria) ===
  public pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Produtos por Categoria'
      }
    },
    maintainAspectRatio: false
  };

  public pieChartLabels: string[] = [];
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  public pieChartType: ChartType = 'pie';
  public pieChartColors = [
    {
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }
  ];

  // === GRÁFICO DE BARRAS (Top 5 Produtos Mais Caros) ===
  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Top 5 Produtos Mais Caros'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return 'R$ ' + value;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  public barChartLabels: string[] = [];
  public barChartData: ChartData<'bar'> = {
    labels: ['Produto A', 'Produto B', 'Produto C'],
    datasets: [{ data: [], label: 'Preço (R$)', backgroundColor: '#36A2EB' }]
  };
  public barChartType: ChartType = 'bar';

  public dadosTopProdutos = {
    labels: ['Produto A', 'Produto B', 'Produto C'],
    datasets: [
      {
        data: [10, 20, 30], // Seus números vão aqui dentro
        label: 'Preço (R$)', // Opcional, mas recomendado
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Opcional: cores das barras/setores
        borderColor: 'rgba(54, 162, 235, 1)', // Opcional: cor da borda
        borderWidth: 1
      }
    ]
  };

  public opcoesGrafico: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // Gráfico de Barras - Top 5 Produtos
  public labelsTopProdutos: string[] = [];
  // public dadosTopProdutos: number[] = [];

  private buscarProdutos(): void {
    this.loading = true;

    this.produtoService.getProdutos().pipe(
      timeout(5000),

      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.produtos = data;
        this.testealertService.success(
          'Atualizando produtos com sucesso!'
        );
      },
      error: (err) => {
        if (err.name === 'TimeoutError') {
          this.testealertService.danger('Erro ao carregar dados.'), err;
        } else {
          this.testealertService.info('Tempo limite excedido. Verifique o servidor.');
        }
      }
    })
  }

  private tratarSucesso(data: any): void {
    this.produtos = data;
    this.testealertService.success(
      'Atualizando produtos com sucesso!'
    );
  }

  private tratarErro(err: any): void {

    // let mensagem = 'Erro ao carregar dados.';
    // let tipo: 'info' | 'error' | 'success' = 'error';

    // if (err.name === 'TimeoutError') {
    //   mensagem = 'Tempo limite excedido. Verifique o servidor.';
    //   tipo = 'info';
    // }

    this.testealertService.danger('Erro ao carregar dados.');

    if (err.name === 'TimeoutError') {
      this.testealertService.info('Tempo limite excedido. Verifique o servidor.');
    }

    this.testealertService.danger('') ?? this.testealertService.info('');
  }

  // private mostrarAlerta(mensagem: string, tipo: 'info' | 'error' | 'success'): void {
  //   this.alertMessage = mensagem;
  //   this.alertType = tipo;
  //   this.showAlert = true;
  // }

  // openProdutoModal() {
  //   if (this.adicionarProduto && typeof this.adicionarProduto.openModal === 'function') {
  //     this.adicionarProduto.openModal();
  //   } else {
  //     console.error('adicionarProduto ou seu método openModal não está disponível.');
  //   }
  // }


  get produtosFiltrados() {
    // Garante que é uma string antes de chamar trim()
    const filtro = String(this.categoriaFiltro || '').trim();

    if (!filtro || filtro === 'Todas') {
      return this.produtos;
    }

    return this.produtos.filter(p => p.categoria === filtro);
  }

  get categoriasUnicas(): { value: any, label: string }[] {
    const categorias = this.produtos.map(p => p.categoria).filter(Boolean);
    return [{ value: '', label: 'Todas', ...new Set(categorias) }];
  }

  carregarGraficos() {
    // Carregar produtos por categoria
    this.loadingChart = true
    this.progressFill = 0;

    const totalRequisicoes = 2; // Quantidade de chamadas que você vai fazer
    let requisicoesConcluidas = 0;

    // Função auxiliar para atualizar o progresso
    const finalizarRequisicao = () => {
      requisicoesConcluidas++;
      this.progressFill = Math.round((requisicoesConcluidas / totalRequisicoes) * 100);

      // Só esconde o loading quando TUDO terminou
      if (requisicoesConcluidas === totalRequisicoes) {
        setTimeout(() => {
          this.loadingChart = false;
          this.cdr.detectChanges();
        }, 500); // Delayzinho suave pra UX
      }
    };

    // this.dashboardService.getProdutosPorCategoria().subscribe({
    //   next: (dados) => {
    //     this.pieChartLabels = dados.map(d => d.categoria);
    //     this.pieChartData = {
    //       labels: this.pieChartLabels,
    //       datasets: [{
    //         data: dados.map(d => d.quantidade),
    //         backgroundColor: dados.map(d => d.cor || this.gerarCorAleatoria())
    //       }]
    //     };
    //     finalizarRequisicao(); // Avisa que terminou essa parte
    //   },
    //   error: (err) => {
    //     console.error('Erro no gráfico de pizza', err);
    //     this.testealertService.danger(
    //       'Erro no gráfico de pizza'
    //     );
    //     finalizarRequisicao(); // Conta como concluído (mesmo com erro) pra não travar a tela
    //   }
    // });

    this.prodService.getProducts().subscribe({
      next: (dados) => {
        this.pieChartLabels = dados.map(d => d.category);
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{
            data: dados.map(d => d.stock),
            backgroundColor: ["#498392", "#947573"]
          }]
        };
        finalizarRequisicao(); // Avisa que terminou essa parte
      },
      error: (err) => {
        console.error('Erro no gráfico de pizza', err);
        this.testealertService.danger(
          'Erro no gráfico de pizza'
        );
        finalizarRequisicao(); // Conta como concluído (mesmo com erro) pra não travar a tela
      }
    });

    this.prodService.getProducts().subscribe({
      next: (dados) => {
        this.barChartLabels = dados.map(d => d.name);
        this.barChartData = {
          labels: this.barChartLabels,
          datasets: [{
            data: dados.map(d => d.price),
            label: 'Preço (R$)',
            backgroundColor: '#36A2EB'
          }]
        };
        finalizarRequisicao(); // Avisa que terminou essa parte
      },
      error: (err) => {
        console.error('Erro no gráfico de barras', err);
        this.testealertService.danger(
          'Erro no gráfico de barras'
        );
        finalizarRequisicao();
      }
    });

    // 2. Carregar Top 5 Produtos (Barras)
    // this.dashboardService.getTop5ProdutosCaros().subscribe({
    //   next: (dados) => {
    //     this.barChartLabels = dados.map(d => d.nome);
    //     this.barChartData = {
    //       labels: this.barChartLabels,
    //       datasets: [{
    //         data: dados.map(d => d.preco),
    //         label: 'Preço (R$)',
    //         backgroundColor: '#36A2EB'
    //       }]
    //     };
    //     finalizarRequisicao(); // Avisa que terminou essa parte
    //   },
    //   error: (err) => {
    //     console.error('Erro no gráfico de barras', err);
    //     this.testealertService.danger(
    //       'Erro no gráfico de barras'
    //     );
    //     finalizarRequisicao();
    //   }
    // });
  }

  prepararGraficos(categorias: any, topProdutos: any) {
    this.loadingChart = true;
    this.progressFill = 0;

    const totalRequisicoes = 2; // Quantidade de chamadas que você vai fazer
    let requisicoesConcluidas = 0;

    // Função auxiliar para atualizar o progresso
    const finalizarRequisicao = () => {
      requisicoesConcluidas++;
      this.progressFill = Math.round((requisicoesConcluidas / totalRequisicoes) * 100);

      // Só esconde o loading quando TUDO terminou
      if (requisicoesConcluidas === totalRequisicoes) {
        setTimeout(() => {
          this.loadingChart = false;
          this.cdr.detectChanges();
        }, 500); // Delayzinho suave pra UX
      }
    };

    this.dashboardService.getProdutosPorCategoria().subscribe({
      next: (dados) => {
        this.pieChartLabels = dados.map(d => d.categoria);
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{
            data: dados.map(d => d.quantidade),
            backgroundColor: dados.map(d => d.cor || this.gerarCorAleatoria())
          }]
        };
        finalizarRequisicao();
      },
      error: (err) => {
        console.error('Erro no gráfico de pizza', err);
        finalizarRequisicao();
      }
    });

    // 2. Carregar Top 5 Produtos (Barras)
    this.dashboardService.getTop5ProdutosCaros().subscribe({
      next: (dados) => {
        this.barChartLabels = dados.map(d => d.nome);
        this.barChartData = {
          labels: this.barChartLabels,
          datasets: [{
            data: dados.map(d => d.preco),
            label: 'Preço (R$)',
            backgroundColor: ['#667eea', '#764ba2']
          }]
        };
      },
      error: (err) => {
        console.error('Erro no gráfico de barras', err);
      }
    });
  }

  gerarCorAleatoria() {
    const cores = ['#333333', '#ffd700', '#359201', '#948342'];
    return cores[Math.floor(Math.random() * cores.length)];
  }

}