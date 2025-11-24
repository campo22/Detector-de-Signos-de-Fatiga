import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-system-tour',
  templateUrl: './system-tour.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgOptimizedImage, TranslatePipe],
})
export class SystemTourComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  private autoplayInterval: number | null = null;
  private readonly autoplayDelay = 5000; // 5 seconds
  private languageService = inject(LanguageService);

  slides = computed(() => [
    {
      imgSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
      alt: 'Dashboard Principal de SafeTrack',
      title: this.languageService.translate('systemTour.slides.dashboard.title'),
      description: this.languageService.translate('systemTour.slides.dashboard.description')
    },
    {
      imgSrc: 'https://images.unsplash.com/photo-1611068813580-b371d1a13322?q=80&w=1200&auto=format&fit=crop',
      alt: 'Vista de Monitoreo Individual',
      title: this.languageService.translate('systemTour.slides.monitoring.title'),
      description: this.languageService.translate('systemTour.slides.monitoring.description')
    },
    {
      imgSrc: 'https://images.unsplash.com/photo-1560415755-bd80d06eda60?q=80&w=1200&auto=format&fit=crop',
      alt: 'Reportes Analíticos',
      title: this.languageService.translate('systemTour.slides.reports.title'),
      description: this.languageService.translate('systemTour.slides.reports.description')
    },
    {
      imgSrc: 'https://images.unsplash.com/photo-1591696205602-2f950c416cb1?q=80&w=1200&auto=format&fit=crop',
      alt: 'Gestión de Alertas',
      title: this.languageService.translate('systemTour.slides.alerts.title'),
      description: this.languageService.translate('systemTour.slides.alerts.description')
    }
  ]);

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay(); // Prevent multiple intervals
    this.autoplayInterval = window.setInterval(() => {
      this.currentSlide.update(i => (i + 1) % this.slides().length);
    }, this.autoplayDelay);
  }

  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  private resetAutoplay(): void {
    this.startAutoplay();
  }

  nextSlide(): void {
    this.currentSlide.update(i => (i + 1) % this.slides().length);
    this.resetAutoplay();
  }

  prevSlide(): void {
    this.currentSlide.update(i => (i - 1 + this.slides().length) % this.slides().length);
    this.resetAutoplay();
  }
  
  goToSlide(index: number): void {
    if (this.currentSlide() === index) return;
    this.currentSlide.set(index);
    this.resetAutoplay();
  }
}
