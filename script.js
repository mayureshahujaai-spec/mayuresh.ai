document.getElementById('year').textContent = new Date().getFullYear();
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const shareData = {title: document.title, text: 'Explore this AI news and tools guide.', url: window.location.href};
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        shareBtn.innerHTML = 'Link copied <b>✓</b>';
      } else window.prompt('Copy this guide link:', window.location.href);
    } catch (e) { /* Share dialog was closed. */ }
  });
}
