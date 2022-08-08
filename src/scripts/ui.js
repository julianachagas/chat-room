import { formatDistanceToNow } from 'date-fns';

export default class ChatUI {
  constructor(container) {
    this.container = container;
  }

  render(data) {
    const { message, username, createdAt } = data;
    const time = formatDistanceToNow(createdAt.toDate(), { addSuffix: true });
    const emptyChatMessage = document.querySelector('.empty-chat-message');
    emptyChatMessage.classList.add('hide');
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

  clear() {
    this.container.innerHTML = `
    <p class="empty-chat-message">
      This chat is empty. Send a message below.
    </p>`;
  }
}
