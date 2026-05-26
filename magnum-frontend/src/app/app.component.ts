import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, NgZone, OnInit, signal, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { filter } from 'rxjs';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Alert, TesteAlertService } from './core/services/teste-alert.service';
import { MagnumDesignSystemModule } from 'magnum-design-system';

// Importe a interface se estiver definida no serviço
interface NotificationData {
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MagnumDesignSystemModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {

  title = 'Frontend - Magnum Tubos e Conexões!';

  apiEndpoint = environment.apiUrl;
  isPrduction = environment.production;
  apiDuration = environment.apiTimeout;

  // currentNotification: NotificationData | null = null;

  currentAlert: Alert | null = null;
  showGlobalAlert = true;

  constructor(
    private authService: AuthService,
    public router: Router,
    // private notificationService: NotificationService,
    private testealertService: TesteAlertService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone // ← Injete aqui
  ) { }

  // chart!: Chart;
  showNavbar = true;

  ngOnInit(): void {
    this.authService.initAuth();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;

      this.showNavbar = !url.includes('/login');
      // const route = this.router.routerState.root.snapshot.firstChild;
      // this.showNavbar = !(route?.data?.['hideNavbar'] ?? false);
      // Usa NgZone para evitar erros de detecção de mudanças
    })

    this.testealertService.alert$.subscribe(alert => {
      this.zone.run(() => {
        this.currentAlert = alert;
        this.cdr.detectChanges();
      });
    });

    // Escuta mudanças no serviço
    // this.notificationService.notification$.subscribe(data => {
    //   this.currentNotification = data;
    // });
  }

  onClose() {
    // this.currentNotification = null;
    this.zone.run(() => {
      this.currentAlert = null;
      this.cdr.detectChanges();
    });
  }
  // Use ngAfterViewInit instead of ngOnInit
  // ngAfterViewInit() {
  //   const ctx = document.getElementById('meuGrafico') as HTMLCanvasElement;

  //   this.chart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: ['Produto A', 'Produto B', 'Produto C'],
  //       datasets: [{
  //         data: [

  //         ], label: 'Preço (R$)', backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  //       }]
  //     },
  //     options: {
  //       responsive: true
  //     }
  //   });
  // }
}
