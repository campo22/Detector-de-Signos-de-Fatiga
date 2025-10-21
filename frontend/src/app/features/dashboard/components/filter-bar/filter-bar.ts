import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter, DateRangeOption } from '../../services/dashboard-filter.service';
import { CommonModule } from '@angular/common';
import { AnalyticsFilterRequest } from '../../../../core/models/analytics.models';

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
    startDate: [this.getDefaultStartDate()],
    endDate: [this.getCurrentDate()]
  });

  /**
   * Se ejecuta cuando el usuario hace clic en el botón "Aplicar".
   */
  applyFilters(): void {
    // 2. Leemos el valor seleccionado en el selector de rango de fechas.
    const filtersValue = this.filterForm.value;
    const filter: AnalyticsFilterRequest = {
      startDate: filtersValue.startDate || undefined,
      endDate: filtersValue.endDate || undefined,
    };

    // 3. Actualizamos los filtros en nuestro servicio.
    this.filterService.updateFilters(filter);
  }


  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 29); // Hace 30 días (incluyendo hoy)
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

}
