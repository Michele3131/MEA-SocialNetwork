import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, authState, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Utente corrente (Observable)
  user$: Observable<User | null> = authState(this.auth);

  // Login con Google
  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  // Registrazione con Email
  async registerWithEmail(email: string, pass: string, name: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(credential.user, { displayName: name });
    return credential;
  }

  // Login con Email
  loginWithEmail(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Logout
  logout() {
    return signOut(this.auth);
  }

  // Ottieni tutti i post (Feed)
  getFeedPosts() {
    try {
      const postsRef = collection(this.firestore, 'posts');
      // Semplifichiamo per evitare problemi di indici
      return collectionData(postsRef, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('Errore getFeedPosts:', error);
      throw error;
    }
  }

  // Ottieni solo i miei post (Profilo)
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

  // Crea Post
  async addPost(text: string, user: User) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      const newPost = {
        text: text,
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Utente Anonimo',
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email || 'U'}&background=random`,
        date: Date.now()
      };
      console.log('Tentativo aggiunta post:', newPost);
      await addDoc(postsRef, newPost);
      console.log('Post aggiunto con successo');
    } catch (error) {
      console.error('Errore durante l\'aggiunta del post:', error);
      throw error;
    }
  }

  // Elimina Post
  async deletePost(id: string) {
    try {
      console.log('Tentativo eliminazione post con ID:', id);
      const docRef = doc(this.firestore, 'posts', id);
      await deleteDoc(docRef);
      console.log('Post eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione del post:', error);
      throw error;
    }
  }
}