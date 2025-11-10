import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../../../core/models/vehicle.models';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './vehicle-details.html',
})
export class VehicleDetailsComponent {
  @Input() vehicle: Vehicle | null = null;
}
