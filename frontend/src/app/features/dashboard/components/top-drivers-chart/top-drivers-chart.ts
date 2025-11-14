import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, computed, Signal } from '@angular/core';
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
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';


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

  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter);


  // Configuración base del gráfico
  private baseChartConfig = {
    chart: {
      type: 'bar' as const,
      height: 160,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      foreColor: undefined, // Dejar que ApexCharts use el color predeterminado del tema
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 10, barHeight: '55%', distributed: true } },
    colors: [
      'hsl(var(--destructive))', 'hsl(var(--destructive) / 0.8)', 'hsl(var(--warning))',
      'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)',
    ],
    dataLabels: {
      enabled: true,
      textAnchor: 'start' as const,
      formatter: (val: any, opt: any) => `${opt.w.globals.labels[opt.dataPointIndex]} - ${val}`,
      style: { colors: ['hsl(var(--foreground))'], fontWeight: '600', fontSize: '13px' },
      offsetX: 10,
    },
    yaxis: { show: false },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: any) => `${val} alertas` },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const driverName = w.globals.labels[dataPointIndex];
        const alertCount = series[seriesIndex][dataPointIndex];
        const color = w.globals.colors[seriesIndex];
        return `
          <div class="apexcharts-custom-tooltip"
               style="background: hsl(var(--card));
                      color: hsl(var(--foreground));
                      border: 1px solid hsl(var(--border));
                      padding: 8px;
                      border-radius: 4px;
                      font-family: Inter, sans-serif;
                      font-size: 12px;
                      display: flex;
                      align-items: center;">
            <span style="display: inline-block;
                         width: 10px;
                         height: 10px;
                         border-radius: 50%;
                         background: ${color};
                         margin-right: 8px;"></span>
            <div>
              <strong>${driverName}</strong><br>
              Alertas: ${alertCount}
            </div>
          </div>
        `;
      }
    },
  };

  // Convertir el signal de filtros a un observable y obtener los datos
  private driversData = toSignal(
    toObservable(this.filterService.filter$).pipe(
      tap(filters => console.log('TopDriversChart - Filtros cambiados:', filters)),
      switchMap(filters => this.analyticsService.getTopDriversByAlerts(filters)),
      tap(data => console.log('TopDriversChart - Datos recibidos del API:', data))
    ),
    { initialValue: null }
  );

  // Computed signal para las opciones del gráfico
  public chartOptions: Signal<Partial<ChartOptions>> = computed(() => {
    const data = this.driversData();

    console.log('TopDriversChart - Computed ejecutándose, data:', data);

    // Estado inicial mientras carga
    if (!data) {
      console.log('TopDriversChart - No hay datos, mostrando estado inicial');
      return {
        ...this.baseChartConfig, // Copia la configuración base
        series: [{ name: 'Alertas', data: [0] }],
        xaxis: {
          categories: ['Cargando...'],
          min: 0,
          max: 5,
          tickAmount: 5,
          labels: {
            show: true,
            style: { colors: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
            formatter: (val: any) => Math.round(Number(val)).toString(),
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        }
      };
    }

    let seriesData: number[] = [];
    let categories: string[] = [];

    if (data && data.length > 0) {
      categories = data.map((driver) => driver.driverName);
      seriesData = data.map((driver) => driver.alertCount);
    } else {
      // Si no hay datos, mostrar un mensaje
      categories = ['Sin datos'];
      seriesData = [0];
    }

    const maxValue = seriesData.length > 0 && Math.max(...seriesData) > 0
      ? Math.ceil(Math.max(...seriesData) / 5) * 5
      : 5;

    console.log('TopDriversChart - Series procesadas:', seriesData);
    console.log('TopDriversChart - Categories procesadas:', categories);
    console.log('TopDriversChart - Max value:', maxValue);

    const options = {
      ...this.baseChartConfig,
      series: [{ name: 'Alertas', data: seriesData }],
      xaxis: {
        categories: categories,
        min: 0,
        max: maxValue,
        tickAmount: 5,
        labels: {
          show: true,
          style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: 'Inter, sans-serif' },
          formatter: (val: any) => Math.round(Number(val)).toString(),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      }
    };

    console.log('TopDriversChart - Opciones finales del gráfico:', options);

    return options;
  });
}
