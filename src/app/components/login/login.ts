import { Component, inject } from '@angular/core';
import { SocialService } from '../../services/social';
import { NotificationService } from '../../services/notification';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente per la gestione dell'accesso e della registrazione utente.
 * Implementa la logica di autenticazione tramite Firebase Auth.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  /** Servizio per le operazioni di autenticazione */
  socialService = inject(SocialService);
  /** Servizio per la gestione delle notifiche toast */
  notificationService = inject(NotificationService);
  /** Servizio per la navigazione tra le rotte */
  router = inject(Router);

  /** Flag per switch tra modalità Login e Registrazione */
  isRegister = false;
  /** Campo email del form */
  email = '';
  /** Campo password del form */
  password = '';
  /** Campo nome (solo per registrazione) */
  name = '';
  /** Stato di caricamento durante l'azione asincrona */
  loading = false;
  /** Messaggio di errore da visualizzare */
  error = '';

  /** Procedura di autenticazione: Login o Registrazione */
  async authAction() {
    this.loading = true;
    this.error = '';
    try {
      if (this.isRegister) {
        await this.socialService.registerWithEmail(this.email, this.password, this.name);
        this.notificationService.success("Registrazione completata!");
      } else {
        await this.socialService.loginWithEmail(this.email, this.password);
        this.notificationService.success("Bentornato!");
      }
      this.router.navigate(['/feed']);
    } catch (err: any) {
      this.error = "Errore: " + err.message;
      this.notificationService.error(this.error);
    } finally {
      this.loading = false;
    }
  }
}