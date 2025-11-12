import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter } from '../../../dashboard/services/dashboard-filter.service';
import { FatigueLevel, FatigueType } from '../../../../core/models/enums';
import { AnalyticsFilterRequest } from '../../../../core/models/analytics.models';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-report-filters-sidebar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './report-filters-sidebar.html',
  styleUrl: './report-filters-sidebar.scss'
})
export class ReportFiltersSidebar implements OnInit {

  private fb = inject(FormBuilder);
  private filterService = inject(DashboardFilter);
  private translate = inject(TranslateService);

  public FatigueLevelEnum = FatigueLevel;
  public fatigueTypes!: [string, string][];

  filterForm = this.fb.group({
    startDate: [this.getDefaultStartDate()],
    endDate: [this.getCurrentDate()],
    driverId: [''],
    vehicleId: [''],
    driverName: [''],
    vehiclePlate: [''],
    fatigueLevel: [null as FatigueLevel | null],
    fatigueType: [null as FatigueType | null]
  });


  ngOnInit(): void {
    this.fatigueTypes = Object.entries(FatigueType).map(([key, value]) => [
      this.translate.instant(`REPORTS_FILTERS.FATIGUE_TYPES.${key}`),
      value
    ]);
  }


  applyFilters(): void {
    const formValues = this.filterForm.value;

    const filters: Partial<AnalyticsFilterRequest> = Object.entries(formValues)
      .reduce((acc, [key, value]) => {
        if (value !== null && value !== '') {
          acc[key as keyof AnalyticsFilterRequest] = value as any;
        }
        return acc;
      }, {} as Partial<AnalyticsFilterRequest>);

    this.filterService.updateFilters(filters);
  }

  selectFatigueLevel(level: FatigueLevel | null): void {
    if (this.filterForm.controls.fatigueLevel.value === level) {
      this.filterForm.controls.fatigueLevel.setValue(null);
    } else {
      this.filterForm.controls.fatigueLevel.setValue(level);
    }
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.toISOString().split('T')[0];
  }
}
