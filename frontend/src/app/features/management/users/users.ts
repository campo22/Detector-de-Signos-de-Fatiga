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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule
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
  private router = inject(Router);
  private translate = inject(TranslateService);

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

  dialogHeader = computed(() => {
    const key = this.isEditMode() ? 'USERS.EDIT_USER_HEADER' : 'USERS.ADD_USER_HEADER';
    return this.translate.instant(key);
  });

  dialogSubheader = computed(() => {
    const key = this.isEditMode() ? 'USERS.EDIT_USER_SUBHEADER' : 'USERS.ADD_USER_SUBHEADER';
    return this.translate.instant(key);
  });

  private filters$ = toObservable(this.userFilterService.filters$);
  private refresh$ = this.userFilterService.refreshTrigger$;
  private refreshSignal = toSignal(this.userFilterService.refreshTrigger$);
  private navigationEnd = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  );

  public totalUsers = signal<number | string>('--');
  public activeUsers = signal<number | string>('--');
  public inactiveUsers = signal<number | string>('--');

  constructor() {
    effect(() => {
      this.navigationEnd();
      this.userFilterService.filters$();
      this.refreshSignal();

      this.loadUsers(0, 10, { field: 'name', order: 1 });
      this.loadUserStats();
    });
  }

  private loadUserStats(): void {
    this.userService
      .getUsers({}, 0, 1, { field: 'name', order: 1 })
      .pipe(take(1))
      .subscribe((page) => {
        this.totalUsers.set(page.totalElements);
      });

    this.userService
      .getUsers({ activo: true }, 0, 1, { field: 'name', order: 1 })
      .pipe(take(1))
      .subscribe((page) => {
        this.activeUsers.set(page.totalElements);
      });

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
    this.usersPage.set(null);

    const filters = this.userFilterService.filters$();

    this.userService
      .getUsers(filters, page, size, sort)
      .pipe(
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('USERS.ERROR_SUMMARY'),
            detail: this.translate.instant('USERS.LOAD_ERROR_DETAIL'),
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
      message: this.translate.instant('USERS.DELETE_CONFIRM_MESSAGE', { name: user.name }),
      header: this.translate.instant('USERS.DELETE_CONFIRM_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('USERS.SUCCESS_SUMMARY'),
              detail: this.translate.instant('USERS.DELETE_SUCCESS_DETAIL'),
            });
            this.userFilterService.triggerRefresh();
            this.loadUserStats();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('USERS.ERROR_SUMMARY'),
              detail: this.translate.instant('USERS.DELETE_ERROR_DETAIL'),
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
    const detailKey = this.isEditMode() ? 'USERS.SUCCESS_UPDATE_DETAIL' : 'USERS.SUCCESS_CREATE_DETAIL';
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('USERS.SUCCESS_SUMMARY'),
      detail: this.translate.instant(detailKey),
    });
    this.selectedUser.set(null);
    this.userFilterService.triggerRefresh();
    this.loadUserStats();
  }

  handleCancel(): void {
    this.selectedUser.set(null);
  }
}
