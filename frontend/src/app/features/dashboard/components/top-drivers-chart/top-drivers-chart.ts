import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis, ChartComponent, NgApexchartsModule, ApexLegend, ApexYAxis, ApexStroke } from 'ng-apexcharts';
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
  stroke: ApexStroke;
};

@Component({
  selector: 'app-top-drivers-chart',
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './top-drivers-chart.html',
  styleUrl: './top-drivers-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopDriversChart implements OnInit, OnDestroy {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  private analyticsService = inject(AnalyticsService);

  constructor() {
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
        theme: 'dark'
      },
      // 🔑 Inicialización vacía para evitar "cargando"
      series: [],
      labels: [],
      colors: []
    };
  }


  ngOnInit(): void {
    this.analyticsService.getTopDriversByAlerts().subscribe(data => {
      console.log("TopDriversChart - data recibida:", data);

      if (!data || data.length === 0) {
        this.chartOptions.series = [{ name: 'Alertas', data: [] }];
        this.chartOptions.xaxis.categories = [];
        return;
      }

      const categories = data.map(driver => driver.driverName || driver.driverName);
      const seriesData = data.map(driver => driver.alertCount || driver.alertCount);


      this.chartOptions.series = [{ name: 'Alertas', data: seriesData }];
      this.chartOptions.xaxis.categories = categories;
    });
  }

  ngOnDestroy(): void {

    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (e) {
        console.warn("El chart ya estaba destruido o no inicializado", e);
      }
    }
  }
}
