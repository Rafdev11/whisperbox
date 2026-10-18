const messageInput = document.querySelector('#message');
const count = document.querySelector('#count');
const feedback = document.querySelector('#feedback');
const messages = document.querySelector('#messages');
const total = document.querySelector('#total');
const STORAGE_KEY = 'whisperbox_demo_messages';
let inbox = [];
try { inbox = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (!Array.isArray(inbox)) inbox = []; } catch { inbox = []; }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inbox)); } catch { feedback.textContent = 'Browser storage is unavailable; messages may disappear after refresh.'; } }
function render() {
  messages.replaceChildren();
  total.textContent = `${inbox.length} message${inbox.length === 1 ? '' : 's'}`;
  if (!inbox.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = '📭 No messages yet. Send the first one!'; messages.append(empty); return; }
  inbox.forEach(item => { const card = document.createElement('div'); card.className = 'message'; const body = document.createElement('div'); body.textContent = item.text; const date = document.createElement('small'); date.textContent = item.date; card.append(body,date); messages.append(card); });
}
messageInput.addEventListener('input', () => { count.textContent = `${messageInput.value.length} / 500`; feedback.textContent = ''; });
document.querySelector('#send').addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text) { feedback.textContent = 'Please write a message first.'; messageInput.focus(); return; }
  inbox.unshift({text, date: new Date().toLocaleString()}); save(); render(); messageInput.value = ''; count.textContent = '0 / 500'; feedback.textContent = '✓ Message added to this browser’s demo inbox!';
});
document.querySelector('#clear').addEventListener('click', () => { inbox = []; save(); render(); feedback.textContent = ''; });
render();
