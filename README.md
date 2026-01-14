# MEA Social Network - Concept & Documentation

## 1. Visione Concettuale
MEA (Minimal Essential Aesthetics) è un social network progettato per ridurre il rumore visivo e cognitivo tipico delle piattaforme moderne. L'interfaccia si ispira all'estetica dei terminali e del brutalismo digitale, ponendo il contenuto al centro dell'esperienza senza distrazioni superflue.

### Principi Chiave:
- **Minimalismo Radicale**: Eliminazione di ogni elemento decorativo non funzionale.
- **Ordine Geometrico**: Layout a griglia rigorosa con dimensioni fisse per garantire armonia visiva.
- **Focus sul Contenuto**: Il testo e i media sono i protagonisti assoluti.
- **Interazione Essenziale**: Punteggi e feedback ridotti all'osso per scoraggiare la dipendenza da "vanity metrics".

## 2. Struttura dell'Interfaccia

Il sito è costruito come una Single Page Application (SPA) contenuta in un wrapper fisso che occupa gran parte dello schermo, simulando una finestra applicativa o un terminale dedicato.

### Layout Principale (Desktop)
Il layout è diviso in due colonne principali all'interno di un contenitore centrato con margini uniformi:

1.  **Colonna Sinistra (Feed)**:
    - Occupa la maggior parte dello spazio.
    - Contiene lo stream dei post.
    - Scorrimento interno per mantenere l'intestazione e la struttura fisse.

2.  **Colonna Destra (Utility)**:
    - **Pannello Comandi (Alto)**: Accesso rapido a funzionalità chiave (Tema, Nuovo Post, Profilo, Cerca).
    - **Notifiche (Centro)**: Lista testuale e minimale delle attività recenti.
    - **Tendenze (Basso)**: Lista di hashtag popolari, filtrabili per periodo (Sempre / Ultime 24h).

## 3. Design dei Post

Ogni post è racchiuso in una "card" terminale con bordi netti. Esistono tre tipologie di visualizzazione, gestite automaticamente in base al contenuto:

### A. Post Standard (Media + Testo)
- **Dimensioni**: Altezza fissa standard (`240px`).
- **Layout**: 
    - Sinistra: Media (Immagine/Video) in formato quadrato 1:1.
    - Centro: Linea divisoria verticale.
    - Destra: Header (Utente, Data, Ora), Didascalia troncata, Statistiche.
- **Espansione**: Cliccando sul testo o sul media, si apre un Lightbox per la fruizione completa.

### B. Post Solo Testo
- **Dimensioni**: Altezza dimezzata (`120px`) per ottimizzare lo spazio.
- **Layout**: Tutto il contenuto parte da sinistra.
- **Visualizzazione**: Testo troncato a 2 righe con possibilità di espansione.

### C. Post Solo Media
- **Dimensioni**: Larghezza dimezzata (50%) mantenendo l'altezza standard.
- **Layout**: Due post di questo tipo si affiancano automaticamente sulla stessa riga.
- **Contenuto**: Media a tutto schermo (nel riquadro) con header minimale e controlli in sovraimpressione o in calce.

## 4. Funzionalità Specifiche

### Sistema di Punteggio (Score)
Al posto dei classici "Mi Piace", MEA utilizza un sistema di **Score** numerico.
- **Controlli**: Due pulsanti `+` e `-` posti all'estremità destra del post.
- **Logica**: L'utente può incrementare o decrementare il valore del contenuto, promuovendo la qualità piuttosto che la sola popolarità virale.

### Visualizzazione Data/Ora
Ogni post riporta un timestamp preciso `[YYYY-MM-DD HH:MM]`, richiamando i log di sistema.

### Modalità Chiaro/Scuro (Theme)
Un pulsante "TEMA" nel pannello comandi inverte la palette cromatica:
- **Dark Mode (Default)**: Sfondo nero profondo `#0a0a0a`, testo grigio/bianco, accentuazioni minimali. Ideale per riposare la vista.
- **Light Mode**: Sfondo bianco/grigio chiaro, testo scuro ad alto contrasto.

### Lightbox
Un visualizzatore modale a tutto schermo per immagini, video e testi lunghi, permettendo di focalizzarsi sul singolo contenuto senza il rumore del feed.

## 5. Stato del Progetto

- **index_demo.html**: Versione dimostrativa con dati mock (fittizi) per visualizzare il layout e le interazioni (JS incluso in `js/main.js`).
- **index.html**: Versione "Production Ready", pulita e pronta per essere collegata a un backend reale (JS in `js/app.js`).
