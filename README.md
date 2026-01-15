# MEA SOCIETAS

Link alla piattaforma: [https://measn.web.app](https://measn.web.app)

## Funzionamento del sito
MEA Societas è un social network minimale basato su architettura Single Page Application (SPA).

### Architettura Tecnica
- **Framework**: Angular 21 (Standalone Components).
- **Backend**: Firebase (Authentication per la gestione utenti e Cloud Firestore per il database real-time).
- **Routing**: Gestione client-side dei percorsi per navigazione fluida senza ricaricamento della pagina.
- **Interfaccia**: Design orientato al terminale con font monospace (JetBrains Mono) e layout a contrasto elevato.

### Flusso Operativo
1. **Autenticazione**: Accesso obbligatorio tramite Google Auth per la creazione del profilo.
2. **Feed**: Visualizzazione cronologica dei post recuperati in tempo reale da Firestore.
3. **Interazione**: Creazione di post testuali e gestione del profilo utente.
4. **Persistenza**: Sincronizzazione automatica dei dati tra i client connessi.

## Guida alla configurazione

### Prerequisiti
- Node.js (versione 18 o superiore consigliata).
- Firebase CLI (`npm install -g firebase-tools`).

### Installazione Locale
1. Clonare il repository.
2. Installare le dipendenze:
   ```powershell
   npm install --legacy-peer-deps
   ```
   *Nota: Il flag `--legacy-peer-deps` è necessario per risolvere i conflitti tra le versioni sperimentali di Angular e Firebase.*

### Configurazione Ambiente
Creare il file `src/environments/environment.development.ts` con le proprie credenziali Firebase:
```typescript
export const environment = {
  firebase: {
    apiKey: "TUA_API_KEY",
    authDomain: "TUO_DOMINIO.firebaseapp.com",
    projectId: "TUO_PROJECT_ID",
    storageBucket: "TUO_BUCKET.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID",
    measurementId: "MEASUREMENT_ID"
  }
};
```

### Comandi Principali
- **Avvio Sviluppo**: `npm start` (accessibile su `localhost:4200`).
- **Build**: `npm run build`.
- **Deploy**: `npx firebase deploy`.

## Spiegazione delle scelte progettuali

### Estetica Terminal Prompt
La scelta di un'interfaccia ispirata al terminale mira a eliminare le distrazioni cognitive tipiche dei social network moderni. L'uso del font JetBrains Mono e di una struttura a riga di comando forza l'utente a focalizzarsi sul contenuto testuale piuttosto che sugli elementi decorativi.

### Palette Monocromatica (Bianco e Nero)
Originariamente più complessa, la palette è stata semplificata a puro bianco e nero per massimizzare la leggibilità e l'accessibilità. Questa scelta stilistica si allinea ai principi del brutalismo digitale, garantendo al contempo una navigazione riposante per la vista.

### Sicurezza e Git
I file di configurazione contenenti le API Key sono esclusi dal sistema di versionamento tramite `.gitignore`. Questa è una scelta obbligatoria per prevenire l'esposizione di credenziali sensibili in repository pubblici, mantenendo la flessibilità di configurazione locale tramite file non tracciati.

### Risoluzione Dipendenze
L'uso di `--legacy-peer-deps` durante l'installazione è una scelta tecnica dettata dall'utilizzo di versioni bleeding-edge di Angular (v21), garantendo la compatibilità con il kit di sviluppo Firebase durante la fase di transizione del framework.
