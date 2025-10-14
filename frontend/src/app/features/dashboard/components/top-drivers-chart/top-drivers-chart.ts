import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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

// === Tipado para las opciones del gráfico ===
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
export class TopDriversChart implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  private analyticsService = inject(AnalyticsService);

  constructor() {
    // Configuración base del gráfico
    this.chartOptions = {
      series: [],
      chart: {
        type: 'bar',
        height: 160,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        foreColor: 'hsl(var(--muted-foreground))',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 10,
          barHeight: '55%',
          distributed: true,
        },
      },
      colors: [
        'hsl(var(--destructive))',
        'hsl(var(--destructive) / 0.8)',
        'hsl(var(--warning))',
        'hsl(var(--primary) / 0.8)',
        'hsl(var(--primary) / 0.6)',
      ],
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        formatter: (val, opt) => {
          const driver = opt.w.globals.labels[opt.dataPointIndex];
          return `${driver} - ${val}`;
        },
        style: {
          colors: ['#fff'],
          fontWeight: '600',
          fontSize: '13px',
        },
        offsetX: 10,
      },
      yaxis: {
        show: false,
      },
      xaxis: {
        categories: [],
        min: 0,
        tickAmount: 5, // Eje X de 5 en 5
        labels: {
          show: true,
          style: {
            colors: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          formatter: (val) => Math.round(Number(val)).toString(),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)', // Líneas suaves
        strokeDashArray: 4, // Líneas punteadas sutiles
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      legend: { show: false },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: (val) => `${val} alertas`,
        },
      },
    };
  }

  ngOnInit(): void {
    this.analyticsService.getTopDriversByAlerts().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.chartOptions.series = [{ name: 'Alertas', data: [] }];
          this.chartOptions.xaxis!.categories = [];
          return;
        }

        // Extraemos nombres y totales
        const categories = data.map((driver) => driver.driverName);
        const seriesData = data.map((driver) => driver.alertCount);

        // Calculamos un máximo ajustado a múltiplos de 5
        const maxValue = Math.ceil(Math.max(...seriesData) / 5) * 5;

        // Actualizamos dinámicamente el gráfico
        this.chartOptions = {
          ...this.chartOptions,
          series: [{ name: 'Alertas', data: seriesData }],
          xaxis: {
            ...this.chartOptions.xaxis,
            categories,
            min: 0,
            max: maxValue,
            tickAmount: 5,
          },
        };
      },
      error: (err) => console.error('Error al cargar top drivers:', err),
    });
  }
}
