import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter, DateRangeOption } from '../../services/dashboard-filter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss'
})
export class FilterBar {

  private fb = inject(FormBuilder);
  private filterService = inject(DashboardFilter);

  // 1. Creamos un formulario para manejar los controles de la barra de filtros.
  // El valor inicial 'last30days' coincide con el filtro por defecto en nuestro servicio.
  filterForm = this.fb.group({
    dateRange: ['last30days']
  });

  /**
   * Se ejecuta cuando el usuario hace clic en el botón "Aplicar".
   */
  applyFilters(): void {
    // 2. Leemos el valor seleccionado en el selector de rango de fechas.
    const selectedRange = this.filterForm.value.dateRange as DateRangeOption;

    if (selectedRange) {
      // 3. Llamamos al servicio para que actualice los filtros globales.
      this.filterService.updateFiltersWithDateRange(selectedRange);
    }
  }

}
