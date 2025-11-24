import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appSpotlight]',
  standalone: true
})
export class SpotlightDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.elementRef.nativeElement.style.setProperty('--mouse-x', `${x}px`);
    this.elementRef.nativeElement.style.setProperty('--mouse-y', `${y}px`);
  }
}
