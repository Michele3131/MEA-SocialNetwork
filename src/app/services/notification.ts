import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interfaccia rappresentante una singola notifica toast.
 */
export interface Toast {
  /** Identificativo univoco della notifica */
  id: number;
  /** Testo del messaggio da visualizzare */
  message: string;
  /** Tipologia di notifica per la formattazione CSS */
  type: 'success' | 'error' | 'info';
}

/**
 * Servizio centralizzato per la gestione delle notifiche push-style (toast).
 * Fornisce metodi per aggiungere e rimuovere notifiche dallo stato globale.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Soggetto reattivo per la gestione dell'elenco delle notifiche attive */
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  /** Observable per il monitoraggio esterno dell'elenco delle notifiche */
  toasts$ = this.toastsSubject.asObservable();
  /** Contatore interno per la generazione di ID univoci */
  private counter = 0;

  /**
   * Visualizza una nuova notifica toast.
   * @param message Testo del messaggio.
   * @param type Tipologia di notifica (default: 'info').
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.counter++;
    const toast: Toast = { id, message, type };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    // Rimozione automatica dopo 4000ms per migliorare l'esperienza utente
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  /** Scorciatoia per notifiche di successo */
  success(message: string) {
    this.show(message, 'success');
  }

  /** Scorciatoia per notifiche di errore */
  error(message: string) {
    this.show(message, 'error');
  }

  /** Scorciatoia per notifiche informative */
  info(message: string) {
    this.show(message, 'info');
  }

  /**
   * Rimuove una notifica specifica dall'elenco.
   * @param id Identificativo della notifica da rimuovere.
   */
  remove(id: number) {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}
