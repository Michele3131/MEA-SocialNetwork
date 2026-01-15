import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../services/social';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" *ngIf="socialService.user$ | async as user">
      <header style="margin-bottom: 2rem; text-align: center; position: relative;">
        <!-- Foto profilo: l'opzione EDIT è visibile solo al proprietario -->
        <div style="display: inline-block; position: relative;" [style.cursor]="'pointer'" (click)="profileInput.click()">
          <img [src]="user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || user.email || 'U') + '&background=random'" 
               style="width: 120px; height: 120px; border-radius: 0; object-fit: cover; border: 2px solid var(--text-color); margin-bottom: 1rem;">
          <div style="position: absolute; bottom: 15px; right: 0; background: var(--text-color); color: var(--background-color); padding: 2px 6px; font-size: 0.6rem; font-weight: bold;">EDIT</div>
        </div>
        <input type="file" #profileInput (change)="onProfileFileSelected($event, user)" accept="image/*" style="display: none;">
        
        <h2 style="margin: 0;">{{ user.displayName || 'Utente' }}</h2>
        <p class="secondary" style="font-size: 0.8rem;">{{ user.email }}</p>
      </header>

      <!-- Sezione pubblicazione: visibile solo se è il proprio profilo -->
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

      <section>
        <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem;" class="prompt">I TUOI POST</h4>
        
        <div *ngIf="myPosts$ | async as posts; else loading">
          <div class="posts-list">
            <article *ngFor="let post of posts" class="profile-post">
              <div class="post-content">
                <div *ngIf="post.imageUrl" style="margin-bottom: 1rem; border: 1px solid var(--border-color); cursor: pointer;" (click)="openLightbox(post.imageUrl)">
                  <img [src]="post.imageUrl" style="width: 100%; max-height: 250px; object-fit: cover;">
                </div>
                <p style="white-space: pre-wrap; margin: 0; border-left: 1px solid var(--border-color); padding-left: 1rem;">{{ post.text }}</p>
                <small style="opacity: 0.5; font-size: 0.7rem; display: block; margin-top: 0.5rem;">POST_ID: {{ post.id.substring(0,8) }} | {{ post.date | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <!-- Bottone ELIMINA: visibile solo se il post appartiene all'utente loggato -->
              <button *ngIf="post.uid === user.uid" class="outline contrast" (click)="deletePost(post.id, post.uid, user.uid)" style="width: auto; margin: 0; padding: 2px 8px; font-size: 0.7rem;">ELIMINA</button>
            </article>
            <article *ngIf="posts.length === 0" style="text-align: center; border: 1px dashed var(--border-color);"><p class="secondary" style="font-size: 0.85rem;">Nessun post pubblicato.</p></article>
          </div>
        </div>
        <ng-template #loading><p aria-busy="true" style="text-align: center;" class="cursor">CARICAMENTO...</p></ng-template>
      </section>
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
    .publish-card { border: 1px solid var(--border-color); padding: 1rem; margin-bottom: 1rem; }
    .profile-post { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); }
    .post-content { flex: 1; }
    .posts-list { display: flex; flex-direction: column; }
    .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .lightbox-content { position: relative; max-width: 90%; max-height: 90%; }
    .lightbox-content img { max-width: 100%; max-height: 90vh; border: 1px solid var(--text-color); }
    .lightbox-close { position: absolute; top: -40px; right: 0; background: var(--text-color); color: var(--background-color); border: none; padding: 4px 12px; cursor: pointer; font-size: 0.8rem; font-family: var(--font-family); }
  `]
})
export class ProfileComponent {
  socialService = inject(SocialService);
  newPost = '';
  selectedImage: string | null = null;
  publishing = false;
  lightboxImage: string | null = null;
  
  myPosts$ = this.socialService.user$.pipe(
    switchMap(user => user ? this.socialService.getMyPosts(user.uid) : of([]))
  );

  /** Gestisce l'aggiornamento della foto profilo dell'utente */
  async onProfileFileSelected(event: any, user: any) {
    const file = event.target.files[0];
    if (!file) return;
    const base64 = await this.socialService.processImage(file, 200, 200);
    try {
      await this.socialService.updateProfileImage(user, base64);
      alert("Foto profilo aggiornata!");
    } catch (e) {
      alert("Errore durante l'aggiornamento della foto.");
    }
  }

  /** Gestisce la selezione di un'immagine per un nuovo post */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedImage = await this.socialService.processImage(file, 800, 800);
  }

  /** Gestisce la pubblicazione di un nuovo post dal profilo */
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

  /** Apre l'immagine a schermo intero */
  openLightbox(url: string) {
    this.lightboxImage = url;
  }
}