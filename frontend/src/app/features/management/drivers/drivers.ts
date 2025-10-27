import { Component } from '@angular/core';
import { DriversTable } from './components/drivers-table/drivers-table';

@Component({
  selector: 'app-drivers',
  imports: [
    DriversTable
  ],
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss'
})
export class Drivers {

}
