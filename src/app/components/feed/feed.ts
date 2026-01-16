import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../services/social';
import { NotificationService } from '../../services/notification';
import { PublishComponent } from '../publish/publish';
import { LightboxComponent } from '../lightbox/lightbox';
import { LoadingComponent } from '../loading/loading';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';

/**
 * Componente per la visualizzazione e gestione del feed principale con caricamento paginato.
 * Implementa l'infinite scroll per ottimizzare le performance e il consumo di dati.
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PublishComponent, LightboxComponent, LoadingComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  /** Servizio per l'accesso ai dati social */
  socialService = inject(SocialService);
  /** Servizio per la gestione dei feedback toast */
  notificationService = inject(NotificationService);
  
  /** Lista dei post caricati */
  posts: any[] = [];
  /** Stato di caricamento iniziale e dei nuovi lotti */
  loading = false;
  /** Flag per indicare se sono stati caricati tutti i post disponibili */
  allLoaded = false;
  /** Messaggio di errore per la visualizzazione all'utente */
  error: string | null = null;
  /** URL dell'immagine attualmente visualizzata nel lightbox */
  lightboxImage: string | null = null;
  
  /** Cursore per la paginazione Firestore */
  private lastVisible: QueryDocumentSnapshot | null = null;
  /** Dimensione del lotto di caricamento */
  private readonly pageSize = 9;

  ngOnInit() {
    this.loadInitialPosts();
  }

  /** Caricamento iniziale dei post */
  async loadInitialPosts() {
    this.loading = true;
    this.allLoaded = false;
    this.lastVisible = null;
    try {
      const result = await this.socialService.getFeedPostsPaginated(this.pageSize);
      this.posts = result.posts;
      this.lastVisible = result.lastVisible;
      
      console.log('Caricamento iniziale:', this.posts.length, 'post caricati. Prossimo cursore:', !!this.lastVisible);

      if (this.posts.length < this.pageSize) {
        this.allLoaded = true;
      }
    } catch (err: any) {
      console.error('Errore loadInitialPosts:', err);
      this.error = "Impossibile caricare il feed.";
      this.notificationService.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  /** Caricamento di un nuovo lotto di post */
  async loadMore() {
    if (this.loading || this.allLoaded) {
      console.warn('loadMore saltato:', { loading: this.loading, allLoaded: this.allLoaded });
      return;
    }

    this.loading = true;
    try {
      console.log('--- Caricamento Altri Post ---');
      console.log('Cursore attuale:', this.lastVisible ? this.lastVisible.id : 'NESSUNO');
      
      const result = await this.socialService.getFeedPostsPaginated(this.pageSize, this.lastVisible);
      
      console.log('Risultato query:', result.posts.length, 'post ricevuti');
      
      if (result.posts.length === 0) {
        this.allLoaded = true;
        console.log('Fine del feed raggiunta (0 post)');
      } else {
        this.posts = [...this.posts, ...result.posts];
        this.lastVisible = result.lastVisible;
        console.log('Nuovo totale post:', this.posts.length);
        console.log('Nuovo cursore:', this.lastVisible ? this.lastVisible.id : 'NULL');
        
        if (result.posts.length < this.pageSize) {
          this.allLoaded = true;
          console.log('Fine del feed raggiunta (batch incompleto)');
        }
      }
    } catch (err: any) {
      console.error('Errore loadMore:', err);
      this.notificationService.error("Errore nel caricamento di altri post.");
    } finally {
      this.loading = false;
    }
  }

  /** Visualizzazione immagine in overlay (Lightbox) */
  openLightbox(url: string) {
    this.lightboxImage = url;
  }

  /** Reload dell'applicazione in caso di errore critico */
  retry() {
    window.location.reload();
  }

  /** Rimozione post previa conferma */
  async deletePost(id: string, postUid: string, currentUserUid: string) {
    if (confirm("Sei sicuro di voler eliminare questo post?")) {
      try {
        await this.socialService.deletePost(id, postUid, currentUserUid);
        this.posts = this.posts.filter(p => p.id !== id);
        this.notificationService.success("Post eliminato.");
      } catch (e: any) {
        this.notificationService.error(e.message || "Errore durante l'eliminazione.");
      }
    }
  }
}