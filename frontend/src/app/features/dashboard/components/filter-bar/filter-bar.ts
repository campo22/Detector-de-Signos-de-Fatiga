import { Component, inject, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { CommonModule } from '@angular/common';
import { AnalyticsFilterRequest } from '../../../../core/models/analytics.models';
import { TranslateModule } from '@ngx-translate/core';
import Litepicker from 'litepicker';

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
export class FilterBar implements AfterViewInit {

  private fb = inject(FormBuilder);
  private filterService = inject(DashboardFilter);

  private picker: Litepicker | null = null;

  filterForm = this.fb.group({
    startDate: [this.getDefaultStartDate()],
    endDate: [this.getCurrentDate()]
  });

  ngAfterViewInit(): void {
    this.picker = new Litepicker({
      element: document.getElementById('start-date')!,
      elementEnd: document.getElementById('end-date')!,
      singleMode: false,
      allowRepick: true,
      startDate: this.filterForm.value.startDate || new Date(),
      endDate: this.filterForm.value.endDate || new Date(),
      format: 'DD MMM, YYYY',
      lang: 'es-ES',
      buttonText: {
        previousMonth: `<span class="material-symbols-outlined">chevron_left</span>`,
        nextMonth: `<span class="material-symbols-outlined">chevron_right</span>`,
        reset: 'Resetear',
        apply: 'Aplicar',
        cancel: 'Cancelar'
      },
      setup: (picker) => {
        picker.on('selected', (date1, date2) => {
          this.filterForm.patchValue({
            startDate: this.formatDate(date1.toJSDate()),
            endDate: this.formatDate(date2.toJSDate())
          });
        });
        
        // Añadir estilos y comportamiento al abrir el picker
        picker.on('show', () => {
          const startInput = document.getElementById('start-date');
          const endInput = document.getElementById('end-date');
          if (startInput) startInput.classList.add('ring-2', 'ring-ring', 'border-ring', 'shadow-glow-primary');
          if (endInput) endInput.classList.add('ring-2', 'ring-ring', 'border-ring', 'shadow-glow-primary');
        });
        
        picker.on('hide', () => {
          const startInput = document.getElementById('start-date');
          const endInput = document.getElementById('end-date');
          if (startInput) startInput.classList.remove('ring-2', 'ring-ring', 'border-ring', 'shadow-glow-primary');
          if (endInput) endInput.classList.remove('ring-2', 'ring-ring', 'border-ring', 'shadow-glow-primary');
        });
      }
    });
  }

  applyFilters(): void {
    const filtersValue = this.filterForm.value;
    const filter: AnalyticsFilterRequest = {
      startDate: filtersValue.startDate ? this.formatDate(filtersValue.startDate) : undefined,
      endDate: filtersValue.endDate ? this.formatDate(filtersValue.endDate) : undefined,
    };

    this.filterService.updateFilters(filter);
  }

  clearFilters(): void {
    const startDate = this.getDefaultStartDate();
    const endDate = this.getCurrentDate();
    this.filterForm.reset({
      startDate: startDate,
      endDate: endDate
    });
    if (this.picker) {
      this.picker.setDateRange(startDate, endDate);
    }
    this.applyFilters();
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