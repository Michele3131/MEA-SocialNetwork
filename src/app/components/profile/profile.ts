import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SocialService } from '../../services/social';
import { NotificationService } from '../../services/notification';
import { PublishComponent } from '../publish/publish';
import { LightboxComponent } from '../lightbox/lightbox';
import { LoadingComponent } from '../loading/loading';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

/**
 * Componente per la gestione del profilo utente con caricamento paginato dei post.
 * Consente la visualizzazione dei propri post e la modifica delle informazioni personali.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublishComponent, LightboxComponent, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  /** Servizio per la gestione dei dati social */
  socialService = inject(SocialService);
  /** Servizio per la gestione dei feedback toast */
  notificationService = inject(NotificationService);
  /** Servizio router */
  router = inject(Router);

  /** Lista dei post dell'utente caricati */
  posts: any[] = [];
  /** Stato di caricamento dei post */
  loadingPosts = false;
  /** Flag per indicare se sono stati caricati tutti i post dell'utente */
  allLoaded = false;
  /** URL dell'immagine attualmente visualizzata nel lightbox */
  lightboxImage: string | null = null;
  /** Eventuale errore nel caricamento dei post */
  error: string | null = null;
  
  /** Stato di modifica del nome utente */
  editingName = false;
  /** Buffer temporaneo per il nuovo nome utente */
  tempName = '';
  
  /** Stato corrente del tema (true se dark) */
  isDarkMode = false;

  /** Cursore per la paginazione Firestore */
  private lastVisible: QueryDocumentSnapshot | null = null;
  /** Dimensione del lotto di caricamento */
  private readonly pageSize = 9;
  /** Sottoscrizione allo stato utente */
  private userSub: Subscription | null = null;
  /** UID dell'utente corrente */
  private currentUid: string | null = null;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }

  ngOnInit() {
    // Ci sottoscriviamo all'utente per caricare i post non appena l'UID è disponibile
    this.userSub = this.socialService.user$.subscribe(user => {
      if (user && user.uid !== this.currentUid) {
        this.currentUid = user.uid;
        this.resetAndLoadPosts();
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
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

  /** Reset della lista e caricamento iniziale dei post */
  async resetAndLoadPosts() {
    if (!this.currentUid) return;
    
    this.posts = [];
    this.lastVisible = null;
    this.allLoaded = false;
    this.error = null;
    
    await this.loadMore();
  }

  async loadMore() {
    if (!this.currentUid || this.loadingPosts || this.allLoaded) return;

    this.loadingPosts = true;
    try {
      console.log('--- Caricamento Altri Post Profilo ---');
      console.log('Cursore attuale:', this.lastVisible ? this.lastVisible.id : 'NESSUNO');

      const result = await this.socialService.getMyPostsPaginated(this.currentUid, this.pageSize, this.lastVisible);
      
      console.log('Risultato query profilo:', result.posts.length, 'post ricevuti');

      if (result.posts.length === 0) {
        this.allLoaded = true;
        console.log('Fine dei post profilo raggiunta (0 post)');
      } else {
        this.posts = [...this.posts, ...result.posts];
        this.lastVisible = result.lastVisible;
        console.log('Nuovo totale post profilo:', this.posts.length);
        console.log('Nuovo cursore profilo:', this.lastVisible ? this.lastVisible.id : 'NULL');

        if (result.posts.length < this.pageSize) {
          this.allLoaded = true;
          console.log('Fine dei post profilo raggiunta (batch incompleto)');
        }
      }
    } catch (err: any) {
      console.error('Errore loadMore profilo:', err);
      this.error = "Impossibile caricare i post. " + (err.message || "");
      this.notificationService.error("Errore nel caricamento di altri post.");
    } finally {
      this.loadingPosts = false;
    }
  }

  /** Caricamento di un nuovo lotto di post dell'utente */

  /** Rimozione post previa conferma */
  async deletePost(id: string, postUid: string, currentUserUid: string) {
    if (confirm("Sei sicuro di voler eliminare questo post?")) {
      try {
        await this.socialService.deletePost(id, postUid, currentUserUid);
        this.notificationService.success("Post eliminato.");
      } catch (e: any) {
        this.notificationService.error(e.message || "Errore durante l'eliminazione.");
      }
    }
  }

  /** Visualizzazione immagine in overlay (Lightbox) */
  openLightbox(url: string) {
    this.lightboxImage = url;
  }

  /** --- Logica Profilo (Ripristinata) --- */

  /** Gestione selezione file per aggiornamento foto profilo */
  async onProfileFileSelected(event: any, user: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limite 1MB per base64 performance
        this.notificationService.show('Immagine troppo grande (max 1MB)', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          await this.socialService.updateProfileImage(user, e.target.result);
          this.notificationService.show('Foto profilo aggiornata', 'success');
        } catch (err) {
          this.notificationService.show('Errore durante l\'aggiornamento foto', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /** Attivazione modalità edit per il displayName */
  startEditingName(currentName: string) {
    this.tempName = currentName;
    this.editingName = true;
  }

  /** Salvataggio persistente del nuovo displayName */
  async saveName(user: any) {
    if (this.tempName.trim() && this.tempName !== user.displayName) {
      try {
        await this.socialService.updateDisplayName(user, this.tempName);
        this.notificationService.show('Nome aggiornato correttamente', 'success');
        this.editingName = false;
      } catch (err) {
        this.notificationService.show('Errore durante l\'aggiornamento nome', 'error');
      }
    } else {
      this.editingName = false;
    }
  }
}