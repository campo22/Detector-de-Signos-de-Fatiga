import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, effect } from '@angular/core'; // <-- 1. AÑADIR 'effect'
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
  ApexLegend,
  ApexYAxis,
  ApexTooltip,
  ApexGrid,
  ChartComponent,
  NgApexchartsModule
} from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { DashboardFilter } from '../../services/dashboard-filter.service'; // <-- 2. IMPORTAR SERVICIO DE FILTROS

// === El tipado que ya tenías ===
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
};

@Component({
  selector: 'app-top-drivers-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './top-drivers-chart.html',
  styleUrl: './top-drivers-chart.scss'
})
export class TopDriversChart {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: ChartOptions; // <-- Corregido para no ser Parcial

  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter); // <-- 3. INYECTAR SERVICIO DE FILTROS

  constructor() {
    // 4. Mantenemos tu configuración visual detallada e inicializamos todo el objeto.
    this.chartOptions = {
      series: [], // Inicializamos series como un array vacío
      chart: {
        type: 'bar',
        height: 160,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        foreColor: 'hsl(var(--muted-foreground))',
      },
      plotOptions: { bar: { horizontal: true, borderRadius: 10, barHeight: '55%', distributed: true } },
      colors: [
        'hsl(var(--destructive))', 'hsl(var(--destructive) / 0.8)', 'hsl(var(--warning))',
        'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)',
      ],
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        formatter: (val, opt) => `${opt.w.globals.labels[opt.dataPointIndex]} - ${val}`,
        style: { colors: ['#fff'], fontWeight: '600', fontSize: '13px' },
        offsetX: 10,
      },
      yaxis: { show: false },
      xaxis: {
        categories: [], // Inicializamos categories como un array vacío
        min: 0,
        tickAmount: 5,
        labels: {
          show: true,
          style: { colors: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
          formatter: (val) => Math.round(Number(val)).toString(),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      legend: { show: false },
      tooltip: { theme: 'dark', y: { formatter: (val) => `${val} alertas` } },
    };


    effect(() => {
      const filters = this.filterService.filter$();
      console.log('TopDriversChart reaccionando a los filtros:', filters);

      this.analyticsService.getTopDriversByAlerts(filters).subscribe({
        next: (data) => {
          let seriesData: number[] = [];
          let categories: string[] = [];

          if (data && data.length > 0) {
            categories = data.map((driver) => driver.driverName);
            seriesData = data.map((driver) => driver.alertCount);
          }

          const maxValue = seriesData.length > 0 ? Math.ceil(Math.max(...seriesData) / 5) * 5 : 5;

          // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
          // Creamos un objeto NUEVO en lugar de mutar el existente.
          this.chartOptions = {
            ...this.chartOptions, // 1. Copia todas las propiedades de configuración existentes.
            series: [{ name: 'Alertas', data: seriesData }], // 2. Sobrescribe la propiedad 'series'.
            xaxis: {
              ...this.chartOptions.xaxis, // 3. Copia las propiedades existentes de 'xaxis'.
              categories: categories,     // 4. Sobrescribe solo 'categories' dentro de 'xaxis'.
              max: maxValue,
            },
          };
        },
        error: (err) => console.error('Error al cargar top drivers:', err),
      });
    });
  }

}
