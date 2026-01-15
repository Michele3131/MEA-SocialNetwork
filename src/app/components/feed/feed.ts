import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante per i form
import { SocialService } from '../../services/social';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" *ngIf="socialService.user$ | async as user">
      
      <article class="publish-card">
        <header>
          <strong>Crea un nuovo post</strong>
        </header>
        <textarea [(ngModel)]="newPost" 
                  placeholder="A cosa stai pensando?" 
                  [disabled]="publishing"
                  style="min-height: 120px; resize: none; border-radius: 8px; margin-bottom: 1rem;"></textarea>
        <footer style="display: flex; justify-content: flex-end; padding-top: 0;">
          <button (click)="publish(user)" 
                  [disabled]="publishing" 
                  style="width: auto; padding: 8px 32px;">
            {{ publishing ? 'Pubblicazione...' : 'Pubblica' }}
          </button>
        </footer>
      </article>

      <div *ngIf="error" class="error-msg">
        <article style="border: 2px solid var(--del-color);">
          <p style="color: var(--del-color);"><strong>⚠️ Errore nel caricamento del feed</strong></p>
          <p>{{ error }}</p>
          <button class="outline" (click)="retry()">Riprova</button>
        </article>
      </div>

      <div *ngIf="posts$ | async as posts; else loadingState">
        <div class="feed-grid">
          <article *ngFor="let post of posts" class="post-card">
            <header style="display: flex; align-items: center; justify-content: space-between; padding: 1rem;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img [src]="post.photoURL || 'https://ui-avatars.com/api/?name=' + post.displayName + '&background=random'" 
                     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                  <strong style="display: block;">{{ post.displayName }}</strong>
                  <small class="secondary">{{ post.date | date:'short' }}</small>
                </div>
              </div>
              <details class="dropdown" *ngIf="post.uid === user.uid">
                <summary class="outline secondary" style="border: none; padding: 0 8px;">⋮</summary>
                <ul>
                  <li><a href="javascript:void(0)" (click)="socialService.deletePost(post.id)" style="color: var(--del-color);">Elimina post</a></li>
                </ul>
              </details>
            </header>
            <div style="padding: 0 1rem 1rem;">
              <p style="white-space: pre-wrap; margin: 0; font-size: 1.1rem;">{{ post.text }}</p>
            </div>
          </article>
        </div>

        <article *ngIf="posts.length === 0" style="text-align: center; border: 2px dashed var(--secondary);">
          <p class="secondary">Ancora nessun post. Rompi il ghiaccio!</p>
        </article>
      </div>

      <ng-template #loadingState>
        <article *ngIf="!error" aria-busy="true" style="text-align: center; border: none; box-shadow: none;">
          Caricamento feed...
        </article>
      </ng-template>

    </div>
  `,
  styles: [`
    .publish-card { border: 1px solid var(--primary); }
    .post-card { transition: transform 0.2s ease; margin-bottom: 1.5rem; }
    .post-card:hover { transform: translateY(-2px); }
    .dropdown { margin: 0; }
    summary::after { content: none; }
    .feed-grid { display: flex; flex-direction: column; gap: 1rem; }
  `]
})
export class FeedComponent {
  socialService = inject(SocialService);
  error: string | null = null;
  
  posts$ = this.socialService.getFeedPosts().pipe(
    tap(() => this.error = null),
    catchError(err => {
      console.error('Feed error:', err);
      this.error = err.message || 'Errore sconosciuto di Firebase';
      return of([]);
    })
  );
  
  newPost = '';
  publishing = false;

  retry() {
    window.location.reload();
  }

  async publish(user: any) {
    if (!this.newPost.trim()) return;
    this.publishing = true;
    try {
      await this.socialService.addPost(this.newPost, user);
      this.newPost = '';
    } catch (error) {
      alert("Errore durante la pubblicazione. Controlla la console.");
    } finally {
      this.publishing = false;
    }
  }
}