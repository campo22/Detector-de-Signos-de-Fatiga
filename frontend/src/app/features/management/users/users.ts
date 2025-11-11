import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, merge, tap, take, filter } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

// Servicios
import { UserService } from '../../shared/services/user.service';
import { UserFilterService } from './services/user-filter.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Modelos
import { User, UserRequest, UserUpdateRequest } from '../../../core/models/user.models';
import { Page } from '../../../core/models/event.models';

// Componentes
import { UserFiltersComponent } from './components/user-filters/user-filters';
import { UserTableComponent } from './components/user-table/user-table';
import { UserFormComponent } from './components/user-form/user-form';

// PrimeNG
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

type SortColumn = 'name' | 'email' | 'rol' | 'activo';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    UserFiltersComponent,
    UserTableComponent,
    UserFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent {
  private userService = inject(UserService);
  public userFilterService = inject(UserFilterService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router); // Inject Router

  // State Signals
  usersPage = signal<Page<User> | null>(null);
  selectedUser = signal<User | 'new' | null>(null);
  isDialogVisible = computed(() => this.selectedUser() !== null);
  isEditMode = computed(
    () => typeof this.selectedUser() === 'object' && this.selectedUser() !== null
  );
  userForForm = computed(() => {
    const selected = this.selectedUser();
    return typeof selected === 'object' ? selected : null;
  });



  private filters$ = toObservable(this.userFilterService.filters$);
  private refresh$ = this.userFilterService.refreshTrigger$;
  private refreshSignal = toSignal(this.userFilterService.refreshTrigger$); // Convert Observable to Signal
  private navigationEnd = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  );

  public totalUsers = signal<number | string>('--');
  public activeUsers = signal<number | string>('--');
  public inactiveUsers = signal<number | string>('--');

  constructor() {
    effect(() => {
      // Register dependencies as signals
      this.navigationEnd(); // Signal
      this.userFilterService.filters$(); // Signal
      this.refreshSignal(); // Signal

      // Call the loading methods
      this.loadUsers(0, 10, { field: 'name', order: 1 });
      this.loadUserStats();
    });
  }



  private loadUserStats(): void {
    // Total users
    this.userService
      .getUsers({}, 0, 1, { field: 'name', order: 1 })
      .pipe(take(1))
      .subscribe((page) => {
        this.totalUsers.set(page.totalElements);
      });

    // Active users
    this.userService
      .getUsers({ activo: true }, 0, 1, { field: 'name', order: 1 })
      .pipe(take(1))
      .subscribe((page) => {
        this.activeUsers.set(page.totalElements);
      });

    // Inactive users
    this.userService
      .getUsers({ activo: false }, 0, 1, { field: 'name', order: 1 })
      .pipe(take(1))
      .subscribe((page) => {
        this.inactiveUsers.set(page.totalElements);
      });
  }


  loadUsers(
    page: number = 0,
    size: number = 10,
    sort: { field: SortColumn; order: number } = { field: 'name', order: 1 }
  ): void {
    this.usersPage.set(null); // Set to null to show loading state

    const filters = this.userFilterService.filters$();

    this.userService
      .getUsers(filters, page, size, sort)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los usuarios.',
          });
          return of({
            content: [],
            pageable: {
              pageNumber: 0,
              pageSize: 10,
              sort: { sorted: false, unsorted: true, empty: true },
              offset: 0,
              paged: true,
              unpaged: false,
            },
            totalPages: 0,
            totalElements: 0,
            last: true,
            first: true,
            size: 10,
            number: 0,
            numberOfElements: 0,
            sort: { sorted: false, unsorted: true, empty: true },
            empty: true,
          } as Page<User>);
        })
      )
      .subscribe((page) => {
        this.usersPage.set(page);
      });
  }



  openNew(): void {
    this.selectedUser.set('new');
  }

  editUser(user: User): void {
    this.selectedUser.set(user);
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar al usuario ${user.name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente.',
            });
            this.userFilterService.triggerRefresh();
            this.loadUserStats(); // Update stats
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el usuario.',
            });
          },
        });
      },
    });
  }

  handlePaginationChange(pagination: { page: number, size: number, sort: { field: SortColumn, order: number } }): void {
    this.loadUsers(pagination.page, pagination.size, pagination.sort);
  }

  handleSave(): void {
    const summary = this.isEditMode() ? 'Usuario Actualizado' : 'Usuario Creado';
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `${summary} correctamente.`,
    });
    this.selectedUser.set(null);
    this.userFilterService.triggerRefresh();
    this.loadUserStats(); // Update stats
  }

  handleCancel(): void {
    this.selectedUser.set(null);
  }
}
