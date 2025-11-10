import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../core/models/user.models';
import { Page } from '../../../../../core/models/event.models';

type SortColumn = 'name' | 'email' | 'rol' | 'activo';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.html',
  styleUrls: ['./user-table.scss']
})
export class UserTableComponent {
  usersPage = input.required<Page<User> | null>();

  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() changeSort = new EventEmitter<{ column: SortColumn; direction: 'asc' | 'desc' }>();
  @Output() changePage = new EventEmitter<'next' | 'prev'>();

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
    this.changeSort.emit(this.sortState());
  }

  onChangePage(direction: 'next' | 'prev'): void {
    this.changePage.emit(direction);
  }
}