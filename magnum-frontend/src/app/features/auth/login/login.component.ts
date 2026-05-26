import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AlertComponent, AlertType } from '../../dashboard/alert/alert.component';
import { LoadingComponent } from '../../dashboard/loading/loading.component';
import { email } from '@angular/forms/signals';
import { environment } from '../../../../environments/environment';
import { UsuarioLogado } from '../../../models/logado.usuarios';
import { AlertService } from '../../../core/services/alert.service';
import { TesteAlertService } from '../../../core/services/teste-alert.service';
import { MagnumDesignSystemModule } from 'magnum-design-system';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    MagnumDesignSystemModule
  ]
})
export class LoginComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required]);

  // Chaves do LocalStorge
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Variáveis do Formulário
  loginForm: FormGroup;
  // rememberMe: boolean = false;
  hasLeftIcon: boolean = true; // Exemplo para mostrar ícone à esquerda (e-mail)
  hasRightIcon: boolean = true; // Exemplo para mostrar ícone à direita (pode ser usado para mostrar/ocultar senha)
  showPassword: boolean = false; // Controla a visibilidade da senha
  // Variáveis de Carregamento com Controle na Tela
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alertSerivce: AlertService,
    private testealertService: TesteAlertService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
      rememberMe: [false]
    });

    // ✅ NOVO: Verifica se há dados salvos e preenche o formulário
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedRememberMe) {
      this.loginForm.patchValue({
        email: savedEmail,
        senha: savedPassword || '',
        rememberMe: true
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo é obrigatório.';
    }
    if (control?.hasError('email')) {
      return 'Digite um e-mail válido.';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo de ${control.errors?.['minlength'].requiredLength} caracteres.`;
    }

    return ''; // Sem erro
  }

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true; // ← ativa o loader

    const formValue = this.loginForm.value;

    const payload = {
      identifier: formValue.email,
      password: formValue.senha,
      manterLogin: formValue.rememberMe
    }

    console.log('Valor de rememberMe:', this.loginForm.get('rememberMe')?.value);

    console.log('Enviando login para:', this.authService['apiEndpoint']);
    console.log('Payload:', payload);

    this.authService.login(payload.identifier, payload.password, payload.manterLogin).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Resposta do backend (sucesso):', response);

        // ⚠️ CORREÇÃO CRÍTICA: Verifique se o backend retornou sucesso lógico
        if (!response || response.success === false) {
          const msgErro = response?.message || 'E-mail ou senha incorretos.';
          this.mostrarErro(msgErro);
          return;
        }

        // Se chegou aqui, o login foi bem-sucedido
        if (!response.token) {
          this.mostrarErro('Resposta do servidor inválida. Token não recebido.');
          return;
        }

        const rolePrincipal = response.roles && response.roles.length > 0
          ? response.roles[0]
          : 'Usuário';

        let expiracaoDate: Date | null = null;
        if (response.expiration) {
          expiracaoDate = new Date(response.expiration);
          if (isNaN(expiracaoDate.getTime())) {
            console.warn('Data de expiração inválida recebida do backend.');
            expiracaoDate = null;
          }
        }

        const usuarioLogado: UsuarioLogado = {
          token: response.token,
          refreshToken: response.refreshToken,
          id: response.userId,
          nome: response.userNametag || response.email,
          email: response.email,
          roles: response.roles || [],
          expiracao: new Date(response.expiration) // converte string para Date
        };
        console.log('Dados do usuário logado salvos:', usuarioLogado);

        this.authService.setUsuarioLogado(usuarioLogado);
        localStorage.setItem('user_role_simple', rolePrincipal);

        // ✅ NOVO: Se "Manter login" estiver marcado, salva os dados
        if (formValue.rememberMe) {
          localStorage.setItem('savedEmail', formValue.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          // Se desmarcou, limpa os dados salvos
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('rememberMe');
        }

        this.mostrarErro('Login realizado com sucesso!', 'success');

        setTimeout(() => {
          this.router.navigate(['/dashboard']); // ou sua rota principal
        }, 1500);
      },
      error: (err) => {
        console.log('Erro no Login:', err);

        let msgErro: string = '';
        let tipoAlerta: 'success' | 'danger' | 'warning' | 'info' = 'danger';

        if (err.status === 0) {
          msgErro = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
          tipoAlerta = 'danger';
        } else if (err.status === 400) {
          msgErro = err.error?.message || err.error?.error || 'Dados inválidos. Verifique e-mail e senha.';
          tipoAlerta = 'warning';
        } else if (err.status === 401) {
          msgErro = err.error?.message || 'E-mail ou senha incorretos.';
          tipoAlerta = 'danger';
        } else if (err.status === 404) {
          msgErro = 'Recurso não encontrado no servidor.';
          tipoAlerta = 'info';
        } else if (err.status === 500) {
          msgErro = 'Erro interno no servidor. Tente novamente mais tarde.';
          tipoAlerta = 'danger';
        } else if (err.error?.message) {
          msgErro = err.error.message;
          tipoAlerta = 'danger';
        } else {
          msgErro = 'Ocorreu um erro inesperado. Tente novamente.';
          tipoAlerta = 'danger';
        }

        this.mostrarErro(msgErro, tipoAlerta);
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

  togglePasswordVisibility() {
    const inputElement = document.querySelector('input[formControlName="senha"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.type = this.showPassword ? 'password' : 'text';
    } else {
      console.warn('Campo de senha não encontrado para alternar visibilidade.');
    }
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }
}