import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HistoricalEventsTableComponent } from '../../reports/components/historical-events-table/historical-events-table';
import { ReportFiltersSidebar } from '../../reports/components/report-filters-sidebar/report-filters-sidebar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reports',
  imports: [

    CommonModule,
    HistoricalEventsTableComponent,
    ReportFiltersSidebar,
    TranslateModule
  ],

  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports {

}
