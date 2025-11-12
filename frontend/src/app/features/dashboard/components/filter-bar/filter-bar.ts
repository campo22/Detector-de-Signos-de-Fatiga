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
      startDate: filtersValue.startDate || undefined,
      endDate: filtersValue.endDate || undefined,
    };

    this.filterService.updateFilters(filter);
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
