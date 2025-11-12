import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../core/models/user.models';
import { Page } from '../../../../../core/models/event.models';
import { TranslateModule } from '@ngx-translate/core';

type SortColumn = 'name' | 'email' | 'rol' | 'activo';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './user-table.html',
  styleUrls: ['./user-table.scss']
})
export class UserTableComponent {
  usersPage = input.required<Page<User> | null>();

  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() changeSort = new EventEmitter<{ column: SortColumn; direction: 'asc' | 'desc' }>();
  @Output() changePage = new EventEmitter<'next' | 'prev'>();
  @Output() paginationChange = new EventEmitter<{ page: number, size: number, sort: { field: SortColumn, order: number } }>();

  currentPage = signal(0);

  sortState = signal<{ column: SortColumn; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc',
  });

  onEdit(user: User): void {
    this.editUser.emit(user);
  }

  onDelete(user: User): void {
    this.deleteUser.emit(user);
  }

  onChangeSort(column: SortColumn): void {
    if (this.sortState().column === column) {
      const newDirection = this.sortState().direction === 'asc' ? 'desc' : 'asc';
      this.sortState.set({ column, direction: newDirection });
    } else {
      this.sortState.set({ column, direction: 'asc' });
    }
    this.emitPaginationChange();
  }

  onChangePage(direction: 'next' | 'prev'): void {
    const page = this.usersPage();
    if (!page) return;

    if (direction === 'next' && !page.last) {
      this.currentPage.set(this.currentPage() + 1);
    } else if (direction === 'prev' && !page.first) {
      this.currentPage.set(this.currentPage() - 1);
    }
    this.emitPaginationChange();
  }

  private emitPaginationChange(): void {
    this.paginationChange.emit({
      page: this.currentPage(),
      size: 10, // Assuming fixed size for now
      sort: {
        field: this.sortState().column,
        order: this.sortState().direction === 'asc' ? 1 : -1,
      },
    });
  }
}