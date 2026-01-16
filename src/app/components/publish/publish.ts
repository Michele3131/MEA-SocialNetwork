import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../services/social';
import { NotificationService } from '../../services/notification';

/**
 * Componente per la creazione e pubblicazione di nuovi post.
 * Gestisce l'input testuale e la selezione/ridimensionamento delle immagini.
 */
@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish.component.html',
  styleUrl: './publish.component.css'
})
export class PublishComponent {
  /** Servizio per le operazioni social e Firestore */
  socialService = inject(SocialService);
  /** Servizio per la gestione delle notifiche toast */
  notificationService = inject(NotificationService);

  /** Contenuto testuale del nuovo post */
  newPost = '';
  /** Stringa Base64 dell'immagine selezionata */
  selectedImage: string | null = null;
  /** Stato di pubblicazione in corso */
  publishing = false;

  /** Elaborazione immagine selezionata: ridimensionamento e compressione Base64 */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedImage = await this.socialService.processImage(file, 800, 800);
  }

  /** Reset dell'immagine selezionata */
  removeImage() {
    this.selectedImage = null;
  }

  /** Pubblicazione post */
  async publish() {
    if (!this.newPost.trim() && !this.selectedImage) return;
    
    this.publishing = true;
    try {
      await this.socialService.addPost(this.newPost, this.selectedImage || undefined);
      this.newPost = '';
      this.selectedImage = null;
      this.notificationService.success("Post pubblicato!");
    } catch (e) {
      this.notificationService.error("Errore durante la pubblicazione.");
    } finally {
      this.publishing = false;
    }
  }
}
