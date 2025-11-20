import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: any): string {
    if (!value) return '';

    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return this.translate.instant('TIME.JUST_NOW');
    }

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    let counter;
    for (const i in intervals) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) {
        if (counter === 1) {
          return this.translate.instant(`TIME.${i.toUpperCase()}_AGO`, { count: counter });
        } else {
          return this.translate.instant(`TIME.${i.toUpperCase()}_AGO_PLURAL`, { count: counter });
        }
      }
    }
    return '';
  }
}
