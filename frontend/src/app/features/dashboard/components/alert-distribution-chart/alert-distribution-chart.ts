import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, computed, signal, Signal } from '@angular/core';
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
  states?: any; // Añadido para incluir estados del gráfico
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

  private colorsSignal = signal<Record<FatigueType, string> | null>(null);

  // Configuración base del gráfico - diseño minimalista y limo
  private baseChartConfig: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 280,
      sparkline: { enabled: true }, // Habilitar sparkline para un diseño más limpio
      background: 'transparent',
      dropShadow: {
        enabled: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%', // Aumentar el tamaño del agujero para un aspecto más elegante
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: false, // No mostrar nombres en el gráfico para más limpieza
            },
            value: {
              show: true, // Mostrar solo valores numéricos
              fontSize: '28px',
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 'bold',
              color: 'hsl(var(--foreground))',
              offsetY: -5,
              formatter: function(val: any) {
                return val; // Muestra el valor numérico
              }
            },
            total: {
              show: true,
              label: 'Total',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '16px',
              fontWeight: 500,
              formatter: (w) => {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              }
            }
          }
        }
      }
    },
    dataLabels: { 
      enabled: false // Deshabilitar etiquetas de datos para un aspecto más limpio
    },
    stroke: { 
      width: 4, 
      colors: ['hsl(var(--card))'] // Color del fondo del gráfico
    },
    tooltip: {
      enabled: true,
      fixed: {
        enabled: false // Deshabilitar posición fija
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      x: {
        show: true,
        formatter: function(val: any) {
          return val; // Muestra el tipo de fatiga
        }
      },
      y: {
        formatter: function(val: any) {
          return val + " alertas"; // Muestra el valor con texto
        },
        title: {
          formatter: (seriesName: string) => seriesName // Formato para el título
        }
      },
      theme: 'dark',
    },
    states: {
      hover: {
        filter: { type: 'none' } // No aplicar efecto especial al hacer hover
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: 'none' }
      }
    }
  };

  // Convertir el signal de filtros a un observable y obtener los datos
  private _alertData = toSignal(
    toObservable(this.filterService.filter$).pipe(
      switchMap(filters => {
        console.log('AlertDistributionChart - Filtros cambiados:', filters);
        return this.analyticsService.getAlertDistribution(filters);
      })
    ),
    { initialValue: null }
  );
  
  // Getter público para acceder a los datos desde el template
  public alertData = () => this._alertData();

  constructor() {
    // Wait for the view to be initialized before getting CSS variables
    setTimeout(() => {
      // Map fatigue types to appropriate color variables with consistency across the dashboard
      this.colorsSignal.set({
        [FatigueType.MICROSUEÑO]: this.getCssVariableValue('--destructive'), // Critical fatigue
        [FatigueType.CABECEO]: this.getCssVariableValue('--destructive-secondary') || this.getCssVariableValue('--destructive'), // Critical fatigue
        [FatigueType.BOSTEZO]: this.getCssVariableValue('--warning'), // Medium fatigue
        [FatigueType.CANSANCIO_VISUAL]: this.getCssVariableValue('--primary'), // Low fatigue
        [FatigueType.NINGUNO]: this.getCssVariableValue('--success') || this.getCssVariableValue('--muted-foreground'), // No fatigue
      });
    }, 0);
  }

  private getCssVariableValue(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }

  // Computed signal para las opciones del gráfico
  public chartOptions: Signal<Partial<ChartOptions>> = computed(() => {
    const data = this._alertData();
    const colorMap = this.colorsSignal();

    if (!data || !colorMap) {
      return {
        ...this.baseChartConfig,
        series: [1],
        labels: ['Cargando...'],
        colors: [`hsl(${this.getCssVariableValue('--muted')})`]
      };
    }

    console.log('AlertDistributionChart - Datos recibidos:', data);
    console.log('AlertDistributionChart - colorMap:', colorMap);

    const labels: string[] = [];
    const series: number[] = [];
    const colors: string[] = [];

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const fatigueType = key as FatigueType;
        console.log('AlertDistributionChart - fatigueType key:', fatigueType);
        labels.push(fatigueType.replace('_', ' '));
        series.push(data[fatigueType]);
        const colorValue = colorMap[fatigueType];
        // Add 'hsl(' prefix and ')' suffix to the raw HSL value from CSS variables
        colors.push(colorValue ? `hsl(${colorValue})` : `hsl(${this.getCssVariableValue('--secondary')})`);
      }
    }

    console.log('AlertDistributionChart - Series procesadas:', series);
    console.log('AlertDistributionChart - Colors procesados:', colors);

    return {
      ...this.baseChartConfig,
      series: series.length > 0 ? series : [1],
      labels: labels.length > 0 ? labels : ['Sin datos'],
      colors: colors.length > 0 ? colors : [`hsl(${this.getCssVariableValue('--muted')})`]
    };
  });

  /**
   * Procesa los datos de distribución de alertas para mostrarlos como una lista
   * similar al "Top 5 Conductores con Más Alertas"
   */
  processDistributionData(): Array<{type: string, count: number, color: string}> {
    const data = this._alertData();
    const colorMap = this.colorsSignal();

    if (!data || !colorMap) {
      return [];
    }

    // Convertir objeto a array de objetos {type, count, color}
    const items = Object.keys(data).map(key => {
      const fatigueType = key as FatigueType;
      const count = data[fatigueType];
      const colorValue = colorMap[fatigueType];
      const color = colorValue ? `hsl(${colorValue})` : `hsl(${this.getCssVariableValue('--secondary')})`;

      return {
        type: fatigueType.replace('_', ' '), // Convertir guiones bajos a espacios
        count: count,
        color: color
      };
    });

    // Ordenar por cantidad en orden descendente (más altas primero)
    return items.sort((a, b) => b.count - a.count);
  }
}