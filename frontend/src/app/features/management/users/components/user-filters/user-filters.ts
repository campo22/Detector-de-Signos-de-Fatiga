import { Component, OnInit, inject, effect, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Modelos y Servicios
import { Role } from '../../../../../core/models/enums';
import { UserFilterService } from '../../services/user-filter.service';
import { UserFilterRequest } from '../../../../../core/models/user.models';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-filters.html',
  styleUrls: ['./user-filters.scss']
})
export class UserFiltersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userFilterService = inject(UserFilterService);

  filterForm = this.fb.group({
    name: [''],
    email: [''],
    rol: [null as Role | null],
    activo: [null as boolean | null],
  });

  roles: { label: string; value: Role }[] = [];

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  public filters = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300),
      map(value => value as UserFilterRequest)
    ),
    { initialValue: this.filterForm.value as UserFilterRequest }
  );

  public readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.name || f.email || f.rol !== null || f.activo !== null);
  });

  private syncFiltersEffect = effect(() => {
    const currentFilters = this.filters();
    this.userFilterService.updateFilters(currentFilters);
  });

  ngOnInit(): void {
    this.roles = Object.keys(Role)
      .filter(key => key !== 'CONDUCTOR')
      .map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        value: Role[key as keyof typeof Role]
      }));
  }

  clearFilters(): void {
    this.filterForm.reset({
      name: '',
      email: '',
      rol: null,
      activo: null
    });
  }
}