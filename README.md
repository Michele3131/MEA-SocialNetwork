# MEA

Link alla piattaforma: [https://measn.web.app](https://measn.web.app)

## Funzionamento del sito
MEA è un social network minimale basato su architettura Single Page Application (SPA).

### Architettura Tecnica
- **Framework**: Angular 21 (Standalone Components).
- **Backend**: Firebase (Authentication e Cloud Firestore).
- **Stile**: [Pico.css](https://picocss.com/) (Classless CSS Framework) integrato per un layout responsivo e leggero.
- **Design**: Minimalismo estremo, palette monocromatica, font JetBrains Mono per un'estetica "terminal-like".
- **Modularità**: Architettura a componenti riutilizzabili (Toasts, Lightbox, Publish, Loading) per massimizzare la manutenibilità.

### Flusso Operativo
1. **Autenticazione**: Accesso obbligatorio tramite Email/Password per la creazione del profilo.
2. **Feed**: Visualizzazione cronologica dei post recuperati in tempo reale da Firestore, ordinati dal più recente.
3. **Interazione**: Creazione di post testuali con supporto alle immagini (auto-ridimensionate lato client).
4. **Profilo**: Gestione dei propri post, aggiornamento del nome utente e della foto profilo.
5. **Notifiche & Feedback**: Sistema di feedback integrato per ogni azione e componenti di caricamento animati (Loading) con estetica terminal.

## Guida alla configurazione e Portabilità

Questa repository è configurata per essere "portabile".
Non contiene file sensibili o legati alla sessione dell'autore originale.
Seguire questi passaggi per ripristinare il progetto su una nuova macchina.

### 1. Prerequisiti
- **Node.js**: Versione 18 o superiore.
- **Firebase CLI**: Installabile tramite `npm install -g firebase-tools`.
- **Account Firebase**: Necessario per creare un nuovo progetto e ottenere le chiavi API.

### 2. Ripristino Dipendenze
Dopo aver clonato la repository, installare le librerie necessarie:
```powershell
npm install --legacy-peer-deps
```
*Il flag `--legacy-peer-deps` è fondamentale per risolvere i conflitti di versione tra Angular 21 e il kit Firebase.*

### 3. Ripristino File Mancanti (Configurazione Ambiente)
Per motivi di sicurezza, i file di ambiente non sono inclusi in Git.
È necessario crearli manualmente:

1. Creare la cartella `src/environments/` (se non esiste).
2. Creare il file `src/environments/environment.development.ts`.
3. Incollare il seguente codice sostituendo i valori con quelli forniti dalla Console Firebase (Project Settings > Your Apps):

```typescript
export const environment = {
  firebase: {
    apiKey: "TUA_API_KEY",
    authDomain: "TUO_PROGETTO.firebaseapp.com",
    projectId: "TUO_PROGETTO",
    storageBucket: "TUO_PROGETTO.firebasestorage.app",
    messagingSenderId: "ID_MESSAGGISTICA",
    appId: "ID_APP",
    measurementId: "ID_MISURAZIONE"
  }
};
```

### 4. Configurazione Database (Firestore)
Per far funzionare il social network, è necessario inizializzare Firestore sul proprio account Firebase:
1. Creare un database Firestore in **Native Mode**.
2. Applicare le regole di sicurezza presenti nel file `firestore.rules` tramite la console Firebase o eseguendo `npx firebase deploy --only firestore:rules`.

### 5. Avvio e Sessione
Una volta configurato l'ambiente:
- Eseguire `npm start` per avviare le server di sviluppo locale.
- Il sito richiederà un nuovo login.
La sessione è gestita localmente dal browser.

## Spiegazione delle scelte progettuali

### Modularità e Best Practices
Il codice è stato rifattorizzato seguendo i principi di design atomico.
Componenti critici come il sistema di notifiche (Toasts), la creazione di post (Publish) e la visualizzazione immagini (Lightbox) sono stati isolati per essere riutilizzabili e indipendenti, riducendo la complessità dei componenti principali come Feed e Profile.

### Estetica Terminal Prompt
L'uso del font JetBrains Mono e di una struttura a riga di comando forza l'utente a focalizzarsi sul contenuto testuale.
La scelta stilistica si allinea ai principi del brutalismo digitale.

### Palette Monocromatica e Pico.css
La palette è stata semplificata a puro bianco e nero per massimizzare la leggibilità.
L'integrazione di Pico.css garantisce una base solida per la responsività mobile e il supporto nativo alla modalità oscura senza appesantire il bundle finale.
