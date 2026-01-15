import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService } from '../../services/social';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" *ngIf="socialService.user$ | async as user">
      <header style="margin-bottom: 2rem; text-align: center;">
        <img [src]="user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || user.email || 'U') + '&background=random'" 
             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); margin-bottom: 1rem;">
        <h2 style="margin: 0;">{{ user.displayName || 'Il tuo Profilo' }}</h2>
        <p class="secondary">{{ user.email }}</p>
      </header>

      <section>
        <h4 style="border-bottom: 1px solid var(--secondary); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">I tuoi Post</h4>
        
        <div *ngIf="myPosts$ | async as posts; else loading">
          <div class="posts-list">
            <article *ngFor="let post of posts" class="profile-post">
              <div class="post-content">
                <p style="white-space: pre-wrap; margin: 0;">{{ post.text }}</p>
                <small class="secondary">{{ post.date | date:'short' }}</small>
              </div>
              <button class="outline contrast" 
                      (click)="socialService.deletePost(post.id)" 
                      style="width: auto; margin: 0; padding: 4px 12px; font-size: 0.8rem;">
                Elimina
              </button>
            </article>
            
            <article *ngIf="posts.length === 0" style="text-align: center; border: 2px dashed var(--secondary);">
              <p class="secondary">Non hai ancora pubblicato nulla. Inizia ora dal Feed!</p>
            </article>
          </div>
        </div>

        <ng-template #loading>
          <p aria-busy="true" style="text-align: center;">Caricamento post...</p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .profile-post { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .post-content { flex: 1; }
    .posts-list { display: flex; flex-direction: column; }
  `]
})
export class ProfileComponent {
  socialService = inject(SocialService);
  
  // Trick avanzato: aspettiamo che l'utente sia caricato per chiedere i SUOI post
  myPosts$ = this.socialService.user$.pipe(
    switchMap(user => user ? this.socialService.getMyPosts(user.uid) : of([]))
  );
}