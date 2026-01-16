import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SocialService } from '../../services/social';
import { NotificationService } from '../../services/notification';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente per la barra laterale (ex navbar).
 * Gestisce la navigazione, il tema e la testata del profilo se attivo.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  /** Servizio per la gestione dello stato dell'utente */
  socialService = inject(SocialService);
  /** Servizio per la gestione dei feedback toast */
  notificationService = inject(NotificationService);
  /** Servizio router per rilevare la rotta corrente */
  router = inject(Router);

  /** Stato corrente del tema (true se dark) */
  isDarkMode = false;
  
  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }

  /** Verifica se l'utente si trova nella pagina profilo */
  isProfilePage(): boolean {
    return this.router.url === '/profile';
  }

  /** Inversione del tema corrente (Light/Dark) */
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  /** Applicazione attributo data-theme all'elemento radice */
  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }
}