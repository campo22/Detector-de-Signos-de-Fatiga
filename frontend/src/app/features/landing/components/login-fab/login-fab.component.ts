import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login-fab',
  templateUrl: './login-fab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslatePipe]
})
export class LoginFabComponent {
  private modalService = inject(ModalService);

  openLoginModal(): void {
    this.modalService.openLoginModal();
  }
}