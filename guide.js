/* Signal AI dynamic guide landing page. PDFs are loaded from the Apps Script Guides tab. */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_CMUPh65uRQI0OclFw4j9vTMZ1_uitYdhpDuWlfr_7iQ9O-K0bpcWixjLbP7KIyFX/exec";
const params = new URLSearchParams(window.location.search);
const requestedGuideId = (params.get("id") || "").trim().toLowerCase();
const sourceReel = (params.get("reel") || "").trim();
const titleEl = document.getElementById("guideTitle");
const descriptionEl = document.getElementById("guideDescription");
const formTitleEl = document.getElementById("formGuideTitle");
const form = document.getElementById("leadForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const downloadArea = document.getElementById("downloadArea");
const downloadBtn = document.getElementById("downloadBtn");
const downloadMessage = document.getElementById("downloadMessage");
let guide = null;
document.getElementById("year").textContent = new Date().getFullYear();

form.hidden = true;
titleEl.innerHTML = 'Loading your <em>AI guide.</em>';
descriptionEl.textContent = 'Finding the resource linked to this page…';
formTitleEl.textContent = 'Loading guide';

loadGuide().then(found => {
  if (!found) {
    titleEl.innerHTML = 'Guide <em>not found.</em>';
    descriptionEl.textContent = 'This resource is not available yet. Please use the link shared with the relevant Instagram Reel.';
    formTitleEl.textContent = 'Guide not available';
    return;
  }
  guide = found;
  document.title = `${guide.title} — Signal AI`;
  titleEl.innerHTML = `Get your <em>${escapeHtml(guide.title)}.</em>`;
  descriptionEl.textContent = guide.description || 'Enter your details to access this free guide.';
  formTitleEl.textContent = guide.title;
  form.hidden = false;
}).catch(() => {
  titleEl.innerHTML = 'Could not load <em>this guide.</em>';
  descriptionEl.textContent = 'Please refresh the page in a moment. If the problem continues, contact Signal AI.';
  formTitleEl.textContent = 'Temporarily unavailable';
});

function loadGuide() {
  return new Promise((resolve, reject) => {
    if (!requestedGuideId) return resolve(null);
    const callbackName = `signalGuidesCallback_${Date.now()}`;
    const timeout = setTimeout(() => { cleanup(); reject(new Error('Guide lookup timed out')); }, 12000);
    window[callbackName] = (result) => {
      cleanup();
      const guides = result && Array.isArray(result.guides) ? result.guides : [];
      resolve(guides.find(item => String(item.id || '').toLowerCase() === requestedGuideId) || null);
    };
    const script = document.createElement('script');
    script.src = `${APPS_SCRIPT_URL}?action=guides&callback=${callbackName}&_=${Date.now()}`;
    script.onerror = () => { cleanup(); reject(new Error('Could not load guides')); };
    document.head.appendChild(script);
    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.className = 'form-status';
  statusEl.textContent = '';
  if (!guide) return showError('This guide is not available yet.');
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!name || !email || !phone) return showError('Please complete all required fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email address.');
  if (!/^[+()\d\s.-]{7,20}$/.test(phone)) return showError('Please enter a valid phone number.');
  const payload = {
    name, email, phone,
    guideId: guide.id,
    sourceReel,
    emailConsent: document.getElementById('emailConsent').checked,
    whatsappConsent: document.getElementById('whatsappConsent').checked
  };
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';
  statusEl.textContent = 'Submitting your details…';
  try {
    // Apps Script POST is sent in no-cors mode; verify the row in Google Sheets during testing.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    form.hidden = true;
    downloadArea.hidden = false;
    downloadBtn.href = guide.pdfUrl;
    downloadBtn.hidden = false;
    downloadMessage.textContent = 'Your request has been submitted. Use the button below to access your guide.';
    downloadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    showError('We could not submit your details. Please check your connection and try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Get my guide <b>→</b>';
  }
});
function showError(message) { statusEl.className = 'form-status'; statusEl.textContent = message; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
}
