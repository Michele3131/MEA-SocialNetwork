import { Component, inject } from '@angular/core';
import { SocialService } from '../../services/social';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" style="max-width: 450px; margin-top: 50px;">
      <article>
        <header>
          <strong class="prompt">ACCESSO RICHIESTO</strong><span class="cursor"></span>
        </header>
        
        <form (submit)="$event.preventDefault(); authAction()">
          <label *ngIf="isRegister">
            <small style="opacity: 0.6;">[NOME COMPLETO]</small>
            <input type="text" [(ngModel)]="name" name="name" required placeholder="Mario Rossi">
          </label>
          
          <label>
            <small style="opacity: 0.6;">[EMAIL]</small>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="mario@esempio.it">
          </label>
          
          <label>
            <small style="opacity: 0.6;">[PASSWORD]</small>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="********">
          </label>

          <button type="submit" [disabled]="loading" style="width: 100%;">
            {{ loading ? 'VERIFICA IN CORSO...' : (isRegister ? 'REGISTRATI' : 'ACCEDI') }}
          </button>
        </form>

        <p style="text-align: center; font-size: 0.75rem;">
          <a href="javascript:void(0)" (click)="isRegister = !isRegister">
            {{ isRegister ? 'VAI ALL\'ACCESSO' : 'NON HAI UN ACCOUNT? REGISTRATI' }}
          </a>
        </p>

        <hr style="border-color: var(--border-color); opacity: 0.5;">

        <button class="secondary outline" (click)="loginWithGoogle()" [disabled]="loading" style="width: 100%; font-size: 0.75rem;">
          ACCEDI CON GOOGLE
        </button>
        
        <p *ngIf="error" style="color: #ff4444; text-align: center; margin-top: 10px; font-size: 0.75rem;">
          <strong class="prompt">ERRORE:</strong> {{ error }}
        </p>
      </article>
    </div>
  `
})
export class LoginComponent {
  socialService = inject(SocialService);
  router = inject(Router);

  isRegister = false;
  email = '';
  password = '';
  name = '';
  loading = false;
  error = '';

  async authAction() {
    this.loading = true;
    this.error = '';
    try {
      if (this.isRegister) {
        await this.socialService.registerWithEmail(this.email, this.password, this.name);
      } else {
        await this.socialService.loginWithEmail(this.email, this.password);
      }
      this.router.navigate(['/feed']);
    } catch (err: any) {
      this.error = "Errore: " + err.message;
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    this.error = '';
    try {
      await this.socialService.loginWithGoogle();
      this.router.navigate(['/feed']);
    } catch (err: any) {
      this.error = "Errore: " + err.message;
    } finally {
      this.loading = false;
    }
  }
}