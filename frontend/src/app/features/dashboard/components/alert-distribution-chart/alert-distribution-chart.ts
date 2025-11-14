import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ChangeDetectorRef, computed, signal, Signal } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { FatigueType } from '../../../../core/models/enums';
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';



// Definimos los tipos para las opciones del gráfico para tener autocompletado y seguridad.
export type ChartOptions = {
  series: ApexNonAxisChartSeries; // Tipos de fatiga
  chart: ApexChart;
  labels: string[];
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-alert-distribution-chart',
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './alert-distribution-chart.html',
  styleUrl: './alert-distribution-chart.scss'
})
export class AlertDistributionChart {

  @ViewChild("chart") chart!: ChartComponent;
  
  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter);
  private cdr = inject(ChangeDetectorRef);

  // Configuración base del gráfico
  private baseChartConfig: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 280,
      sparkline: { enabled: true }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          background: 'transparent',
          labels: {
            show: true,
            name: { show: false },
            value: {
              color: 'hsl(var(--foreground))',
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 'bold',
              fontSize: '32px',
              offsetY: 8,
            },
            total: {
              show: true,
              label: 'Total Alertas',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '18px',
              formatter: (w) => {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              }
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 4, colors: ['hsl(var(--card))'] },
    tooltip: {
      enabled: true,
      y: { formatter: (val) => `${val} alertas` },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const label = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex];
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
              <strong>${label}</strong><br>
              Alertas: ${value}
            </div>
          </div>
        `;
      }
    }
  };

  // Convertir el signal de filtros a un observable y obtener los datos
  private alertData = toSignal(
    toObservable(this.filterService.filter$).pipe(
      switchMap(filters => {
        console.log('AlertDistributionChart - Filtros cambiados:', filters);
        return this.analyticsService.getAlertDistribution(filters);
      })
    ),
    { initialValue: null }
  );

  // Computed signal para las opciones del gráfico
  public chartOptions: Signal<Partial<ChartOptions>> = computed(() => {
    const data = this.alertData();
    
    if (!data) {
      return {
        ...this.baseChartConfig,
        series: [1],
        labels: ['Cargando...'],
        colors: ['hsl(var(--muted))']
      };
    }

    console.log('AlertDistributionChart - Datos recibidos:', data);

    const labels: string[] = [];
    const series: number[] = [];
    const colors: string[] = [];

    const colorMap: Record<FatigueType, string> = {
      [FatigueType.MICROSUEÑO]: 'hsl(var(--alert-fatiga-critica))',
      [FatigueType.CABECEO]: 'hsl(var(--alert-fatiga-critica))',
      [FatigueType.BOSTEZO]: 'hsl(var(--alert-fatiga-alta))',
      [FatigueType.CANSANCIO_VISUAL]: 'hsl(var(--alert-fatiga-media))',
      [FatigueType.NINGUNO]: 'hsl(var(--alert-fatiga-baja))',
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const fatigueType = key as FatigueType;
        labels.push(fatigueType.replace('_', ' '));
        series.push(data[fatigueType]);
        colors.push(colorMap[fatigueType] || 'hsl(var(--secondary))');
      }
    }

    console.log('AlertDistributionChart - Series procesadas:', series);

    return {
      ...this.baseChartConfig,
      series: series.length > 0 ? series : [1],
      labels: labels.length > 0 ? labels : ['Sin datos'],
      colors: colors.length > 0 ? colors : ['hsl(var(--muted))']
    };
  });
}
