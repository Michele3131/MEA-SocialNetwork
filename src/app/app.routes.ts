import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { FeedComponent } from './components/feed/feed';
import { ProfileComponent } from './components/profile/profile';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// Redirezione degli utenti non autenticati alla rotta /login
const redirectLogin = () => redirectUnauthorizedTo(['/login']);

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // Rotte protette da AuthGuard
  { path: 'feed', component: FeedComponent, ...canActivate(redirectLogin) },
  { path: 'profile', component: ProfileComponent, ...canActivate(redirectLogin) }
];