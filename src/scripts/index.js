import '../styles/main.css';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import Chatroom from './chatroom';
import ChatUI from './chatui';

// init firebase auth
const auth = getAuth();

// DOM elements
const chatsContainer = document.querySelector('.chat');
const newMessageForm = document.querySelector('.new-message');
const newNameForm = document.querySelector('.new-name');
const feedbackMessage = document.querySelector('.feedback-message');
const chatRoomsList = document.querySelector('.chat-rooms-list');

// class instances
const chatUI = new ChatUI(chatsContainer);
const chatroom = new Chatroom('general', 'anon');

// get chats and render
chatroom.getChats(data => chatUI.render(data));

// listen for auth status changes and setupUI
const setupUI = user => {
  const forms = document.querySelector('.forms-wrapper');
  forms.classList.toggle('show', user);
  const authWrapper = document.querySelector('.auth-wrapper');
  authWrapper.classList.toggle('hide', user);
};

onAuthStateChanged(auth, user => {
  setupUI(user);
  if (user) chatroom.updateName(user.displayName);
});

// open sign up and login modals
const signUpModal = document.querySelector('#signUpModal');
const loginModal = document.querySelector('#loginModal');

const modalTriggers = document.querySelectorAll('.modal-trigger');
modalTriggers.forEach(item => {
  item.addEventListener('click', () => {
    const modal = document.querySelector(`#${item.dataset.target}`);
    modal.classList.add('show');
  });
});

// close modals
window.addEventListener('click', e => {
  if (e.target === signUpModal || e.target === loginModal)
    e.target.classList.remove('show');
});

const closeModalButtons = document.querySelectorAll('.close-modal');
closeModalButtons.forEach(item => {
  item.addEventListener('click', () => {
    const modal = document.querySelector(`#${item.dataset.target}`);
    modal.classList.remove('show');
  });
});

// update UI after login

const updateUIAfterLogin = (modal, message, credentials) => {
  const feedback = document.querySelector(`#${modal.id} .login-feedback`);
  feedback.classList.add('show');
  feedback.textContent = message;
  if (credentials) {
    setTimeout(() => {
      modal.classList.remove('show');
      feedback.textContent = '';
    }, 3000);
    setupUI(credentials);
  }
};

// sign up form
const signUpForm = document.querySelector('.sign-up-form');

const handleSignUp = async (email, password, name) => {
  try {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(auth.currentUser, {
      displayName: name
    });
    chatroom.updateName(name);
    updateUIAfterLogin(
      signUpModal,
      `${name}, you've successfully signed up!`,
      credentials.user
    );
    signUpForm.reset();
  } catch (err) {
    updateUIAfterLogin(
      signUpModal,
      'Something went wrong. Your password should be at least 6 characters long or your email is already in use. Please, try again!'
    );
  }
};

signUpForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target['signup-email'].value;
  const password = e.target['signup-password'].value;
  const name = e.target.username.value;
  handleSignUp(email, password, name);
});

// login form
const loginForm = document.querySelector('.login-form');

const handleLogin = async (email, password) => {
  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    chatroom.updateName(credentials.user.displayName);
    updateUIAfterLogin(
      loginModal,
      `Welcome back, ${credentials.user.displayName}! You've successfully logged in!`,
      credentials.user
    );
    loginForm.reset();
  } catch (err) {
    updateUIAfterLogin(
      loginModal,
      'Please check your email and password, and try again!'
    );
  }
};

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target['login-email'].value;
  const password = e.target['login-password'].value;
  handleLogin(email, password);
});

// sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err.message);
  }
};

const signOutButton = document.querySelector('#signout');
signOutButton.addEventListener('click', handleSignOut);

// add a new message
const addNewMessage = async message => {
  try {
    await chatroom.addChat(message);
    newMessageForm.reset();
  } catch (err) {
    console.error(err.message);
  }
};

newMessageForm.addEventListener('submit', e => {
  e.preventDefault();
  if (auth.currentUser) {
    const newMessage = e.target.message.value.trim();
    addNewMessage(newMessage);
  }
});

// update name
newNameForm.addEventListener('submit', e => {
  e.preventDefault();
  const newName = e.target.name.value.trim();
  // update name in firestore
  chatroom.updateName(newName);
  // show and then hide feedback message
  feedbackMessage.textContent = `Your name was successfully updated to ${newName}!`;
  setTimeout(() => {
    feedbackMessage.textContent = '';
  }, 5000);
  // update name in the user profile in firebase auth
  updateProfile(auth.currentUser, {
    displayName: newName
  });
  // reset the form
  e.target.reset();
});

// update chat room
chatRoomsList.addEventListener('click', e => {
  if (e.target.classList.contains('chat-room')) {
    // set the active class
    const chatRoomsBtns = document.querySelectorAll('.chat-room');
    chatRoomsBtns.forEach(button => {
      button.classList.toggle('active', e.target === button);
    });
    // clear the current chat
    chatUI.clear(e.target.id);
    // update the room
    chatroom.updateRoom(e.target.id);
    // get the chats of the new room and render
    chatroom.getChats(data => chatUI.render(data));
  }
});
