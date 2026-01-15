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
      
      <section style="margin-bottom: 3rem;">
        <article class="publish-card">
          <header><strong class="prompt">NUOVO POST</strong></header>
          <textarea [(ngModel)]="newPost" placeholder="Cosa stai pensando?" [disabled]="publishing"
                    style="min-height: 80px; resize: none; margin-bottom: 0.5rem; border-radius: 0;"></textarea>
          
          <div *ngIf="selectedImage" style="position: relative; margin-bottom: 1rem;">
            <img [src]="selectedImage" style="max-height: 200px; width: 100%; object-fit: cover; border: 1px solid var(--border-color);">
            <button (click)="selectedImage = null" class="outline contrast" 
                    style="position: absolute; top: 5px; right: 5px; width: auto; padding: 2px 8px; font-size: 0.6rem; background: rgba(0,0,0,0.8);">X</button>
          </div>

          <footer style="display: flex; justify-content: space-between; align-items: center; padding-top: 0;">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none;">
            <button class="outline secondary" (click)="fileInput.click()" [disabled]="publishing"
                    style="width: auto; padding: 4px 12px; font-size: 0.75rem; margin: 0;">FOTO</button>
            <button (click)="publish(user)" [disabled]="publishing || (!newPost.trim() && !selectedImage)" 
                    style="width: auto; padding: 4px 16px; font-size: 0.75rem; margin: 0;">
              {{ publishing ? 'INVIO...' : 'PUBBLICA' }}
            </button>
          </footer>
        </article>
      </section>

      <div *ngIf="error" class="error-msg">
        <article>
          <p><strong class="prompt">ERRORE DI SISTEMA</strong></p>
          <p>{{ error }}</p>
          <button class="outline" (click)="retry()">RIPROVA CONNESSIONE</button>
        </article>
      </div>

      <div *ngIf="posts$ | async as posts; else loadingState">
        <div class="feed-grid">
          <article *ngFor="let post of posts" class="post-card">
            <header style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1rem;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img [src]="post.photoURL || 'https://ui-avatars.com/api/?name=' + post.displayName + '&background=random'" 
                     style="width: 32px; height: 32px; border-radius: 0; object-fit: cover; border: 1px solid var(--border-color);">
                <div>
                  <strong style="display: block; font-size: 0.9rem;">{{ post.displayName }}</strong>
                  <small style="opacity: 0.5; font-size: 0.7rem;">{{ post.date | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </div>
              <button class="outline contrast" *ngIf="post.uid === user.uid" 
                      (click)="deletePost(post.id, post.uid, user.uid)" 
                      style="width: auto; margin: 0; padding: 2px 8px; font-size: 0.7rem; border-color: #ff4444; color: #ff4444;">
                ELIMINA
              </button>
            </header>
            
            <div *ngIf="post.imageUrl" style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); overflow: hidden; cursor: pointer;" (click)="openLightbox(post.imageUrl)">
              <img [src]="post.imageUrl" style="width: 100%; max-height: 400px; object-fit: cover;">
            </div>

            <div style="padding: 1rem;">
              <p style="white-space: pre-wrap; margin: 0; font-size: 0.95rem; border-left: 1px solid var(--border-color); padding-left: 1rem;">{{ post.text }}</p>
            </div>
          </article>
        </div>

        <article *ngIf="posts.length === 0" style="text-align: center; border: 1px dashed var(--border-color);">
          <p class="secondary" style="font-size: 0.85rem;">Nessun post trovato nel database.</p>
        </article>
      </div>

      <ng-template #loadingState>
        <article *ngIf="!error" aria-busy="true" style="text-align: center; border: none; box-shadow: none;">
          <span class="cursor">CARICAMENTO FEED...</span>
        </article>
      </ng-template>

    </div>

    <!-- Lightbox -->
    <div *ngIf="lightboxImage" class="lightbox-overlay" (click)="lightboxImage = null">
      <div class="lightbox-content" (click)="$event.stopPropagation()">
        <img [src]="lightboxImage">
        <button (click)="lightboxImage = null" class="lightbox-close">CHIUDI</button>
      </div>
    </div>
  `,
  styles: [`
    .publish-card { border: 1px solid var(--primary); }
    .post-card { transition: transform 0.2s ease; margin-bottom: 1.5rem; border: 1px solid var(--border-color); }
    .post-card:hover { transform: translateY(-2px); }
    .dropdown { margin: 0; }
    summary::after { content: none; }
    .feed-grid { display: flex; flex-direction: column; gap: 1rem; }
    .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .lightbox-content { position: relative; max-width: 90%; max-height: 90%; }
    .lightbox-content img { max-width: 100%; max-height: 90vh; border: 1px solid var(--text-color); }
    .lightbox-close { position: absolute; top: -40px; right: 0; background: var(--text-color); color: var(--background-color); border: none; padding: 4px 12px; cursor: pointer; font-size: 0.8rem; font-family: var(--font-family); }
  `]
})
export class FeedComponent {
  socialService = inject(SocialService);
  error: string | null = null;
  lightboxImage: string | null = null;
  
  posts$ = this.socialService.getFeedPosts().pipe(
    tap(() => this.error = null),
    catchError(err => {
      console.error('Feed error:', err);
      this.error = err.message || 'Errore sconosciuto di Firebase';
      return of([]);
    })
  );
  
  newPost = '';
  selectedImage: string | null = null;
  publishing = false;

  /** Apre l'immagine a schermo intero */
  openLightbox(url: string) {
    this.lightboxImage = url;
  }

  /** Ricarica la pagina in caso di errore */
  retry() {
    window.location.reload();
  }

  /** Processa l'immagine selezionata ridimensionandola e comprimendola in Base64 */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedImage = await this.socialService.processImage(file, 800, 800);
  }

  removeImage() {
    this.selectedImage = null;
  }

  /** Elimina un post se l'utente ne è il proprietario */
  async deletePost(id: string, postUid: string, currentUserUid: string) {
    if (postUid !== currentUserUid) {
      alert("Non puoi eliminare post di altri utenti.");
      return;
    }
    
    if (confirm("Sei sicuro di voler eliminare questo post?")) {
      try {
        await this.socialService.deletePost(id, currentUserUid);
      } catch (e) {
        alert("Errore durante l'eliminazione.");
      }
    }
  }

  /** Gestisce la pubblicazione di un nuovo post */
  async publish(user: any) {
    if (!this.newPost.trim() && !this.selectedImage) return;
    
    this.publishing = true;
    try {
      await this.socialService.addPost(this.newPost, user, this.selectedImage || undefined);
      this.newPost = '';
      this.selectedImage = null;
    } catch (e) {
      alert("Errore durante la pubblicazione.");
    } finally {
      this.publishing = false;
    }
  }
}