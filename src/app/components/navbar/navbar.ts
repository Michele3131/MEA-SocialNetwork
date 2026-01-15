import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialService } from '../../services/social';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="nav-container">
      <nav class="container">
        <ul>
          <li><a routerLink="/" class="contrast" style="text-decoration: none;"><strong>MEA SOCIETAS</strong></a></li>
        </ul>
        <ul>
          <li *ngIf="socialService.user$ | async as user" style="display: flex; align-items: center; gap: 10px;">
            <img [src]="user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || user.email || 'U') + '&background=random'" 
                 style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
            <div class="user-info hide-on-mobile">
              <small style="display: block; line-height: 1;">{{ user.displayName || (user.email ? user.email.split('@')[0] : 'Utente') }}</small>
            </div>
          </li>
          <li><a routerLink="/feed" class="secondary">Feed</a></li>
          <li><a routerLink="/profile" class="secondary">Profilo</a></li>
          <li>
            <button class="outline secondary theme-toggle" (click)="toggleTheme()" style="padding: 4px 8px; margin: 0; border: none;">
              {{ isDarkMode ? '☀️' : '🌙' }}
            </button>
          </li>
          <li *ngIf="socialService.user$ | async">
            <button class="outline contrast" (click)="socialService.logout()" style="padding: 4px 12px; margin: 0;">Esci</button>
          </li>
          <li *ngIf="!(socialService.user$ | async)">
            <a routerLink="/login" role="button">Accedi</a>
          </li>
        </ul>
      </nav>
    </header>
  `,
  styles: [`
    .nav-container { margin-bottom: 2rem; }
    .theme-toggle { font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
    .theme-toggle:hover { transform: scale(1.1); }
    @media (max-width: 600px) { .hide-on-mobile { display: none; } }
  `]
})
export class NavbarComponent {
  socialService = inject(SocialService);
  isDarkMode = false;

  constructor() {
    // Carica il tema salvato o usa quello di sistema
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }
}