import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, Injectable } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // HttpClient ya está importado
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

// Custom TranslateLoader para resolver el error TS2554
@Injectable()
export class CustomTranslateLoader extends TranslateHttpLoader implements TranslateLoader {
  constructor(http: HttpClient) {
    super(http, './assets/i18n/', '.json');
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        jwtInterceptor
      ])
    ),
    providePrimeNG({
      theme: {
        preset: Lara
      }
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader, // Usar la clase de cargador personalizada
          deps: [HttpClient]
        }
      })
    )
  ]
};
