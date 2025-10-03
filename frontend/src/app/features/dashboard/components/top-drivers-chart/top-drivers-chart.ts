import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis, ChartComponent, NgApexchartsModule, ApexLegend, ApexYAxis } from 'ng-apexcharts';
import { AnalyticsService } from '../../../shared/services/analytics.service';


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string[];
  legend: ApexLegend;
};
@Component({
  selector: 'app-top-drivers-chart',
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './top-drivers-chart.html',
  styleUrl: './top-drivers-chart.scss'
})
export class TopDriversChart implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  private analyticsService = inject(AnalyticsService);

  constructor() {
    // 1. Configuramos las opciones VISUALES del gráfico, basadas en tu diseño.
    this.chartOptions = {
      series: [], // Inicializamos como array vacío
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '50%',
          distributed: true,
          dataLabels: {
            position: 'top'
          }
        }
      },
      colors: [
        'hsl(var(--destructive))',
        'hsl(var(--destructive) / 0.7)',
        'hsl(var(--warning))',
        'hsl(var(--primary) / 0.8)',
        'hsl(var(--primary) / 0.6)'
      ],
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
          colors: ['hsl(var(--foreground))'],
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontSize: '14px',
        },
        formatter: (val, opt) => {
          return opt.w.globals.labels[opt.dataPointIndex] + " - " + val;
        },
        offsetX: 15,
        dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.7, color: '#000' }
      },
      yaxis: { show: false },
      xaxis: {
        categories: [], // Inicializamos como array vacío
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      legend: { show: false },
    };
  }

  ngOnInit(): void {
    this.analyticsService.getTopDriversByAlerts().subscribe(data => {
      if (!data || data.length === 0) {
        // Si no hay datos, simplemente limpiamos el gráfico
        this.chartOptions.series = [{ name: 'Alertas', data: [] }];
        this.chartOptions.xaxis.categories = [];
        return;
      }

      const categories = data.map(driver => driver.driver);
      const seriesData = data.map(driver => driver.total_alerts);

      // Ahora solo actualizamos las propiedades que cambian, en lugar de todo el objeto.
      this.chartOptions.series = [{ name: 'Alertas', data: seriesData }];
      this.chartOptions.xaxis.categories = categories;
    });
  }
}


