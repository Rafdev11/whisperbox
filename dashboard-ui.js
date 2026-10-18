/* Dashboard appearance enhancements. Your existing dashboard.js stays unchanged. */
const totalCount = document.getElementById('total-messages');
const unreadCount = document.getElementById('unread-messages');
const readCount = document.getElementById('read-messages');
const inboxCards = document.getElementById('inbox-list');

// Existing dashboard.js renders each message, so derive the statistics
// from the actual displayed cards (never use made-up totals).
function updateVisibleStats() {
  const total = inboxCards.querySelectorAll('.inbox-message').length;
  const unread = inboxCards.querySelectorAll('.inbox-message.unread-message').length;
  totalCount.textContent = String(total);
  unreadCount.textContent = String(unread);
  readCount.textContent = String(total - unread);
}
const observer = new MutationObserver(updateVisibleStats);
observer.observe(inboxCards, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
updateVisibleStats();

const copyLink = document.getElementById('profile-link');
document.getElementById('share-whatsapp').addEventListener('click', () => {
  if (!copyLink.value) return;
  const text = 'Send me an anonymous message on WhisperBox 💜 ' + copyLink.value;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
});
document.getElementById('share-native').addEventListener('click', async () => {
  if (!copyLink.value) return;
  if (navigator.share) {
    try { await navigator.share({title:'WhisperBox', text:'Send me an anonymous message 💜', url:copyLink.value}); }
    catch (error) { if (error.name !== 'AbortError') console.error(error); }
  } else {
    document.getElementById('copy-link').click();
  }
});
