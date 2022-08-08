import '../styles/main.css';
import Chatroom from './chat';
import ChatUI from './ui';

// DOM elements
const chatsContainer = document.querySelector('.chat');
const newMessageForm = document.querySelector('.new-message');
const newNameForm = document.querySelector('.new-name');
const feedbackMessage = document.querySelector('.feedback-message');
const chatRoomsList = document.querySelector('.chat-rooms-list');

// get username from local storage, if it doesn't exist yet set it to "anon"
const username = localStorage.getItem('username') || 'anon';

// class instances
const chatUI = new ChatUI(chatsContainer);
const chatroom = new Chatroom('general', username);

// get chats and render
chatroom.getChats(data => chatUI.render(data));

// add a new message
newMessageForm.addEventListener('submit', e => {
  e.preventDefault();
  const newMessage = e.target.message.value.trim();
  chatroom
    .addChat(newMessage)
    .then(() => e.target.reset())
    .catch(err => console.error(err.message));
});

// update name
newNameForm.addEventListener('submit', e => {
  e.preventDefault();
  const newName = e.target.name.value.trim();
  // update name in firestore and local storage
  chatroom.updateName(newName);
  // show and then hide feedback message
  feedbackMessage.textContent = `Your name was successfully updated to ${newName}!`;
  setTimeout(() => {
    feedbackMessage.textContent = '';
  }, 5000);
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
