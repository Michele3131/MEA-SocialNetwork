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
             style="width: 100px; height: 100px; border-radius: 0; object-fit: cover; border: 1px solid var(--text-color); margin-bottom: 1rem;">
        <h2 style="margin: 0;">{{ user.displayName || 'Utente' }}</h2>
        <p class="secondary" style="font-size: 0.8rem;">{{ user.email }}</p>
      </header>

      <section>
        <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;" class="prompt">I TUOI POST</h4>
        
        <div *ngIf="myPosts$ | async as posts; else loading">
          <div class="posts-list">
            <article *ngFor="let post of posts" class="profile-post">
              <div class="post-content">
                <p style="white-space: pre-wrap; margin: 0; border-left: 1px solid var(--border-color); padding-left: 1rem;">{{ post.text }}</p>
                <small style="opacity: 0.5; font-size: 0.7rem; display: block; margin-top: 0.5rem;">POST_ID: {{ post.id.substring(0,8) }} | {{ post.date | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <button class="outline contrast" 
                      (click)="socialService.deletePost(post.id)" 
                      style="width: auto; margin: 0; padding: 2px 8px; font-size: 0.7rem;">
                ELIMINA
              </button>
            </article>
            
            <article *ngIf="posts.length === 0" style="text-align: center; border: 1px dashed var(--border-color);">
              <p class="secondary" style="font-size: 0.85rem;">Non hai ancora pubblicato nulla.</p>
            </article>
          </div>
        </div>

        <ng-template #loading>
          <p aria-busy="true" style="text-align: center;" class="cursor">CARICAMENTO IN CORSO...</p>
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