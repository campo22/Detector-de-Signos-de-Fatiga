import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of, merge, tap } from 'rxjs';

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
    UserFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  public userFilterService = inject(UserFilterService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // State Signals
  usersPage = signal<Page<User> | null>(null);
  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);
  
  private currentPage = signal(0);
  private sortState = signal<{ field: SortColumn; order: number }>({ field: 'name', order: 1 });

  private filters$ = toObservable(this.userFilterService.filters$);
  private refresh$ = this.userFilterService.refreshTrigger$;

  constructor() {
    effect(() => {
      merge(this.filters$, this.refresh$).pipe(
        tap(() => this.currentPage.set(0)) // Reset page on filter change
      ).subscribe(() => {
        this.loadUsers();
      });
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersPage.set(null); // Set to null to show loading state
    
    const page = this.currentPage();
    const size = 10;
    const sort = {
      field: this.sortState().field,
      order: this.sortState().order,
    };
    const filters = this.userFilterService.filters$();

    this.userService.getUsers(filters, page, size, sort).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
        return of({
          content: [], pageable: { pageNumber: 0, pageSize: 10, sort: { sorted: false, unsorted: true, empty: true }, offset: 0, paged: true, unpaged: false }, totalPages: 0, totalElements: 0, last: true, first: true, size: 10, number: 0, numberOfElements: 0, sort: { sorted: false, unsorted: true, empty: true }, empty: true
        } as Page<User>);
      })
    ).subscribe(page => {
      this.usersPage.set(page);
    });
  }

  handleSortChange(sort: { column: SortColumn; direction: 'asc' | 'desc' }): void {
    this.sortState.set({ field: sort.column, order: sort.direction === 'asc' ? 1 : -1 });
    this.loadUsers();
  }

  handlePageChange(direction: 'next' | 'prev'): void {
    const page = this.usersPage();
    if (!page) return;

    if (direction === 'next' && !page.last) {
      this.currentPage.set(this.currentPage() + 1);
    } else if (direction === 'prev' && !page.first) {
      this.currentPage.set(this.currentPage() - 1);
    }
    this.loadUsers();
  }

  openNew(): void {
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.isDialogVisible.set(true);
  }

  editUser(user: User): void {
    this.isEditMode.set(true);
    this.selectedUser.set(user);
    this.isDialogVisible.set(true);
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar al usuario ${user.name}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado correctamente.' });
            this.userFilterService.triggerRefresh();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
          }
        });
      }
    });
  }

  handleSave(payload: UserRequest | UserUpdateRequest): void {
    const operation = this.isEditMode()
      ? this.userService.updateUser(this.selectedUser()!.id, payload as UserUpdateRequest)
      : this.userService.createUser(payload as UserRequest);

    const summary = this.isEditMode() ? 'Usuario Actualizado' : 'Usuario Creado';

    operation.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `${summary} correctamente.` });
        this.isDialogVisible.set(false);
        this.userFilterService.triggerRefresh();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || `No se pudo guardar el usuario.` });
      }
    });
  }

  handleCancel(): void {
    this.isDialogVisible.set(false);
  }
}