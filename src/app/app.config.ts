import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(),
     NoopAnimationsModule,
     provideAnimationsAsync(),
     provideAuth0({
      domain: 'dev-sjeefkomgs73sqyh.us.auth0.com',
      clientId: 'Z2qJqqJrLTbUB7vyzdjeKmTaVqTcz8Ac',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
    ]
};
