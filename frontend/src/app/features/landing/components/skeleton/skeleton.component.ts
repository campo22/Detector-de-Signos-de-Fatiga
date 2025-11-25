import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="getSkeletonClass()"
      [class]="customClass || ''"
      [style.width]="getWidth()"
      [style.height]="getHeight()"
      [attr.aria-label]="ariaLabel || 'Cargando contenido'"
      role="status">
      <div class="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .animate-shimmer {
      animation: shimmer 2s infinite linear;
    }
  `]
})
export class SkeletonComponent implements OnInit {
  @Input() type: 'line' | 'circle' | 'rect' | 'text' | 'card' | 'avatar' | 'button' = 'rect';
  @Input() width?: string;
  @Input() height?: string;
  @Input() customClass?: string = '';
  @Input() ariaLabel?: string;

  ngOnInit() {
    // Establecer valores por defecto si no se proporcionan
    if (!this.width && !this.height) {
      switch (this.type) {
        case 'line':
          this.height = '16px';
          break;
        case 'circle':
          this.width = '40px';
          this.height = '40px';
          break;
        case 'text':
          this.width = '100%';
          this.height = '16px';
          break;
        case 'avatar':
          this.width = '48px';
          this.height = '48px';
          break;
        case 'button':
          this.width = '100px';
          this.height = '40px';
          break;
        case 'card':
          this.width = '100%';
          this.height = '200px';
          break;
        default:
          this.width = '100%';
          this.height = '60px';
      }
    }
  }

  getSkeletonClass(): string {
    const baseClasses = 'relative overflow-hidden rounded-lg bg-landing-primary/10';

    // Determinar clases según el tipo
    switch (this.type) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'avatar':
        return `${baseClasses} rounded-full`;
      case 'line':
      case 'text':
        return `${baseClasses} rounded-md`;
      case 'button':
        return `${baseClasses} rounded-full`;
      case 'card':
        return `${baseClasses} rounded-xl`;
      default:
        return baseClasses;
    }
  }

  getWidth(): string {
    return this.width || '100%';
  }

  getHeight(): string {
    return this.height || '60px';
  }
}