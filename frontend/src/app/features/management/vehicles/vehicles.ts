import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { VehicleFilters } from './components/vehicle-filters/vehicle-filters';
import { VehiclesTable } from './components/vehicles-table/vehicles-table';


@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    CommonModule,
    VehicleFilters,
    VehiclesTable
    // CardModule // Ejemplo
  ],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss'
})
export class Vehicles {


  totalVehicles = signal<number | string>('--');
  activeVehicles = signal<number | string>('--');
  unassignedVehicles = signal<number | string>('--');

}
