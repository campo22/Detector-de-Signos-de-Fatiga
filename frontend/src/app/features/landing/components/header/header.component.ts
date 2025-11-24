import { Component, ChangeDetectionStrategy, signal, inject, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ModalService } from '../../services/modal.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, TranslatePipe, LogoComponent],
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuOpen = signal(false);
  languageService = inject(LanguageService);
  private modalService = inject(ModalService);
  currentLang = this.languageService.currentLang;
  langMenuOpen = signal(false);

  private readonly renderer = inject(Renderer2);
  activeSection = signal('');
  private observer: IntersectionObserver | undefined;
  private readonly sectionIds = ['features', 'case-studies', 'how-it-works', 'roi-calculator', 'pricing', 'faq', 'contacto'];

  ngOnInit(): void {
    // Delay observer initialization to ensure target elements are in the DOM.
    setTimeout(() => this.initializeObserver(), 100);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    // Ensure scroll is re-enabled if component is destroyed while mobile menu is open.
    this.renderer.removeClass(document.body, 'overflow-hidden');
  }

  private initializeObserver(): void {
    const options = {
      rootMargin: '-40% 0px -60% 0px', // Triggers when a section is in the middle of the viewport
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
        }
      });
    }, options);

    this.sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        this.observer?.observe(element);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
    if (this.menuOpen()) {
      this.renderer.addClass(document.body, 'overflow-hidden');
    } else {
      this.renderer.removeClass(document.body, 'overflow-hidden');
    }
  }

  toggleLangMenu(): void {
    this.langMenuOpen.update(open => !open);
  }

  switchLanguage(lang: 'es' | 'en'): void {
    this.languageService.setLanguage(lang);
    this.langMenuOpen.set(false);
  }

  openDemoModal(): void {
    this.modalService.openDemoModal();
    // Close mobile menu if it's open
    if (this.menuOpen()) {
      this.toggleMenu();
    }
  }
}
