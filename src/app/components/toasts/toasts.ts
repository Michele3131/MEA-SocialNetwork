import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';

/**
 * Componente per la visualizzazione globale delle notifiche toast.
 * Si interfaccia con NotificationService per gestire la coda dei messaggi.
 */
@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.css'
})
export class ToastsComponent {
  /** Servizio per l'accesso allo stato delle notifiche */
  notificationService = inject(NotificationService);
}
