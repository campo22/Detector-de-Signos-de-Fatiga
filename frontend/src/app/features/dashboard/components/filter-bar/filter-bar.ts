import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter, DateRangeOption } from '../../services/dashboard-filter.service';
import { CommonModule } from '@angular/common';
import { AnalyticsFilterRequest } from '../../../../core/models/analytics.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-filter-bar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss'
})
export class FilterBar {

  private fb = inject(FormBuilder);
  private filterService = inject(DashboardFilter);

  filterForm = this.fb.group({
    startDate: [this.getDefaultStartDate()],
    endDate: [this.getCurrentDate()]
  });

  applyFilters(): void {
    const filtersValue = this.filterForm.value;
    const filter: AnalyticsFilterRequest = {
      startDate: filtersValue.startDate ? this.formatDate(filtersValue.startDate) : undefined,
      endDate: filtersValue.endDate ? this.formatDate(filtersValue.endDate) : undefined,
    };

    this.filterService.updateFilters(filter);
  }

  resetFilters(): void {
    this.filterForm.reset({
      startDate: this.getDefaultStartDate(),
      endDate: this.getCurrentDate()
    });
    this.applyFilters();
  }

  // Función para abrir el picker de fecha al hacer clic en el icono
  openDatepicker(id: string): void {
    const dateInput = document.getElementById(id) as HTMLInputElement;
    if (dateInput) {
      // En algunos navegadores, hacer click en el input abre el datepicker
      dateInput.focus();
      dateInput.click();
    }
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 6); // Last 7 days
    return date.toISOString().split('T')[0];
  }

}
