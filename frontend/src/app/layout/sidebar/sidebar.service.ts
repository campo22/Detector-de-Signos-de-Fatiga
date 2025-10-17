import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  public isSidebarOpen = signal(false);

  public toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  public closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
