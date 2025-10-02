import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { FatigueType } from '../../../../core/models/enums';



// Definimos los tipos para las opciones del gráfico para tener autocompletado y seguridad.
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
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

  constructor() {
    // 1. Configuramos las opciones VISUALES del gráfico, basadas en tu diseño.
    this.chartOptions = {
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
              name: { show: false }, // Ocultamos el nombre de la serie individual
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
                  // Suma todas las series para mostrar el total
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
        theme: 'dark'
      }
    };
  }

  ngOnInit(): void {
    // 2. Pedimos los datos al backend.
    this.analyticsService.getAlertDistribution().subscribe(data => {
      // Mapeamos los datos recibidos al formato que ApexCharts necesita.
      const labels: string[] = [];
      const series: number[] = [];
      const colors: string[] = [];

      // Un mapa para asignar colores a cada tipo de fatiga
      const colorMap: Record<FatigueType, string> = {
        [FatigueType.MICROSUEÑO]: 'hsl(var(--destructive))',
        [FatigueType.CABECEO]: 'hsl(var(--destructive))',
        [FatigueType.BOSTEZO]: 'hsl(var(--warning))',
        [FatigueType.CANSANCIO_VISUAL]: 'hsl(var(--primary))',
        [FatigueType.NINGUNO]: 'hsl(var(--success))',
      };

      // Iteramos sobre la respuesta del servicio
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const fatigueType = key as FatigueType;
          labels.push(fatigueType.replace('_', ' ')); // "CANSANCIO_VISUAL" -> "CANSANCIO VISUAL"
          series.push(data[fatigueType]);
          colors.push(colorMap[fatigueType] || 'hsl(var(--secondary))'); // Usamos el color del mapa
        }
      }

      // 3. Actualizamos las opciones del gráfico con los datos reales.
      this.chartOptions.series = series;
      this.chartOptions.labels = labels;
      this.chartOptions.colors = colors;
    });
  }


}
