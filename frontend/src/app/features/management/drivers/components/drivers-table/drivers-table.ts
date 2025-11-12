import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { DriverService } from '../../../../shared/services/driver.service';
import { DriverFilterService } from '../../services/driver-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, merge, startWith, switchMap, tap } from 'rxjs';
import { Page } from '../../../../../core/models/event.models';
import { Driver } from '../../../../../core/models/driver.models';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type SortState = {
  column: string;
  direction: 'asc' | 'desc';
};

@Component({
  selector: 'app-drivers-table',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ClipboardModule,
    TranslateModule
  ],
  templateUrl: './drivers-table.html',
  styleUrl: './drivers-table.scss',
})
export class DriversTable {

  private driverService = inject(DriverService);
  private driverFilterService = inject(DriverFilterService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  public currentPage = signal(0);
  public sortState = signal<SortState>({
    column: 'nombre',
    direction: 'asc'
  });

  @Output() editDriver = new EventEmitter<Driver>();
  @Output() deleteDriver = new EventEmitter<Driver>();


  private queryParams = computed(() => ({
    filters: this.driverFilterService.filter$(),
    page: this.currentPage(),
    sort: this.sortState()
  }
  ));

  public driversPage = toSignal(
    merge(
      toObservable(this.queryParams),
      this.driverFilterService.refreshTrigger$
    ).pipe(
      tap((trigger) => {
        if (typeof trigger === 'object') {
          console.log('Disparador de refresco: Cambio de QueryParams', trigger);
        } else {
          console.log('Disparador de refresco: Manual (triggerRefresh)');
        }
      }),
      switchMap(() => {
        const params = this.queryParams();
        console.log('DriversTable: Recargando datos con:', params);
        return this.driverService.getDrivers(
          params.filters,
          params.page,
          10,
          params.sort.column,
          params.sort.direction
        );
      }),
      startWith(null),
      catchError(error => {
        console.error('Error al obtener los conductores:', error);
        return [null];
      })
    ),
    { initialValue: null as Page<Driver> | null }
  );

  nextPage(): void {
    if (this.driversPage()?.last === false) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {
    if (this.driversPage()?.first === false) {
      this.currentPage.update(page => page - 1);
    }
  }

  changeSort(column: string): void {
    const currentSort = this.sortState();
    let newDirection: 'asc' | 'desc' = 'asc';
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    this.sortState.set({ column, direction: newDirection });
    this.currentPage.set(0);
  }

  onEditDriver(driver: Driver): void {
    this.editDriver.emit(driver);
  }

  onDeleteDriver(driver: Driver): void {
    this.deleteDriver.emit(driver);
  }

  viewDriverDetails(driverId: string): void {
    this.router.navigate(['/monitoring', driverId]);
  }

  onIdCopied(id: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('DRIVERS.TABLE.ID_COPIED_SUMMARY'),
      detail: this.translate.instant('DRIVERS.TABLE.ID_COPIED_DETAIL', { id: id.substring(0, 8) }),
      life: 2000
    });
  }
}
