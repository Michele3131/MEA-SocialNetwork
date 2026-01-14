# MEA SOCIETAS SOCIALIS

Versione backend Flask del social network MEA. Progetto ottimizzato per deploy su PythonAnywhere con database MySQL.

## Architettura Tecnica

- **Backend**: Flask (Python)
- **Database**: MySQL
- **Frontend**: HTML5, CSS3 (Grid Layout per Masonry), JavaScript ES6
- **Storage**: File system locale per upload media

## Funzionalità Core

### 1. Sistema di Votazione (Paparell)
- Gestione voti tramite tabella `likes` per persistenza e unicità.
- Prevenzione self-like lato server.
- Calcolo dinamico del punteggio totale nel profilo utente tramite aggregazione SQL (`SUM`).

### 2. Gestione Feed e Masonry
- Layout dinamico basato su CSS Grid.
- Algoritmo JavaScript per il calcolo degli span di riga (`grid-row-end`) basato sull'altezza effettiva del contenuto.
- Caricamento asincrono (Lazy Loading) dei post tramite API paginata.

### 3. Sistema di Notifiche
- Polling client-side ogni 60 secondi verso `/api/notifications`.
- Tracking dei nuovi like tramite colonna `last_seen_likes` nella tabella `users`.
- Calcolo delta tra totale attuale e ultimo valore visualizzato.

### 4. Gestione Media
- Generazione nomi file univoci tramite concatenazione di timestamp e UUID.
- Validazione estensioni file e dimensione massima (16MB).

## Configurazione e Deploy

### 1. Requisiti
- Python 3.x
- MySQL Server
- Dipendenze: `flask`, `mysql-connector-python`, `werkzeug`

### 2. Setup Database
Importare la struttura definita in `database.sql`:
```bash
mysql -u [user] -p [database_name] < database.sql
```

### 3. Configurazione Ambiente
Modificare `DB_CONFIG` in `app.py`:
```python
DB_CONFIG = {
    'host': 'hostname',
    'user': 'username',
    'password': 'password',
    'database': 'database_name'
}
```

### 4. Deploy su PythonAnywhere

1. **Upload**: Caricare i file nella directory di progetto (es. `/home/[user]/MEApy`).
2. **Directory Struttura**: Assicurarsi che esistano le cartelle:
   - `static/`
   - `static/uploads/` (con permessi di scrittura per il processo web)
3. **Web App**: Configurare una nuova Web App con entry point `/home/[user]/MEApy`.
4. **Static Files**: Nella sezione "Static files" della Web tab, aggiungere le seguenti mappature:
   - **URL**: `/static/`
   - **Directory**: `/home/[user]/MEApy/static`
5. **WSGI Configuration**:
```python
import sys
import os
path = '/home/[user]/MEApy'
if path not in sys.path:
    sys.path.append(path)
from app import app as application
```

### 5. Note su Caricamento Media
- **Limite**: 16MB (configurato tramite `MAX_CONTENT_LENGTH`).
- **Pathing**: Utilizzo di `os.path.abspath` in `app.py` per garantire la risoluzione dei percorsi su ambienti Linux/PythonAnywhere.
- **Naming**: I file vengono rinominati in `[timestamp]_[uuid].[ext]` per prevenire collisioni.

## Struttura Database
- `users`: Anagrafica utenti, credenziali (plain text), avatar, tracking notifiche.
- `posts`: Contenuti (testo/URL media), metadati, counter like denormalizzato.
- `likes`: Relazione molti-a-molti tra utenti e post per tracciamento voti singoli.
