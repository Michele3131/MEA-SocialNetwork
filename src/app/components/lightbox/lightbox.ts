import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente per la visualizzazione di immagini a schermo intero (Lightbox).
 * Utilizza un overlay per focalizzare l'attenzione sull'immagine selezionata.
 */
@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css'
})
export class LightboxComponent {
  /** URL dell'immagine da visualizzare */
  @Input() imageUrl: string | null = null;
  /** Evento emesso alla chiusura del lightbox */
  @Output() close = new EventEmitter<void>();

  /** Gestisce la chiusura dell'overlay */
  onClose() {
    this.close.emit();
  }
}
