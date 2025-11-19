import { Component, inject, signal, effect, OnInit, OnDestroy, ViewChild } from '@angular/core'; // Added signal, effect, OnInit, OnDestroy, ViewChild
import { SidebarService } from '../sidebar/sidebar.service';
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Added TranslateService
import { DialogService } from 'primeng/dynamicdialog';
import { QuickSettingsComponent } from './components/quick-settings/quick-settings.component';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router, NavigationEnd } from '@angular/router'; // Added NavigationEnd
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service'; // Added
import { Notification } from '../../core/models/notification.model'; // Added
import { Subject, filter, takeUntil } from 'rxjs'; // Added Subject, takeUntil
import { Menu } from 'primeng/menu'; // Added for ViewChild

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule, MenuModule, ButtonModule, RippleModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  providers: [DialogService, DatePipe] // Added DatePipe
})
export class Header implements OnInit, OnDestroy { // Implemented OnInit, OnDestroy

  private sidebarService = inject(SidebarService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService); // Injected NotificationService
  private translateService = inject(TranslateService); // Injected TranslateService

  public userProfile = this.authService.userProfile;
  public menuItems: MenuItem[] = [];
  public currentTheme = this.themeService.currentTheme;

  // Títulos dinámicos como señales
  public pageTitle = signal<string>(''); // Converted to signal
  public pageSubtitle = signal<string>(''); // Converted to signal

  // Notificaciones como señales
  public unreadNotificationCount = signal<number>(0);
  public recentNotifications = signal<Notification[]>([]);
  public notificationMenuItems = signal<MenuItem[]>([]);

  @ViewChild('notificationMenu') notificationMenu!: Menu; // Added ViewChild for p-menu

  private destroy$ = new Subject<void>(); // Subject to handle unsubscriptions

