import { Injectable, inject } from '@angular/core';
import { Auth, signOut, authState, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, query, orderBy, where, setDoc, docData, limit, startAfter, getDocs, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable, of, switchMap, map, firstValueFrom, take, shareReplay } from 'rxjs';

/**
 * Servizio core per la gestione delle funzionalità social e l'integrazione con Firebase.
 * Gestisce autenticazione, persistenza su Firestore e processamento immagini lato client.
 */
@Injectable({ providedIn: 'root' })
export class SocialService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /** Observable dello stato di autenticazione dell'utente con condivisione dello stato */
  user$: Observable<User | null> = authState(this.auth).pipe(
    shareReplay(1)
  );

  /**
   * Stream dei dati profilo utente sincronizzato tra Firebase Auth e Firestore.
   * Utilizza shareReplay per evitare molteplici sottoscrizioni a Firestore.
   */
  userProfile$: Observable<any> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      const userRef = doc(this.firestore, 'users', user.uid);
      return docData(userRef).pipe(
        map((firestoreData: any) => {
          if (!firestoreData) {
            return {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'Utente',
              photoURL: user.photoURL
            };
          }
          return {
            uid: user.uid,
            email: user.email,
            displayName: firestoreData.displayName || user.displayName || user.email?.split('@')[0] || 'Utente',
            photoURL: firestoreData.photoURL || user.photoURL
          };
        })
      );
    }),
    shareReplay(1)
  );

  /** Registrazione nuovo utente tramite email, password e displayName */
  async registerWithEmail(email: string, pass: string, name: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(credential.user, { displayName: name });
    // Sincronizzazione profilo Firestore integrata nell'operazione di registrazione
    const userRef = doc(this.firestore, 'users', credential.user.uid);
    await setDoc(userRef, {
      uid: credential.user.uid,
      displayName: name,
      email: credential.user.email,
    }, { merge: true });
    return credential;
  }

  /** Autenticazione utente tramite credenziali email/password */
  async loginWithEmail(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  /** Aggiornamento displayName utente su Auth e Firestore */
  async updateDisplayName(user: User, newName: string) {
    try {
      await updateProfile(user, { displayName: newName });
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, { displayName: newName }, { merge: true });
    } catch (error) {
      console.error('Errore updateDisplayName:', error);
      throw error;
    }
  }

  /** Terminazione sessione utente */
  logout() {
    return signOut(this.auth);
  }

  /** Aggiornamento URL foto profilo su Firestore */
  async updateProfileImage(user: User, base64Image: string) {
    try {
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, { photoURL: base64Image }, { merge: true });
    } catch (error) {
      console.error('Errore updateProfileImage:', error);
      throw error;
    }
  }

  /** 
   * Recupero paginato dei post per il feed.
   * @param pageSize Numero di post da recuperare
   * @param lastDoc L'ultimo documento della pagina precedente per il cursore
   */
  async getFeedPostsPaginated(pageSize: number, lastDoc: QueryDocumentSnapshot | null = null) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      let q;
      if (lastDoc) {
        q = query(postsRef, orderBy('date', 'desc'), startAfter(lastDoc), limit(pageSize));
      } else {
        q = query(postsRef, orderBy('date', 'desc'), limit(pageSize));
      }
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      return { posts, lastVisible };
    } catch (error) {
      console.error('Errore getFeedPostsPaginated:', error);
      throw error;
    }
  }

  /** Recupero stream dei post ordinati per data decrescente (Versione Real-time completa) */
  getFeedPosts() {
    try {
      const postsRef = collection(this.firestore, 'posts');
      const q = query(postsRef, orderBy('date', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('Errore getFeedPosts:', error);
      throw error;
    }
  }

  /** 
   * Recupero paginato dei post di un utente specifico.
   * @param uid UID dell'utente
   * @param pageSize Numero di post da recuperare
   * @param lastDoc L'ultimo documento della pagina precedente
   */
  async getMyPostsPaginated(uid: string, pageSize: number, lastDoc: QueryDocumentSnapshot | null = null) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      let q;
      // NOTA: Richiede indice composito (uid ASC, date DESC) su Firestore.
      // Se l'indice manca, usiamo una versione semplificata o gestiamo l'errore.
      if (lastDoc) {
        q = query(postsRef, where('uid', '==', uid), orderBy('date', 'desc'), startAfter(lastDoc), limit(pageSize));
      } else {
        q = query(postsRef, where('uid', '==', uid), orderBy('date', 'desc'), limit(pageSize));
      }
      
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      return { posts, lastVisible };
    } catch (error: any) {
      console.error('Errore getMyPostsPaginated:', error);
      // Se l'errore è dovuto alla mancanza dell'indice, potremmo volerlo segnalare o degradare graziosamente.
      throw error;
    }
  }

  /** Recupero post filtrati per UID utente (Versione Real-time completa) */
  getMyPosts(uid: string) {
    try {
      const postsRef = collection(this.firestore, 'posts');
      // NOTA: La combinazione di 'where' e 'orderBy' richiede un indice composito su Firestore.
      // Se l'indice non è presente, la query fallirà. Per ora usiamo solo 'where' per debug.
      const q = query(postsRef, where('uid', '==', uid));
      return collectionData(q, { idField: 'id' }).pipe(
        // Ordiniamo lato client se l'indice Firestore non è ancora pronto
        map(posts => posts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      ) as Observable<any[]>;
    } catch (error) {
      console.error('Errore getMyPosts:', error);
      throw error;
    }
  }

  /** Creazione nuovo documento post in Firestore con arricchimento dati profilo */
  async addPost(text: string, imageUrl?: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Utente non autenticato");

    try {
      const postsRef = collection(this.firestore, 'posts');
      
      // Recupero dati profilo più aggiornati da Firestore (es. photoURL ad alta qualità)
      const userRef = doc(this.firestore, 'users', user.uid);
      const firestoreData = await firstValueFrom(docData(userRef).pipe(take(1)));

      const newPost = {
        text: text,
        imageUrl: imageUrl || null,
        uid: user.uid,
        displayName: (firestoreData as any)?.displayName || user.displayName || user.email?.split('@')[0] || 'Utente Anonimo',
        photoURL: (firestoreData as any)?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email || 'U'}&background=random`,
        date: Date.now()
      };
      await addDoc(postsRef, newPost);
    } catch (error) {
      console.error('Errore addPost:', error);
      throw error;
    }
  }

  /** Eliminazione post da Firestore con validazione autorizzazione lato client */
  async deletePost(id: string, postUid: string, currentUserUid: string) {
    if (postUid !== currentUserUid) {
      throw new Error("Autorizzazione negata: non sei il proprietario del post.");
    }
    
    try {
      const docRef = doc(this.firestore, 'posts', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Errore deletePost:', error);
      throw error;
    }
  }

  /** Elaborazione immagine: ridimensionamento e compressione in formato Base64 JPEG */
  processImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> {
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
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}