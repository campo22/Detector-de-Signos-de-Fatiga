import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isDemoModalOpen = signal(false);
  isLoginModalOpen = signal(false);

  openDemoModal(): void {
    this.isDemoModalOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeDemoModal(): void {
    this.isDemoModalOpen.set(false);
    if (!this.isLoginModalOpen()) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
    if (!this.isDemoModalOpen()) {
      document.body.classList.remove('overflow-hidden');
    }
  }
}