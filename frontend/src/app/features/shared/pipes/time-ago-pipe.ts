import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {

  /**
   * Convierte una fecha o un string que represente una fecha en una cadena que indique el tiempo transcurrido desde esa fecha hasta el momento actual.
   * @param value - La fecha o string que se quiere convertir.
   * @returns Una cadena que indica el tiempo transcurrido desde la fecha dada hasta el momento actual.
   */
  transform(value: string | Date): string {
    if (!value) return '';

    // Convertir la fecha o string en un objeto Date si es necesario
    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // si es menos de un minuto, mostrar "Hace un momento"
    if (seconds < 60) return 'Hace un momento';

    const minutes = Math.floor(seconds / 60);
    // si es menos de una hora, mostrar "Hace X minutos"
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    // si es menos de un dia, mostrar "Hace X horas"
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;

    const days = Math.floor(hours / 24);
    // mostrar "Hace X dias"
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  }
}
