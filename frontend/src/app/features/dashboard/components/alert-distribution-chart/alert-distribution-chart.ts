import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, effect } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { FatigueType } from '../../../../core/models/enums';
import { DashboardFilter } from '../../services/dashboard-filter.service';



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
  public chartOptions: Partial<ChartOptions>;

  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter);

  constructor() {
    // 1. Configuramos las opciones VISUALES del gráfico, basadas en tu diseño.
    this.chartOptions = {
      series: [], // Inicializamos como array vacío
      labels: [], // Inicializamos como array vacío
      colors: [], // Inicializamos como array vacío
      chart: {
        type: 'donut',
        height: 280,
        sparkline: { enabled: true }
      },
      // el plotOptions es para personalizar el gráfico
      plotOptions: {
        pie: {
          donut: {
            size: '80%',
            background: 'transparent',
            labels: {
              show: true,
              name: { show: false }, // Ocultamos el nombre de la serie individual
              value: {
                color: 'hsl(var(--foreground))', //
                fontFamily: 'Roboto Mono, monospace',
                fontWeight: 'bold',
                fontSize: '32px',
                offsetY: 8,
              },
              // aqui se muestra el total de alertas en el centro
              total: {
                show: true,
                label: 'Total Alertas',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '18px',
                formatter: (w) => {
                  // Suma todas las series para mostrar el total
                  return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
                }
              }
            }
          }
        }
      },
      // los dataLabels son para personalizar el gráfico
      dataLabels: { enabled: false },
      stroke: { width: 4, colors: ['hsl(var(--card))'] },
      tooltip: {
        enabled: true,
        y: { formatter: (val) => `${val} alertas` },
        theme: 'dark'
      }
    };


    effect(() => {
      const filters = this.filterService.filter$();
      console.log('AlertDistributionChart reaccionando a los filtros:', filters);

      this.analyticsService.getAlertDistribution(filters).subscribe(data => {
        const labels: string[] = [];
        const series: number[] = [];
        const colors: string[] = [];

        const colorMap: Record<FatigueType, string> = {
          [FatigueType.MICROSUEÑO]: 'hsl(var(--destructive))',
          [FatigueType.CABECEO]: 'hsl(var(--destructive))',
          [FatigueType.BOSTEZO]: 'hsl(var(--warning))',
          [FatigueType.CANSANCIO_VISUAL]: 'hsl(var(--primary))',
          [FatigueType.NINGUNO]: 'hsl(var(--success))',
        };

        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const fatigueType = key as FatigueType;
            labels.push(fatigueType.replace('_', ' '));
            series.push(data[fatigueType]);
            colors.push(colorMap[fatigueType] || 'hsl(var(--secondary))');
          }
        }

        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        // Creamos un objeto NUEVO para forzar la detección de cambios.
        this.chartOptions = {
          ...this.chartOptions, // 1. Copia toda la configuración visual existente.
          series: series,       // 2. Sobrescribe 'series' con los nuevos datos.
          labels: labels,       // 3. Sobrescribe 'labels' con los nuevos datos.
          colors: colors        // 4. Sobrescribe 'colors' con los nuevos datos.
        };
      });
    });

  }
}
