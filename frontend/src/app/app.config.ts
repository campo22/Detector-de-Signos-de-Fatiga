import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from './features/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export function initializeApp(authService: AuthService) {
  return (): Promise<any> => {
    // Convertimos el Observable a una Promesa, como requiere APP_INITIALIZER.
    return firstValueFrom(authService.silentRefresh());
  };
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor
      ])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    },
    providePrimeNG({
      theme: {
        preset: Lara
      }
    })
  ]
};
