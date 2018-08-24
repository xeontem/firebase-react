import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/messaging';
import 'firebase/storage';

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyBSCu-NSeP-YvaQD5qspSpo3DsOOZNTPpU',
  authDomain: 'first-38138.firebaseapp.com',
  databaseURL: 'https://first-38138.firebaseio.com',
  projectId: 'first-38138',
  storageBucket: 'first-38138.appspot.com',
  messagingSenderId: '359226284722'
};

class Firestore {
  constructor() {
    firebase.initializeApp(config);
    this.authState = firebase.auth();
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    this.msg = firebase.messaging();
    this.msg.usePublicVapidKey("BHM1YOIcKMbaCEx2wAnsP199DVEefoalyCH-mAazN_tiqSaQEyirTIO0UK_TKHPQAYFlm2qySYlEceGcwvTh85Y");
    this.msg.requestPermission().then(() => {
      return this.msg.getToken();
    }).then(currentToken => {
      this.subscribeForTopic(currentToken, 'TODOS');
    })
    // .then(x => console.log('Notification permission granted.'))
    .catch((err) => console.log('Unable to get permission to notify.', err));

    firebase.firestore().settings({ timestampsInSnapshots: true });
  }

  subscribe(cb) {
    return firebase.firestore().collection('todos')
      .onSnapshot(snapShot => cb(snapShot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
  }

  updateField(id, field, value) {
    return firebase.firestore().collection('todos').doc(id)
      .update({ [field]: value });
  }

  toggleDone(id, done) {
    firebase.firestore().collection('todos').doc(id).update({ done })
  }

  login() {
    return firebase.auth().signInWithPopup(this.provider).then(result => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // this.token = result.credential.accessToken;
      // The signed-in user info.
      return { displayName: result.user.displayName, photoURL: result.user.photoURL};
      // ...
    }).catch(error => {
      // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const email = error.email;
      // // The firebase.auth.AuthCredential type that was used.
      // const credential = error.credential;
      // ...
    });
  }

  logout() {
    return firebase.auth().signOut().then(() => {
      // this.user = null;
      return null;
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }

  backupTodos() {
    firebase.functions().httpsCallable('backupTodos')().then(function(result) {
      // Read result of the Cloud Function.
      // console.log(result)
    }).catch(function(error) {
      // Getting the Error details.
      // var code = error.code;
      // var message = error.message;
      // var details = error.details;
      // ...
    });
  }

  subscribeForTopic(token, topic) {
    firebase.functions().httpsCallable('subscribeToTopic')({ token, topic })
  }

  uploadFile(id, file) {
    const ref = firebase.storage().ref('todos/' + id + '/' + file.name);
    const task = ref.put(file);
    return task;
  }

  deleteFile(id, file, attachments) {
    firebase.storage().ref('todos/' + id + '/' + file.name).delete()
      .then(succ => {
        firebase.firestore().collection('todos').doc(id).update({ attachments });
      });
  }
}

export default new Firestore();
