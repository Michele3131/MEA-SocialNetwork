import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

/**
 * Configurazione globale dell'applicazione Angular.
 * Definisce i provider per il routing, il rilevamento dei cambiamenti e l'integrazione con Firebase.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /** Ottimizzazione del rilevamento dei cambiamenti tramite coalescenza degli eventi */
    provideZoneChangeDetection({ eventCoalescing: true }),
    /** Configurazione delle rotte dell'applicazione */
    provideRouter(routes),
    /** Inizializzazione dell'app Firebase con le credenziali d'ambiente */
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    /** Provider per i servizi di autenticazione Firebase */
    provideAuth(() => getAuth()),
    /** Provider per il database NoSQL Cloud Firestore */
    provideFirestore(() => getFirestore())
  ]
};
