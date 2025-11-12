// En: src/app/features/reports/components/historical-events-table/historical-events-table.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, startWith } from 'rxjs/operators';
import { DashboardFilter } from '../../../dashboard/services/dashboard-filter.service';
import { EventService } from '../../../shared/services/event.service';
import { ExportService } from '../../../../core/services/export.service';
import { Page, FatigueEvent } from '../../../../core/models/event.models';
import { FatigueLevel } from '../../../../core/models/enums';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Definimos un tipo para el estado del ordenamiento
type SortState = {
  column: string;
  direction: 'asc' | 'desc';
};

@Component({
  selector: 'app-historical-events-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './historical-events-table.html',
  styleUrls: ['./historical-events-table.scss']
})
export class HistoricalEventsTableComponent {

  public FatigueLevel = FatigueLevel;
  private eventService = inject(EventService);
  private filterService = inject(DashboardFilter);
  private exportService = inject(ExportService);
  private translate = inject(TranslateService);

  // 2. Signals de estado local para paginación y ordenamiento
  public currentPage = signal(0);
  public sortState = signal<SortState>({ column: 'timestamp', direction: 'desc' });

  // 3. Signal combinado de parámetros (filtros + página + orden)
  private queryParams = computed(() => ({
    filters: this.filterService.filter$(), // Escucha los filtros globales
    page: this.currentPage(),           // Escucha la página local
    sort: this.sortState()              // Escucha el orden local
  }));

  // 4. Signal de Datos: Reacciona a CUALQUIER cambio en queryParams
  public eventsPage = toSignal(
    toObservable(this.queryParams).pipe( // Convierte el signal combinado a Observable
      switchMap(({ filters, page, sort }) =>
        // Llama al EventService con los 5 parámetros correctos
        this.eventService.searchEvents(filters, page, 15, sort.column, sort.direction) // Tamaño de página 15, por ejemplo
      ),
      startWith(null), // Estado inicial mientras carga
      catchError(err => {
        console.error(this.translate.instant('HISTORICAL_EVENTS_TABLE.ERROR_LOADING_EVENTS'), err);
        return [null]; // Devuelve null en caso de error para no romper la cadena
      })
    ),
    // Tipo explícito para ayudar a TypeScript con el valor inicial null
    { initialValue: null as Page<FatigueEvent> | null }
  );

  // --- MÉTODOS DE INTERACCIÓN ---

  // Función para ir a la página siguiente
  nextPage(): void {
    // Usamos el optional chaining (?) por si eventsPage() es null inicialmente
    if (this.eventsPage()?.last === false) {
      this.currentPage.update(page => page + 1);
    }
  }

  // Función para ir a la página anterior
  previousPage(): void {
    if (this.eventsPage()?.first === false) {
      this.currentPage.update(page => page - 1);
    }
  }

  // Función para cambiar el orden
  changeSort(column: string): void {
    const currentSort = this.sortState();
    let newDirection: 'asc' | 'desc' = 'desc';
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'desc' ? 'asc' : 'desc';
    }
    this.sortState.set({ column, direction: newDirection });
    this.currentPage.set(0); // Reiniciar a la primera página al cambiar el orden
  }

  // --- MÉTODOS DE EXPORTACIÓN ---

  exportExcel(): void {
    const dataToExport = this.eventsPage()?.content;
    if (dataToExport && dataToExport.length > 0) {
      // Prepara los datos como objetos simples para Excel
      const simplifiedData = dataToExport.map(event => ({
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_ID_EVENT')]: event.id,
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_DATE_TIME')]: new Date(event.timestamp).toLocaleString('es-CO'), // Ajusta la localización si es necesario
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_EVENT_TYPE')]: event.fatigueType,
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_RISK_LEVEL')]: event.fatigueLevel,
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_DRIVER_NAME')]: event.driverName || 'N/A',
        [this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_VEHICLE_IDENTIFIER')]: event.vehicleIdentifier || 'N/A'

      }));
      this.exportService.exportToExcel(simplifiedData, this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_FILE_NAME'));
    } else {
      console.warn(this.translate.instant('HISTORICAL_EVENTS_TABLE.NO_DATA_EXCEL'));
      // Considera mostrar una notificación al usuario aquí
    }
  }

  exportPdf(): void {
    const dataToExport = this.eventsPage()?.content;
    if (dataToExport && dataToExport.length > 0) {
      // Define las cabeceras visibles y las claves de datos correspondientes
      const headers = [
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_DATE_TIME_SHORT'),
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_EVENT_TYPE_SHORT'),
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_LEVEL_SHORT'),
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_DRIVER_SHORT'),
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_VEHICLE_SHORT')
      ];
      const headerKeys = ['timestamp', 'fatigueType', 'fatigueLevel', 'driverName', 'vehicleIdentifier'];

      // Prepara los datos, formateando la fecha y asegurando valores
      const formattedData = dataToExport.map(event => ({
        timestamp: new Date(event.timestamp).toLocaleString('es-CO'),
        fatigueType: event.fatigueType || '',
        fatigueLevel: event.fatigueLevel || '',
        driverName: event.driverName || 'N/A',
        vehicleIdentifier: event.vehicleIdentifier || 'N/A'
      }));

      this.exportService.exportToPdf(
        formattedData,
        headers,
        headerKeys,// Cabeceras de las columnas
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_FILE_NAME'),
        this.translate.instant('HISTORICAL_EVENTS_TABLE.EXPORT_PDF_TITLE')

      );
    } else {
      console.warn(this.translate.instant('HISTORICAL_EVENTS_TABLE.NO_DATA_PDF'));
      // Considera mostrar una notificación al usuario aquí
    }
  }
}
