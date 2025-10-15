import { CommonModule } from '@angular/common';
import { Component, computed, inject, ViewChild, Signal } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill, ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
  NgApexchartsModule
} from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { TimelineDataPoint } from '../../../../core/models/analytics.models';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  fill: ApexFill;
  markers: ApexMarkers;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-critical-events-timeline',
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './critical-events-timeline.html',
  styleUrl: './critical-events-timeline.scss'
})
export class CriticalEventsTimeline {
  @ViewChild("chart") chart!: ChartComponent;


  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter);

  private timelineData = toSignal(
    toObservable(this.filterService.filter$).pipe(
      tap(filters => console.log('critical-events-timeline - Filtros aplicados:', filters)),
      switchMap(filters => this.analyticsService.getCriticalEventsTimeline(filters)),
      tap(data => console.log('critical-events-timeline - Datos obtenidos:', data))
    ),
    { initialValue: [] as TimelineDataPoint[] }
  );


  public chartOptions: Signal<ChartOptions> = computed(() => {
    const data = this.timelineData();
    const filters = this.filterService.filter$();

    // Utilidades de fechas
    const parse = (s?: string) => (s ? new Date(`${s}T00:00:00`) : undefined);
    let start = parse(filters.startDate);
    let end = parse(filters.endDate);

    // Si no hay rango en filtros, derivarlo de los datos o usar últimos 7 días
    if (!start || !end) {
      if (data && data.length > 0) {
        const times = data.map(p => new Date(`${p.date}T00:00:00`).getTime());
        start = new Date(Math.min(...times));
        end = new Date(Math.max(...times));
      } else {
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 6);
      }
    }

    // Normalizar a medianoche
    const toMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    start = toMidnight(start!);
    end = toMidnight(end!);

    // Construir rango día a día y rellenar huecos con 0
    const dayMs = 24 * 60 * 60 * 1000;
    const rangeDates: string[] = [];
    for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
      const d = new Date(t);
      rangeDates.push(d.toISOString().split('T')[0]);
    }

    const counts = new Map<string, number>();
    if (data) {
      for (const p of data) counts.set(p.date, p.count);
    }
    const seriesData = rangeDates.map(d => counts.get(d) ?? 0);

    // Etiquetas: si rango es exactamente 7 días, mostrar nombres de día en ES
    const dow = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const categories = rangeDates.length === 7
      ? rangeDates.map(d => dow[new Date(`${d}T00:00:00`).getDay()])
      : rangeDates;

    return {
      ...this.baseChartOptions,
      series: [{ name: 'Eventos Críticos', data: seriesData }],
      xaxis: {
        ...this.baseChartOptions.xaxis,
        categories
      },
      yaxis: this.baseChartOptions.yaxis
    } as ChartOptions;
  });

  // --- CONFIGURACIÓN VISUAL BASE ---
  // Mantenemos la configuración estática aquí para que el 'computed' sea más limpio.
  private baseChartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 250,
      toolbar: { show: false },
      foreColor: 'hsl(var(--muted-foreground))'
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.8,
        type: 'vertical',
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    markers: {
      size: 5,
      strokeWidth: 3,
      colors: ['hsl(var(--destructive))'],
      strokeColors: 'hsl(var(--card))',
      hover: { size: 8 }
    },
    xaxis: {
      type: 'category',
      categories: [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'hsl(var(--muted-foreground))', fontFamily: 'Inter', fontWeight: 500 } }
    },
    yaxis: { show: false },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `${val} Eventos` }
    }
  };


  constructor() { }



}
