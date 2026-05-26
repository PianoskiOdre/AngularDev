import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { StockAlertComponent } from './features/dashboard/stock-alert/stock-alert.component';
import { LayoutComponent } from './layout/layout.component';
import { ConfiguracoesComponent } from './features/page/configuracoes/configuracoes.component';
import { RelatoriosComponent } from './features/page/relatorios/relatorios.component';
import { ProdutosComponent } from './features/page/produtos/produtos.component';

export const routes: Routes = [
    // 🔓 Sem layout
    // {
    //     path: 'login',
    //     component: LoginComponent,
    //     data: { 
    //         hideNavbar: true,
    //         hideGlobalAlert: true
    //     },
    //     title: 'Login - Magnum Tubos e Conexões'
    // },
    // 🔐 Com layout (navbar aparece)
    {
        path: '',
        component: LayoutComponent,
        // canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - Magnum Tubos e Conexões' },

            { path: 'stock-alert', component: StockAlertComponent },

            { path: 'configuracoes', component: ConfiguracoesComponent },

            { path: 'relatorios', component: RelatoriosComponent },

            { path: 'produtos', component: ProdutosComponent }

        ]
    }
];
