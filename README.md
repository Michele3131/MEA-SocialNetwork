# MEA Social Network - Documentazione Tecnica

MEA è una Single Page Application (SPA) basata su framework Angular, integrata con i servizi Firebase per la gestione di autenticazione, persistenza dei dati e hosting.

## Stack Tecnologico

- **Framework**: Angular 21 (Standalone Components)
- **Backend-as-a-Service**: Firebase (Firestore, Authentication)
- **CSS Framework**: Pico.css v2 (Customized)
- **Gestione Stato**: RxJS (Subject/Observable pattern)
- **Package Manager**: npm

## Architettura del Sistema

### Core Services
La logica di business è centralizzata in `SocialService` ([social.ts](file:///c:/Users/DEV%202/Desktop/MEAaw/src/app/services/social.ts)), che gestisce:
- Comunicazione con Firestore (CRUD dei post, aggiornamento profili).
- Elaborazione immagini lato client (ridimensionamento e compressione Base64).
- Gestione dello stato di autenticazione tramite Firebase Auth.

### Gestione Dati e Paginazione
Il sistema utilizza una paginazione manuale basata su cursori Firestore (`QueryDocumentSnapshot`).
- **Feed Principale**: Query ordinata per `date` decrescente con limite batch predefinito.
- **Profilo Utente**: Query filtrata per `uid` e ordinata per `date`. Richiede l'indice composito definito in `firestore.indexes.json`.

### UI/UX e Layout
Il layout è dinamico e gestito tramite classi CSS condizionali in `app.component`:
- **Feed**: Layout asimmetrico (80% contenuto principale, 20% sidebar).
- **Profilo**: Layout centrato con larghezza massima fissata al 70% per ottimizzare la leggibilità su desktop.
- **Transizioni**: Implementate tramite CSS Transitions su `flex-basis`, `opacity` e `transform` per la gestione fluida della sidebar.

## Requisiti e Installazione

### Dipendenze
Per l'installazione delle dipendenze, data la versione di Angular, è necessario utilizzare il flag per la risoluzione dei peer-deps:
```powershell
npm install --legacy-peer-deps
```

### Configurazione Ambiente
Il sistema richiede un file di configurazione `src/environments/environment.development.ts` con la seguente struttura:
```typescript
export const environment = {
  firebase: {
    apiKey: "STRING",
    authDomain: "STRING",
    projectId: "STRING",
    storageBucket: "STRING",
    messagingSenderId: "STRING",
    appId: "STRING"
  }
};
```

### Configurazione Database
Firestore deve essere configurato con le regole di sicurezza definite in `firestore.rules`. È obbligatoria la creazione del seguente indice composito per il corretto funzionamento della pagina profilo:
- **Collection**: `posts`
- **Fields**: `uid` (Ascending), `date` (Descending)

## Deployment

Il processo di build e deploy è gestito tramite Firebase CLI:
1. Build dell'applicazione: `npm run build`
2. Deploy Hosting e Indici: `npx firebase deploy`

---
Documentazione tecnica aggiornata al 16/01/2026.
