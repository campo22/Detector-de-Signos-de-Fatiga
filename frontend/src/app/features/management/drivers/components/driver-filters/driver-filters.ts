import { Component, inject, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, startWith, map } from 'rxjs/operators';


import { DriverFilterRequest } from '../../../../../core/models/driver.models';
import { DriverFilterService } from '../../services/driver-filter.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-driver-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './driver-filters.html',
  styleUrl: './driver-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverFiltersComponent {
  private fb = inject(FormBuilder);
  private driverFilterService = inject(DriverFilterService);


  public filterForm = this.fb.group({
    nombre: [''],
    activo: [null as boolean | null],
    licencia: [''],
    asignado: [null as boolean | null]
  });

  // Signal que emite los cambios en los filtros
  public filters = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300), // Espera 300ms antes de emitir los cambios
      map(value => value as DriverFilterRequest) // Convierte el valor a DriverFilterRequest
    ),
    { initialValue: this.filterForm.value as DriverFilterRequest }
  );

  /**
   * Computed signal que indica si hay filtros activos.
   * Un filtro es activo si no es nulo.
   * @returns boolean True si hay filtros activos, false en caso contrario.
   */
  public readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.nombre || f.licencia || f.activo !== null || f.asignado !== null);
  });

  /**
   * Computed signal que cuenta la cantidad de filtros activos.
   * Un filtro es activo si no es nulo.
   * @returns number La cantidad de filtros activos.
   */
  public readonly activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.nombre) count++;
    if (f.licencia) count++;
    if (f.activo !== null) count++;
    if (f.asignado !== null) count++;
    return count;
  });

  // ✅ 4. Efecto para sincronizar con el servicio
  private syncFiltersEffect = effect(() => {
    const currentFilters = this.filters();
    console.log('✅ Filtros actualizados:', currentFilters);
    console.log('📊 Filtros activos:', this.activeFilterCount());
    this.driverFilterService.updateFilters(currentFilters);
  });

  /**
   * Resetea todos los filtros a sus valores iniciales
   */
  clearFilters(): void {
    this.filterForm.reset({
      nombre: '',
      licencia: '',
      activo: null,
      asignado: null
    });
  }
}
