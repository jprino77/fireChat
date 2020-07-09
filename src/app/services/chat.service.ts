import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chats: Mensaje[] = [];
  public usuario: any = {};

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  constructor(private db: AngularFirestore, public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    });
  }

  login(proveedor: string) {

    if (proveedor === 'google'){
      this.afAuth.signInWithPopup(new auth.GoogleAuthProvider()).then(
        (resp) => {
          console.log(resp)
        }

      );
    } else {
      this.afAuth.signInWithPopup(new auth.TwitterAuthProvider());

    }
  }

  logout() {
    this.usuario = {};
    this.afAuth.signOut();
  }

  cargarMensajes() {
    this.itemsCollection = this.db.collection<Mensaje>('mensajes', ref =>
      ref.orderBy('fecha', 'desc').limit(5)
    );
    // Value changes es que hace que este observando los cambios
    return this.itemsCollection.valueChanges().pipe(
      map((mensajes: Mensaje[]) => {
        this.chats = [];
        for (const mensaje of mensajes) {
          // pone siempre en primer lugar mensaje
          this.chats.unshift(mensaje);
        }
        return this.chats;
      })
    );
  }

  agregarMensaje(texto: string) {
    const mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    };

    return this.itemsCollection.add(mensaje);
  }
}