  public getUserInitials(): string {
    const name = this.userProfile()?.name;
    if (!name) {
      return '';
    }
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  constructor(private datePipe: DatePipe) { // Injected DatePipe
    this.initializeMenuItems();
    this.updatePageTitle(this.router.url);

    // Effect to update notificationMenuItems when recentNotifications changes
    effect(() => {
      this.notificationMenuItems.set(this.recentNotifications().map(notif => ({
        label: notif.message,
        icon: notif.isRead ? 'pi pi-check' : 'pi pi-bell', // Example icon based on read status
        tooltip: this.datePipe.transform(notif.createdAt, 'medium') || undefined, // Fixed: ensure string | undefined
        command: () => this.markNotificationAsRead(notif.id)
      })));

      // Add "Ver todas" and "Marcar todas como leídas" options if there are notifications
      if (this.recentNotifications().length > 0) {
        this.notificationMenuItems.update(items => [
          ...items,
          { separator: true },
          {
            label: this.translateService.instant('HEADER.NOTIFICATIONS.VIEW_ALL'), // Using translate service
            icon: 'pi pi-list',
            routerLink: ['/notifications'] // Placeholder route
          },
          {
            label: this.translateService.instant('HEADER.NOTIFICATIONS.MARK_ALL_READ'), // Using translate service
            icon: 'pi pi-envelope-open',
            command: () => this.markAllNotificationsAsRead()
          }
        ]);
      } else {
        this.notificationMenuItems.set([
          {
            label: this.translateService.instant('HEADER.NOTIFICATIONS.NO_NEW_NOTIFICATIONS'), // Using translate service
            icon: 'pi pi-info-circle',
            disabled: true
          }
        ]);
      }
    });

    // Escuchar cambios de navegación para actualizar títulos
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Changed to NavigationEnd for consistent URL
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.urlAfterRedirects); // Use urlAfterRedirects
      });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios en el contador de no leídas
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadNotificationCount.set(count);
      });

    // Cargar el conteo inicial al iniciar el componente
    this.notificationService.getUnreadNotificationsCount().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(currentUrl: string): void {
    let url = currentUrl;
    if (url.startsWith('/dashboard')) {
      url = '/dashboard';
    } else if (url.includes('monitoring/individual')) {
      url = 'monitoring/individual';
    } else if (url.includes('monitoring/live-events')) {
      url = 'monitoring/live-events';
    } else if (url.includes('/monitoring/')) {
      if (url.match(/\/monitoring\/[^\/]+$/)) {
        url = 'monitoring/detail';
      }
    } else if (url.includes('management/drivers')) {
      url = 'management/drivers';
    } else if (url.includes('management/vehicles')) {
      url = 'management/vehicles';
    } else if (url.includes('management/rules')) {
      url = 'management/rules';
    } else if (url.includes('management/users')) {
      url = 'management/users';
    } else if (url.includes('profile/settings')) {
      url = 'profile/settings';
    } else if (url.includes('profile')) {
      url = 'profile';
    } else if (url.includes('reports')) {
      url = 'reports';
    } else if (url.includes('settings')) {
      url = 'settings';
    } else if (url === '/') {
      url = '/dashboard';
    } else if (url === '/notifications') { // Added for notifications page
      this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.NOTIFICATIONS'));
      this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.NOTIFICATIONS'));
      return; // Exit after setting titles for notifications page
    }

    switch(url) {
      case '/dashboard':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.DASHBOARD')); // Using signal and translate
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.DASHBOARD')); // Using signal and translate
        break;
      case 'monitoring/individual':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.MONITORING_INDIVIDUAL'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.MONITORING_INDIVIDUAL'));
        break;
      case 'monitoring/live-events':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.LIVE_EVENTS'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.LIVE_EVENTS'));
        break;
      case 'monitoring/detail':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.MONITORING_DETAIL'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.MONITORING_DETAIL'));
        break;
      case 'monitoring':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.MONITORING'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.MONITORING'));
        break;
      case 'reports':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.REPORTS'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.REPORTS'));
        break;
      case 'management/drivers':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.DRIVERS'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.DRIVERS'));
        break;
      case 'management/vehicles':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.VEHICLES'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.VEHICLES'));
        break;
      case 'management/rules':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.RULES'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.RULES'));
        break;
      case 'management/users':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.USERS'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.USERS'));
        break;
      case 'profile':
      case 'profile/settings':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.PROFILE'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.PROFILE'));
        break;
      case 'settings':
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.SETTINGS'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.SETTINGS'));
        break;
      default:
        this.pageTitle.set(this.translateService.instant('HEADER.PAGE_TITLE.DASHBOARD'));
        this.pageSubtitle.set(this.translateService.instant('HEADER.PAGE_SUBTITLE.DASHBOARD'));
        break;
    }
  }

  private initializeMenuItems(): void {
    this.menuItems = [
      {
        label: this.translateService.instant('HEADER.MENU.VIEW_PROFILE'), // Using translate service
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/profile']);
        }
      },
      {
        label: this.translateService.instant('HEADER.MENU.LOGOUT'), // Using translate service
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleTheme(): void {
    this.themeService.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  showQuickSettings(): void {
    this.dialogService.open(QuickSettingsComponent, {
      header: 'Quick Settings',
      width: '350px',
      styleClass: 'quick-settings-dialog',
      modal: true,
      dismissableMask: true
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // Notification Methods

  loadRecentNotifications(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Limit to 5 or so for the dropdown
        this.recentNotifications.set(notifications.slice(0, 5));
      });
  }

  handleNotificationClick(event: Event): void {
    this.loadRecentNotifications();
    this.notificationMenu.toggle(event);
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // La cuenta se actualiza a través del tap en el servicio,
        // solo necesitamos recargar las notificaciones del menú.
        this.loadRecentNotifications();
      });
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // La cuenta se actualiza a través del tap en el servicio,
        // solo necesitamos recargar las notificaciones del menú.
        this.loadRecentNotifications();
      });
  }
}
