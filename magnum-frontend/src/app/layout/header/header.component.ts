import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsuarioLogado } from '../../models/logado.usuarios';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotType } from '../notification/notification.component';
import { MagnumDesignSystemModule } from 'magnum-design-system';


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NavbarComponent,
        MagnumDesignSystemModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'auth_user';

    private authSub?: Subscription;

    usuario: UsuarioLogado | null = null;
    userName: string = '';
    userRole: string = '';
    isLoggedIn: boolean = false;
    notMessage: string = '';
    notType: NotType = 'error';
    showNot: boolean = true;

    visible: boolean = false;

    modalSairVisivel = false;

    isNotifity = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Data de expiração:', new Date(payload.exp * 1000));
            console.log('Agora:', new Date());
            console.log('Tempo restante:', Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutos');
        } else {
            console.log('Nenhum token encontrado');
        }
        this.loadUserInfo();
    }

    ngOnDestroy() {
        if (this.authSub) this.authSub.unsubscribe();
    }

    navigateToLogin() {
        this.router.navigate(['/login']);
    }

    private loadUserInfo(): void {
        const usuario: UsuarioLogado | null = this.authService.getUsuarioLogado();

        if (!usuario) {
            this.isLoggedIn = false;
            return;
        }

        // Lógica para definir o nome de exibição
        this.userName = usuario.nome || usuario.email;

        // Lógica para definir o Cargo/Role
        // Opção A: Usar o valor salvo no localStorage (mais fácil)
        this.userRole = localStorage.getItem('user_role_simple') || 'Usuário';

        this.isLoggedIn = true;

        console.log('NavBar - Usuário:', this.userName, '| Cargo:', this.userRole);
    }

    nofType(): void {
        this.isNotifity !== !this.isNotifity
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => this.finalizarLogout(),
            error: () => {
                console.warn('Backend offline, mas fazendo logout local...');
                this.finalizarLogout();
            }
        });
    }

    abrirModalSair() {
        this.modalSairVisivel = true;
    }

    fecharModalSair() {
        this.modalSairVisivel = false;
    }

    verificarAuth() {
        const token = localStorage.getItem(this.tokenKey);

        if (!token) {
            this.usuario = null;
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));

            console.log('Payload do Token:', payload);

            const agora = Date.now();
            const expiracaoToken = payload.exp ? payload.exp * 1000 : 0;

            if (expiracaoToken < agora) {
                console.warn('Token expirado localmemnte.');
                this.logoutLocal();
                return;
            }

            this.usuario = {
                roles: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/cargo'] || payload.cargo || payload.Cargo,
                nome: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/cargo'] || payload.nome || payload.Nome,
                email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || payload.sub,
                id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub,
                expiracao: new Date(expiracaoToken),
                token: token
            };

        } catch (e) {
            // 7. Captura qualquer erro durante a decodificação/parsing (ex: token mal formado)
            console.error('Erro ao decodificar o token JWT:', e);
            this.logoutLocal();
        }
    }

    private logoutLocal() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.usuario = null;
    }

    private finalizarLogout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.usuario = null;
        this.router.navigate(['/login']);
    }

    open() {
        this.visible = true;
    }

    close() {
        this.visible = false;
    }
}