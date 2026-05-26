import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ConfiguracoesService } from '../../../core/services/configuracoes.service';
import { CommonModule } from '@angular/common';
import { MagnumDesignSystemModule } from 'magnum-design-system';
import { TesteAlertService } from '../../../core/services/teste-alert.service';
import { LoadingComponent } from '../../dashboard/loading/loading.component';

@Component({
  selector: 'app-configuracoes',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MagnumDesignSystemModule,
    LoadingComponent
  ],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css']
})
export class ConfiguracoesComponent implements OnInit {
  configForm: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isReadOnly: boolean = true;
  isDisabled: boolean = false;
  emailMascarado: string = '';

  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private configService: ConfiguracoesService,
    private testealertService: TesteAlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.configForm = this.fb.group({
      id: [null],
      nome: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      cnpj: ['', [Validators.required, validaCnpj]],
      telefone: [''],
      endereco: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;

    console.log('🔄 Iniciando carregamento de dados...');
    // Chama sua API .NET para buscar as configs atuais
    this.configService.getConfiguracoes().subscribe({
      next: (dados: any) => {
        console.log('✅ Dados recebidos da API:', dados); // ← Olhe no Console do Navegador (F12)

        const cnpjLimpo = dados.cnpj ? String(dados.cnpj).replace(/\D/g, '') : '';

        console.log('📝 CNPJ limpo:', cnpjLimpo);

        // Preenche o formulário com os dados, incluindo o ID
        this.configForm.patchValue({
          id: dados.id,
          nome: dados.nomeEmpresa || '',
          email: dados.emailContato || '',
          cnpj: cnpjLimpo,
          telefone: dados.telefone,
          endereco: dados.endereco
        });
        this.emailMascarado = this.mascararEmail(dados.emailContato);
        console.log('🎭 E-mail mascarado:', this.emailMascarado); // ← VEJA ISSO TAMBÉM
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarErro('Erro ao carregar configurações.', 'danger');
        this.mensagemErro = 'Erro ao carregar configurações.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Transforma 'admin@magnum.com' em 'ad***@ma***.com'
   */
  mascararEmail(email: string): string {
    if (!email) return '';

    const partes = email.split('@');
    if (partes.length !== 2) return email;

    const usuario = partes[0];
    const dominio = partes[1];

    // Lógica para o usuário (ex: admin -> ad*** )
    let usuarioMascarado = '';
    if (usuario.length <= 2) {
      usuarioMascarado = '*'.repeat(usuario.length);
    } else {
      // Mantém as 2 primeiras letras e esconde o resto
      usuarioMascarado = usuario.substring(0, 2) + '*'.repeat(usuario.length - 2);
    }

    // Lógica para o domínio (ex: magnum.com -> ma***.com)
    const partesDominio = dominio.split('.');
    let dominioMascarado = '';
    
    if (partesDominio.length > 1) {
      const nomeDominio = partesDominio[0];
      const extensao = partesDominio.slice(1).join('.');

      if (nomeDominio.length <= 2) {
        dominioMascarado = '*'.repeat(nomeDominio.length) + '.' + extensao;
      } else {
        // Mantém as 2 primeiras letras do domínio
        dominioMascarado = nomeDominio.substring(0, 2) + '*'.repeat(nomeDominio.length - 2) + '.' + extensao;
      }
    } else {
      dominioMascarado = '*'.repeat(dominio.length);
    }

    return `${usuarioMascarado}@${dominioMascarado}`;
  }

  // mascaraCnpj(event: any) {
  //   let value = event.target.value.replace(/\D/g, ""); // Remove tudo que não é número

  //   if (value.length > 14) value = value.slice(0, 14); // Limita a 14 números

  //   // Aplica a máscara
  //   if (value.length > 12) {
  //     value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
  //   } else if (value.length > 8) {
  //     value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+).*/, "$1.$2.$3/$4");
  //   } else if (value.length > 5) {
  //     value = value.replace(/^(\d{2})(\d{3})(\d+).*/, "$1.$2.$3");
  //   } else if (value.length > 2) {
  //     value = value.replace(/^(\d{2})(\d+).*/, "$1.$2");
  //   }

  //   // Atualiza o valor do input manualmente
  //   event.target.value = value;

  //   // Atualiza o valor no FormControl (importante para a validação funcionar)
  //   this.configForm.get('cnpj')?.setValue(value, { emitEvent: false });
  // }

  salvarEmpresa() {
    if (this.configForm.invalid) {
      this.mensagemErro = 'Preencha os campos obrigatórios.';
      console.warn('Formulário Inválido!', this.configForm.errors);
      alert('Por favor, corrija os campos destacados em vermelho.');
      return;
    }

    const dadosParaEnviar = {
      id: this.configForm.value.id, // ← Garante que o ID está indo
      cnpj: this.configForm.value.cnpj,
      telefone: this.configForm.value.telefone,
      endereco: this.configForm.value.endereco
    };

    console.log('Enviando para atualização:', dadosParaEnviar); // ← Debug

    this.configService.atualizarConfiguracoes(dadosParaEnviar).subscribe({
      next: () => {
        // Limpa a mensagem após 3 segundos
        setTimeout(() => {
          this.mostrarErro('Configurações salvas com sucesso!', 'success');
          this.mensagemSucesso = 'Configurações salvas com sucesso!';
          this.mensagemErro = '';
        }, 3000);
      },
      error: (err) => {
        this.mostrarErro('Falha ao salvar. Tente novamente.', 'danger');
        this.mensagemErro = 'Falha ao salvar. Tente novamente.';
        this.mensagemSucesso = '';
      }
    });
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
}

export function validaCnpj(control: AbstractControl): ValidationErrors | null {
  let cnpj = control.value;

  // Se estiver vazio, não valida (deixe Validators.required cuidar disso)
  if (!cnpj) return null;

  // Converte para string e remove TUDO que não é dígito
  cnpj = String(cnpj).replace(/[^\d]/g, '');

  // Verifica se sobrou exatamente 14 dígitos
  if (cnpj.length !== 14) {
    console.warn('CNPJ tem tamanho errado:', cnpj, 'Tamanho:', cnpj.length);
    return { 'invalido': true };
  }

  // Rejeita CNPJs com todos os dígitos iguais (ex: 00.000.000/0000-00)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    console.warn('CNPJ com dígitos repetidos:', cnpj);
    return { 'invalido': true };
  }

  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    console.warn('Primeiro dígito verificador falhou. Esperado:', resultado, 'Obtido:', digitos.charAt(0));
    return { 'invalido': true };
  }

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    console.warn('Segundo dígito verificador falhou. Esperado:', resultado, 'Obtido:', digitos.charAt(1));
    return { 'invalido': true };
  }

  // Se chegou aqui, é válido!
  console.log('✅ CNPJ VÁLIDO:', cnpj);
  return null;
}