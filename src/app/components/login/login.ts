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
    <div class="container" style="max-width: 400px; margin-top: 50px;">
      <article>
        <h2 style="text-align: center;">{{ isRegister ? 'Registrati' : 'Accedi' }}</h2>
        
        <form (submit)="$event.preventDefault(); authAction()">
          <label *ngIf="isRegister">
            Nome completo
            <input type="text" [(ngModel)]="name" name="name" required>
          </label>
          
          <label>
            Email
            <input type="email" [(ngModel)]="email" name="email" required>
          </label>
          
          <label>
            Password
            <input type="password" [(ngModel)]="password" name="password" required>
          </label>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Attendere...' : (isRegister ? 'Crea account' : 'Accedi') }}
          </button>
        </form>

        <p style="text-align: center;">
          <a href="javascript:void(0)" (click)="isRegister = !isRegister">
            {{ isRegister ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati' }}
          </a>
        </p>

        <hr>

        <button class="secondary outline" (click)="loginWithGoogle()" [disabled]="loading">
          Accedi con Google
        </button>
        
        <p *ngIf="error" style="color: red; text-align: center; margin-top: 10px;">{{ error }}</p>
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