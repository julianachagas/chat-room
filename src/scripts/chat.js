// interacting with the database
import { initializeApp } from 'firebase/app';
import {
  collection,
  getFirestore,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';

import { firebaseConfig } from './firebase-config';

initializeApp(firebaseConfig);

const db = getFirestore();

export default class Chatroom {
  constructor(room, username) {
    this.room = room;
    this.username = username;
    this.chats = collection(db, 'chats');
    this.unsub = '';
  }

  async addChat(message) {
    const chat = {
      message,
      username: this.username,
      room: this.room,
      createdAt: Timestamp.fromDate(new Date())
    };
    const response = await addDoc(this.chats, chat);
    return response;
  }

  getChats(callback) {
    // get the chats of a specific chat room
    const q = query(
      this.chats,
      where('room', '==', this.room),
      orderBy('createdAt')
    );
    this.unsub = onSnapshot(q, snapshot => {
      // get the documents changed
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          // updateUI, change.doc.data() is an object
          callback(change.doc.data());
        }
      });
    });
  }

  updateName(username) {
    this.username = username;
    localStorage.setItem('username', username);
    return this;
  }

  updateRoom(room) {
    this.room = room;
    // unsubscribe to the current listener:
    if (this.unsub) this.unsub();
    return this;
  }
}
