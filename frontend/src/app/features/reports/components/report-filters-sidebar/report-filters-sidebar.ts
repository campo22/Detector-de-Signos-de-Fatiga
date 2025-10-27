import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DashboardFilter } from '../../../dashboard/services/dashboard-filter.service';
import { FatigueLevel, FatigueType } from '../../../../core/models/enums';
import { AnalyticsFilterRequest } from '../../../../core/models/analytics.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-filters-sidebar',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './report-filters-sidebar.html',
  styleUrl: './report-filters-sidebar.scss'
})
export class ReportFiltersSidebar implements OnInit {

  private fb = inject(FormBuilder);
  private filterService = inject(DashboardFilter);

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
    // 3. Inicializar la lista de tipos de fatiga
    this.fatigueTypes = Object.entries(FatigueType) as [string, string][];
  }


  applyFilters(): void {
    const formValues = this.filterForm.value;

    const filters: Partial<AnalyticsFilterRequest> = Object.entries(formValues)
      .reduce((acc, [key, value]) => {
        // Verificar si el valor no es null o una cadena vacia
        // y agregarlo al objeto de filtros si es necesario
        if (value !== null && value !== '') {
          acc[key as keyof AnalyticsFilterRequest] = value as any;
        }
        return acc;
      }, {} as Partial<AnalyticsFilterRequest>);

    this.filterService.updateFilters(filters);
  }

  // 4. Método para manejar la selección del nivel de fatiga con botones
  selectFatigueLevel(level: FatigueLevel | null): void {
    // Si se hace clic en el nivel ya seleccionado, se deselecciona
    if (this.filterForm.controls.fatigueLevel.value === level) {
      this.filterForm.controls.fatigueLevel.setValue(null);
    } else {
      this.filterForm.controls.fatigueLevel.setValue(level);
    }
  }

  // --- Métodos de ayuda para fechas iniciales ---
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Función privada para formatear la fecha a YYYY-MM-DD
  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.toISOString().split('T')[0];
  }


}
