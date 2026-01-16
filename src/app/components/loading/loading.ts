import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente per la gestione dello stato di caricamento.
 * Implementa un'estetica terminal con prompt intermittente e animazione dei punti.
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  /** Messaggio da visualizzare durante il caricamento */
  @Input() message: string = 'CARICAMENTO';
}
