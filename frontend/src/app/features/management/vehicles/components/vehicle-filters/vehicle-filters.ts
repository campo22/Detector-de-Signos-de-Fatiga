import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { VehicleFilterService } from '../../services/vehicle-filter.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { VehicleFilterRequest } from '../../../../../core/models/vehicle.models';
import { debounceTime, map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface FilterOption {
  label: string;
  value: boolean | null;
}
@Component({
  selector: 'app-vehicle-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './vehicle-filters.html',
  styleUrl: './vehicle-filters.scss',
})
export class VehicleFilters {

  private fb = inject(FormBuilder);
  private vehicleFilterService = inject(VehicleFilterService);
  private translate = inject(TranslateService);


  statusOptions: FilterOption[] = [
    { label: this.translate.instant('VEHICLES.STATUS_ACTIVE'), value: true },
    { label: this.translate.instant('VEHICLES.STATUS_INACTIVE'), value: false },
    { label: this.translate.instant('VEHICLES.FILTERS.ALL'), value: null }
  ];

  assignmentOptions: FilterOption[] = [
    { label: this.translate.instant('VEHICLES.FILTERS.ASSIGNED'), value: true },
    { label: this.translate.instant('VEHICLES.FILTERS.UNASSIGNED'), value: false },
    { label: this.translate.instant('VEHICLES.FILTERS.ALL'), value: null }
  ];

  public filterForm = this.fb.group({
    placa: [''],
    marca: [''],
    modelo: [''],
    activo: [null as boolean | null],
    asignado: [null as boolean | null]
  });


  public filters = toSignal(
    this.filterForm.valueChanges.pipe(
      debounceTime(350),
      startWith(this.filterForm.value),
      map(value => value as VehicleFilterRequest)
    ),
    { initialValue: this.filterForm.value as VehicleFilterRequest }
  );

  public hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.placa || f.marca || f.modelo || f.activo !== null || f.asignado !== null);
  });

  private syncFiltersEffect = effect(() => {
    const currentFilters = this.filters();
    this.vehicleFilterService.updateFilters(currentFilters);
  });

  clearFilters(): void {
    this.filterForm.reset({
      placa: '',
      marca: '',
      modelo: '',
      activo: null,
      asignado: null
    });
  }

}
