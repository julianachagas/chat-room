import { formatDistanceToNow } from 'date-fns';

export default class ChatUI {
  constructor(container) {
    this.container = container;
  }

  render(data) {
    const { message, username, createdAt, room } = data;
    const time = formatDistanceToNow(createdAt.toDate(), { addSuffix: true });
    const welcomeMessage = document.querySelector('.welcome-message');
    welcomeMessage.textContent = `Welcome! You're in the #${room} chat room.`;
    const html = `
      <div class="chat__message">
        <div class="chat__content">
          <span class="chat__name">${username}</span>
          <span class="chat__text">${message}</span>
        </div>
        <p class="chat__time">${time}</p>
      </div>`;
    this.container.innerHTML += html;
    // make container scroll to the bottom
    this.container.scrollTop = this.container.scrollHeight;
  }

  clear(room) {
    this.container.innerHTML = `<p class="welcome-message">
    Welcome! You're in the #${room} chat room.
  </p>`;
  }
}
