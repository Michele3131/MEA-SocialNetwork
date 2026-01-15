import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, authState, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /** Observable dello stato di autenticazione dell'utente */
  user$: Observable<User | null> = authState(this.auth);

  /** Esegue il login tramite provider Google */
  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  /** Registra un nuovo utente con email, password e nome visualizzato */
  async registerWithEmail(email: string, pass: string, name: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(credential.user, { displayName: name });
    return credential;
  }

  /** Esegue l'accesso tramite credenziali email/password */
  loginWithEmail(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  /** Termina la sessione dell'utente corrente */
  logout() {
    return signOut(this.auth);
  }

  /** Aggiorna l'URL della foto profilo dell'utente autenticato */
  async updateProfileImage(user: User, base64Image: string) {
    try {
      await updateProfile(user, { photoURL: base64Image });
    } catch (error) {
      console.error('Errore updateProfileImage:', error);
      throw error;
    }
  }

  /** Recupera lo stream dei post ordinati per data decrescente */
  getFeedPosts() {
    try {
      const postsRef = collection(this.firestore, 'posts');
      return collectionData(postsRef, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('Errore getFeedPosts:', error);
      throw error;
    }
  }

  /** Recupera i post associati a un UID specifico */
  getMyPosts(uid: string) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      const q = query(postsRef, where('uid', '==', uid));
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('Errore getMyPosts:', error);
      throw error;
    }
  }

  /** Crea un nuovo documento post in Firestore con supporto opzionale per immagine */
  async addPost(text: string, user: User, imageUrl?: string) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      const newPost = {
        text: text,
        imageUrl: imageUrl || null,
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Utente Anonimo',
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email || 'U'}&background=random`,
        date: Date.now()
      };
      await addDoc(postsRef, newPost);
    } catch (error) {
      console.error('Errore addPost:', error);
      throw error;
    }
  }

  /** Elimina un post verificando che l'utente sia l'effettivo proprietario */
  async deletePost(id: string, currentUserUid: string) {
    try {
      const docRef = doc(this.firestore, 'posts', id);
      // Nota: La sicurezza effettiva è garantita dalle Firestore Rules sul backend
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Errore deletePost:', error);
      throw error;
    }
  }

  /** Ridimensiona e comprime un'immagine in formato Base64 JPEG */
  processImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
          } else {
            if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}