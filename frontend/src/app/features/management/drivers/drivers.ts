import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { DriversTable } from './components/drivers-table/drivers-table';
import { DriverFiltersComponent } from './components/driver-filters/driver-filters';
import { DriverService } from '../../shared/services/driver.service';


@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, DriversTable, DriverFiltersComponent],
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.scss'],
})
export class Drivers {
  private driverService = inject(DriverService);

  public totalDrivers = signal<number | string>('--');
  public activeDrivers = signal<number | string>('--');
  public inactiveDrivers = signal<number | string>('--');

  constructor() {
    this.loadDriverStats();
  }

  private loadDriverStats(): void {
    // Total drivers
    this.driverService
      .getDrivers({}, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.totalDrivers.set(page.totalElements);
      });

    // Active drivers
    this.driverService
      .getDrivers({ activo: true }, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.activeDrivers.set(page.totalElements);
      });

    // Inactive drivers
    this.driverService
      .getDrivers({ activo: false }, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.inactiveDrivers.set(page.totalElements);
      });
  }
}
