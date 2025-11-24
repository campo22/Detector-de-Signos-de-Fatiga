import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SpotlightDirective } from '../../directives/spotlight.directive';

@Component({
  selector: 'app-case-studies',
  templateUrl: './case-studies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslatePipe, SpotlightDirective]
})
export class CaseStudiesComponent {}