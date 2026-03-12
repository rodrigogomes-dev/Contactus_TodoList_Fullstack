import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule), // <-- Adicionado para o ngModel
    provideRouter(routes)
    // O provideBrowserGlobalErrorListeners foi removido porque é mais para debugging avançado
  ]
};
