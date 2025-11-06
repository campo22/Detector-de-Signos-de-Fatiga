import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { VehicleFilterService } from '../../services/vehicle-filter.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { VehicleFilterRequest } from '../../../../../core/models/vehicle.models';
import { debounceTime, map, startWith } from 'rxjs';

interface FilterOption {
  label: string;
  value: boolean | null;
}
@Component({
  selector: 'app-vehicle-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './vehicle-filters.html',
  styleUrl: './vehicle-filters.scss',
})
export class VehicleFilters {

  private fb = inject(FormBuilder);
  private vehicleFilterService = inject(VehicleFilterService);


  statusOptions: FilterOption[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
    { label: 'Todos', value: null }
  ];

  assignmentOptions: FilterOption[] = [
    { label: 'Asignado', value: true },
    { label: 'Libre', value: false },
    { label: 'Todos', value: null }
  ];

  // Los nombres (placa, marca, etc.) coinciden con el HTML y el modelo VehicleFilterRequest
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
      // Convierte el valor a VehicleFilterRequest para pasarlo al servicio
      map(value => value as VehicleFilterRequest)
    ),
    // Valor inicial
    { initialValue: this.filterForm.value as VehicleFilterRequest }
  );

  // --- 6. Computed signal para filtros activos ---
  public hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.placa || f.marca || f.modelo || f.activo !== null || f.asignado !== null);
  });

  // --- 7. Efecto para sincronizar con el servicio (clonado del patrón) ---
  private syncFiltersEffect = effect(() => {
    const currentFilters = this.filters();
    console.log('Filtros de Vehículo actualizados:', currentFilters);
    // Llama al servicio de Vehículos
    this.vehicleFilterService.updateFilters(currentFilters);
  });

  /**
   * Resetea todos los filtros a sus valores iniciales
   */
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
