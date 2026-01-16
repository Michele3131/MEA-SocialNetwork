import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

/**
 * Punto di ingresso principale dell'applicazione.
 * Avvia il bootstrap dell'applicazione Angular utilizzando il componente radice e la configurazione globale.
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
