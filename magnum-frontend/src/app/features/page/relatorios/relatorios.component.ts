import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { MovimentoService } from '../../../core/services/movimento.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TesteAlertService } from '../../../core/services/teste-alert.service';
import { LoadingComponent } from '../../dashboard/loading/loading.component';
import { FiltroMovimento, Movimento } from '../../../core/models/movimento.model';
import { MagnumDesignSystemModule } from 'magnum-design-system';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { FiltroMoviment, Movement } from '../../../shared/models/mock-movement';
import { MovementServiceMock } from '../../../shared/services/movement.service.mock';


@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, MagnumDesignSystemModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent implements OnInit {
  filtroForm: FormGroup
  listaMovimentacoes: any[] = [];
  dataInicio: string = '';
  dataFim: string = '';
  movimentos: Movimento[] = [];

  movements: Movement[] = [];
  filteredMovements: Movement[] = [];

  // Filtros
  startDate: string = '';
  endDate: string = '';
  selectedType: string = 'todos'; // 'todos', 'entrada', 'saida'

  tipoMovimentos: { value: any, label: string }[] = [
    { value: '', label: 'todos' },
    { value: 'entrada', label: 'entrada' },
    { value: 'saida', label: 'saida' }
  ];

  produtosOptions: { value: any, label: string }[] = [
    { value: '', label: 'Todos os Produtos' }
  ];

  loading: boolean = false;

  constructor(
    private movimentoService: MovimentoService,
    private alertService: TesteAlertService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private movementService: MovementServiceMock
  ) {
    this.filtroForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      type: [''],
      productId: [null]
    });
  }

  ngOnInit() {
    // Carrega o intervalo futuro de 30 dias por padrão ao abrir a tela
    // const hoje = new Date();
    // const trintaDiasDepois = new Date();
    // trintaDiasDepois.setDate(hoje.getDate() + 30);
    // // Formata para YYYY-MM-DD (formato esperado pelo input type="date")
    // this.filtroForm.patchValue({
    //   dataInicio: this.formatarDataParaInput(hoje),
    //   dataFim: this.formatarDataParaInput(trintaDiasDepois)
    // });
     // Define datas padrão (últimos 30 dias)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];

    this.carregarMovimentacoes();
  }

  carregarMovimentacoes(): void {
    this.loading = true;
    this.movementService.getAllMovements().subscribe({
      next: (data) => {
        this.movements = data;
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    if (!this.startDate || !this.endDate) {
      this.filteredMovements = this.movements;
      return;
    }

    this.loading = true;
    this.movementService.filterMovements(
      this.startDate,
      this.endDate,
      this.selectedType === 'todos' ? undefined : (this.selectedType as 'entrada' | 'saida')
    ).subscribe({
      next: (data) => {
        this.filteredMovements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onGerarRelatorio(): void {
    this.aplicarFiltros();
  }

  onLimparFiltros(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedType = 'todos';
    this.carregarMovimentacoes();
  }

  baixarPDF() {
    if (this.movements.length === 0) {
      this.alertService.warning('Não há dados para exportar.');
      return;
    }

    // 1. Prepara os dados para a tabela (Array de Arrays)
    const bodyData = this.movements.map(item => [
      new Date(item.date).toLocaleDateString('pt-BR'),
      item.productName,
      item.category,
      item.type,
      item.quantity,
      item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      item.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      item.responsible
    ]);

    // 2. Cria o documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Movimentação - Magnum Tubos e Conexões', 14, 20);

    // Subtítulo com datas
    doc.setFontSize(11);
    doc.setTextColor(100);
    const periodo = `Período: ${this.filtroForm.value.startDate} até ${this.filtroForm.value.endDate}`;
    doc.text(periodo, 14, 30);

    // 3. Gera a Tabela
    autoTable(doc, {
      startY: 40, // Começa abaixo do título
      head: [['Data', 'Produto', 'Categoria', 'Tipo', 'Qtd', 'V. Unit.', 'Total', 'Responsável']],
      body: bodyData,
      theme: 'grid', // Estilo da tabela (striped, grid, plain)
      headStyles: {
        fillColor: [255, 193, 7], // Cor amarela da Magnum (RGB)
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Cinza claro para linhas alternadas
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 }, // Data
        1: { halign: 'center', cellWidth: 40 }, // Produto
        2: { halign: 'center', cellWidth: 30 }, // Categoria
        3: { halign: 'center', cellWidth: 20 }, // Tipo
        4: { halign: 'center', cellWidth: 15 }, // Qtd centralizado
        5: { halign: 'right' }, // V. Unit. alinhado à direita
        6: { halign: 'right', fontStyle: 'bold' }, // Total alinhado à direita e negrito
        7: { halign: 'center' }
      }
    });

    // 4. Adiciona Rodapé com Total Geral (Opcional mas recomendado)
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Geral: ${this.getTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, finalY + 10);

    // 5. Salva o Arquivo
    const fileName = `Magnum_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

  formatarDataParaInput(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  buscarFakeApiRelatorio() {
    // Validação básica
    if (!this.filtroForm.value.startDate || !this.filtroForm.value.endDate) {
      this.alertService.warning('Preencha as datas de início e fim.');
      return;
    }

    this.loading = true;
    this.movements = [];

    const filtro: FiltroMoviment = {
      startDate: this.filtroForm.value.startDate,
      endDate: this.filtroForm.value.endDate,
      type: this.filtroForm.value.type || undefined,
      productId: this.filtroForm.value.productId || undefined
    };

    console.log('Enviando filtro:', filtro); // Debug

    this.movementService.filterMovements(filtro.startDate, filtro.endDate, filtro.type ? 'entrada' : 'saida').subscribe({
      next: (dados) => {
        this.movements = dados;
        console.log('Movimento:', dados);
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();

          if (dados.length === 0) {
            this.alertService.info('Nenhum movimento encontrado no período selecionado.');
          } else {
            this.alertService.success(`Relatório gerado com sucesso! ${dados.length} registros.`);
          }
        }, 1500)
      },
      error: (err) => {
        console.error('Erro ao carregar relatório:', err);
        this.alertService.danger('Erro ao carregar relatório. Tente novamente.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // buscarRelatorio(): void {
  //   // Validação básica
  //   if (!this.filtroForm.value.startDate || !this.filtroForm.value.endDate) {
  //     this.alertService.warning('Preencha as datas de início e fim.');
  //     return;
  //   }

  //   this.loading = true;
  //   this.movimentos = [];

  //   const filtro: FiltroMovimento = {
  //     dataInicio: this.filtroForm.value.dataInicio,
  //     dataFim: this.filtroForm.value.dataFim,
  //     tipoMovimento: this.filtroForm.value.tipoMovimento || undefined,
  //     produtoId: this.filtroForm.value.produtoId || undefined
  //   };

  //   console.log('Enviando filtro:', filtro); // Debug

  //   this.movimentoService.getRelatorio(filtro).subscribe({
  //     next: (dados) => {
  //       this.movimentos = dados;
  //       console.log('Movimento:', dados);
  //       setTimeout(() => {
  //         this.loading = false;
  //         this.cdr.detectChanges();

  //         if (dados.length === 0) {
  //           this.alertService.info('Nenhum movimento encontrado no período selecionado.');
  //         } else {
  //           this.alertService.success(`Relatório gerado com sucesso! ${dados.length} registros.`);
  //         }
  //       }, 1500)
  //     },
  //     error: (err) => {
  //       console.error('Erro ao carregar relatório:', err);
  //       this.alertService.danger('Erro ao carregar relatório. Tente novamente.');
  //       this.loading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  // limparFiltros(): void {
  //   const hoje = new Date();
  //   const trintaDiasDepois = new Date();
  //   trintaDiasDepois.setDate(hoje.getDate() + 30);

  //   this.filtroForm.reset({
  //     dataInicio: this.formatarDataParaInput(hoje),
  //     dataFim: this.formatarDataParaInput(trintaDiasDepois),
  //     tipoMovimento: '',
  //     produtoId: null
  //   });
  // }

  // getTotal(): number {
  //   return this.movimentos.reduce((acc, item) => acc + item.valorTotal, 0);
  // }

  getTotal(): number {
    return this.movements.reduce((acc, item) => acc + item.totalValue, 0);
  }

  exportarParaPDF() {
    if (this.movimentos.length === 0) {
      this.alertService.warning('Não há dados para exportar.');
      return;
    }

    // 1. Prepara os dados para a tabela (Array de Arrays)
    const bodyData = this.movimentos.map(item => [
      new Date(item.dataMovimento).toLocaleDateString('pt-BR'),
      item.produtoNome,
      item.categoriaNome,
      item.tipoMovimento,
      item.quantidade,
      item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      item.responsavel
    ]);

    // 2. Cria o documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Movimentação - Magnum Tubos e Conexões', 14, 20);

    // Subtítulo com datas
    doc.setFontSize(11);
    doc.setTextColor(100);
    const periodo = `Período: ${this.filtroForm.value.dataInicio} até ${this.filtroForm.value.dataFim}`;
    doc.text(periodo, 14, 30);

    // 3. Gera a Tabela
    autoTable(doc, {
      startY: 40, // Começa abaixo do título
      head: [['Data', 'Produto', 'Categoria', 'Tipo', 'Qtd', 'V. Unit.', 'Total', 'Responsável']],
      body: bodyData,
      theme: 'grid', // Estilo da tabela (striped, grid, plain)
      headStyles: {
        fillColor: [255, 193, 7], // Cor amarela da Magnum (RGB)
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Cinza claro para linhas alternadas
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 }, // Data
        1: { halign: 'center', cellWidth: 40 }, // Produto
        2: { halign: 'center', cellWidth: 30 }, // Categoria
        3: { halign: 'center', cellWidth: 20 }, // Tipo
        4: { halign: 'center', cellWidth: 15 }, // Qtd centralizado
        5: { halign: 'right' }, // V. Unit. alinhado à direita
        6: { halign: 'right', fontStyle: 'bold' }, // Total alinhado à direita e negrito
        7: { halign: 'center' }
      }
    });

    // 4. Adiciona Rodapé com Total Geral (Opcional mas recomendado)
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Geral: ${this.getTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, finalY + 10);

    // 5. Salva o Arquivo
    const fileName = `Magnum_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
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
}