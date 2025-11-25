
import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { SystemTourComponent } from './components/system-tour/system-tour.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { CaseStudiesComponent } from './components/case-studies/case-studies.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { LogoCloudComponent } from './components/logo-cloud/logo-cloud.component';
import { RoiCalculatorComponent } from './components/roi-calculator/roi-calculator.component';
import { LanguageService } from './services/language.service';
import { LoginFabComponent } from './components/login-fab/login-fab.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { DemoModalComponent } from './components/demo-modal/demo-modal.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { ModalService } from './services/modal.service';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    FeaturesComponent,
    SystemTourComponent,
    TestimonialsComponent,
    HowItWorksComponent,
    FaqComponent,
    ContactComponent,
    FooterComponent,
    CaseStudiesComponent,
    ChatbotComponent,
    LogoCloudComponent,
    RoiCalculatorComponent,
    LoginFabComponent,
    PricingComponent,
    DemoModalComponent,
    LoginModalComponent,
  ],
})
export class LandingComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private fragmentSubscription: Subscription | undefined;
  private queryParamsSubscription: Subscription | undefined;

  constructor() {
    this.languageService.init();
  }

  ngOnInit(): void {
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // We need to use setTimeout to allow the view to render before scrolling
        // Fix: Replaced ViewportScroller with native DOM scrolling as withAnchorScrolling is disabled.
        setTimeout(() => {
          try {
            const element = document.querySelector(`#${fragment}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (e) {
            console.error(`Failed to scroll to anchor: #${fragment}`, e);
          }
        }, 0);
      }
    });

    this.queryParamsSubscription = this.route.queryParams.subscribe((params: Params) => {
      if (params['showLogin'] === 'true') {
        // Verificar que authService esté disponible antes de usarlo
        // Usar Promise.resolve() para asegurar que se ejecute en el siguiente ciclo de eventos
        Promise.resolve().then(() => {
          if (this.authService) {
            // Usar un pequeño retraso para asegurar la sincronización del estado de autenticación
            setTimeout(() => {
              // Solo abrir el modal si el usuario no está autenticado
              if (!this.authService.isAuthenticated()) {
                this.modalService.openLoginModal();
              } else {
                // Si el usuario ya está autenticado, redirigir al dashboard
                this.router.navigate(['/dashboard']);
              }
            }, 10);
          } else {
            // Si no está disponible, abrir modal como fallback
            this.modalService.openLoginModal();
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeAOS();
  }

  ngOnDestroy(): void {
    this.fragmentSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe?.();
  }

  private initializeAOS(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1
    });

    this.elementRef.nativeElement.querySelectorAll('[data-aos]').forEach((el: Element) => {
      observer.observe(el);
    });
  }
}