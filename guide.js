/* =========================================================
   SIGNAL AI — DYNAMIC GUIDE LANDING PAGE
   Google Apps Script + GitHub Pages
   ========================================================= */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx_CMUPh65uRQI0OclFw4j9vTMZ1_uitYdhpDuWlfr_7iQ9O-K0bpcWixjLbP7KIyFX/exec";

const params = new URLSearchParams(window.location.search);

const requestedGuideId = (params.get("id") || "")
  .trim()
  .toLowerCase();

// ?reel=xyz ho to wo, warna utm_source (jaise chatgpt.com) save hoga
const sourceReel = (
  params.get("reel") ||
  params.get("utm_source") ||
  ""
).trim();

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
let submitting = false;

const originalButtonHTML = submitBtn
  ? submitBtn.innerHTML
  : "Get my guide →";


// =========================================================
// INITIALIZATION
// =========================================================

if (document.getElementById("year")) {
  document.getElementById("year").textContent =
    new Date().getFullYear();
}

if (form) {
  form.hidden = true;
}

if (downloadArea) {
  downloadArea.hidden = true;
}

if (downloadBtn) {
  downloadBtn.hidden = true;
}

if (titleEl) {
  titleEl.textContent = "Loading your AI guide...";
}

if (descriptionEl) {
  descriptionEl.textContent =
    "Finding the resource linked to this page...";
}

if (formTitleEl) {
  formTitleEl.textContent = "Loading guide";
}


// =========================================================
// TERMS CHECKBOX
// =========================================================

// Agar guide.html mein id="termsConsent" wala checkbox nahi hai,
// to ye automatically ek required checkbox add kar deta hai.

function ensureTermsCheckbox() {
  if (!form) return null;

  let checkbox = document.getElementById("termsConsent");

  if (checkbox) {
    checkbox.required = true;
    return checkbox;
  }

  const wrapper = document.createElement("label");

  wrapper.className = "consent-option";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "flex-start";
  wrapper.style.gap = "10px";
  wrapper.style.marginTop = "16px";
  wrapper.style.marginBottom = "16px";
  wrapper.style.cursor = "pointer";

  checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.id = "termsConsent";
  checkbox.name = "termsAccepted";
  checkbox.required = true;

  checkbox.style.marginTop = "4px";
  checkbox.style.flexShrink = "0";

  const text = document.createElement("span");

  text.innerHTML =
    'I agree to the <a href="terms.html" target="_blank" ' +
    'rel="noopener noreferrer">Terms &amp; Conditions</a> ' +
    'and <a href="privacy.html" target="_blank" ' +
    'rel="noopener noreferrer">Privacy Policy</a>.';

  wrapper.appendChild(checkbox);
  wrapper.appendChild(text);

  const whatsappConsent =
    document.getElementById("whatsappConsent");

  if (whatsappConsent && whatsappConsent.closest("label")) {
    whatsappConsent.closest("label").insertAdjacentElement(
      "afterend",
      wrapper
    );
  } else {
    form.insertBefore(wrapper, form.firstChild);
  }

  return checkbox;
}

const termsCheckbox = ensureTermsCheckbox();


// =========================================================
// LOAD GUIDE FROM APPS SCRIPT (JSONP)
// =========================================================

loadGuide()
  .then(function(foundGuide) {
    if (!foundGuide) {
      showUnavailableGuide();
      return;
    }

    guide = foundGuide;

    if (titleEl) {
      titleEl.textContent = "";
      titleEl.appendChild(document.createTextNode("Get your "));

      const emphasis = document.createElement("em");
      emphasis.textContent = guide.title;

      titleEl.appendChild(emphasis);
    }

    if (descriptionEl) {
      descriptionEl.textContent =
        guide.description ||
        "Enter your details to access this free guide.";
    }

    if (formTitleEl) {
      formTitleEl.textContent = guide.title;
    }

    document.title = guide.title + " — Signal AI";

    if (form) {
      form.hidden = false;
    }
  })
  .catch(function(error) {
    console.error("Guide loading error:", error);

    if (titleEl) {
      titleEl.textContent = "Unable to load this guide.";
    }

    if (descriptionEl) {
      descriptionEl.textContent =
        "Please refresh the page and try again.";
    }

    if (formTitleEl) {
      formTitleEl.textContent = "Guide temporarily unavailable";
    }
  });


function loadGuide() {
  return new Promise(function(resolve, reject) {
    if (!requestedGuideId) {
      resolve(null);
      return;
    }

    const callbackName =
      "signalGuidesCallback_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 100000);

    const script = document.createElement("script");

    let finished = false;

    const timeout = setTimeout(function() {
      finish(new Error("Guide lookup timed out"));
    }, 15000);

    window[callbackName] = function(result) {
      if (!result || result.success !== true) {
        finish(new Error("Invalid guide response"));
        return;
      }

      const guides = Array.isArray(result.guides)
        ? result.guides
        : [];

      const found = guides.find(function(item) {
        return String(item.id || "").trim().toLowerCase() ===
          requestedGuideId;
      });

      finish(null, found || null);
    };

    script.onerror = function() {
      finish(new Error("Could not contact the guide API"));
    };

    script.src =
      APPS_SCRIPT_URL +
      "?action=guides" +
      "&callback=" + encodeURIComponent(callbackName) +
      "&_=" + Date.now();

    document.head.appendChild(script);

    function finish(error, result) {
      if (finished) return;

      finished = true;

      clearTimeout(timeout);

      delete window[callbackName];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }
  });
}


function showUnavailableGuide() {
  if (titleEl) {
    titleEl.textContent = "Guide not found.";
  }

  if (descriptionEl) {
    descriptionEl.textContent =
      "This resource is not available yet. " +
      "Please use the link shared with the relevant Instagram Reel.";
  }

  if (formTitleEl) {
    formTitleEl.textContent = "Guide not available";
  }

  if (form) {
    form.hidden = true;
  }
}


// =========================================================
// FORM VALIDATION AND SUBMISSION
// =========================================================

if (form) {
  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (submitting) return;

    clearStatus();

    if (!guide) {
      showError("This guide is not available.");
      return;
    }

    if (!termsCheckbox || !termsCheckbox.checked) {
      showError(
        "Please accept the Terms & Privacy Policy to continue."
      );

      if (termsCheckbox) {
        termsCheckbox.focus();
      }

      return;
    }

    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    if (!nameInput || !emailInput || !phoneInput) {
      showError("The form is not configured correctly.");
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();

    if (!name || !email || !phone) {
      showError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!/^[+()\d\s.-]{7,30}$/.test(phone)) {
      showError("Please enter a valid phone number.");
      phoneInput.focus();
      return;
    }

    const emailConsent =
      Boolean(document.getElementById("emailConsent")?.checked);

    const whatsappConsent =
      Boolean(document.getElementById("whatsappConsent")?.checked);

    const payload = {
      name: name,
      email: email,
      phone: phone,
      guideId: guide.id,
      sourceReel: sourceReel,
      termsAccepted: true,
      emailConsent: emailConsent,
      whatsappConsent: whatsappConsent
    };

    submitting = true;
    setSubmitting(true);

    showStatus("Submitting your details...", "info");

    try {
      // no-cors NAHI use karte, taaki server ka jawab padh sakein
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();

      let result;

      try {
        result = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Unexpected server response:", rawText);
        showError("Unexpected server response. Please try again.");
        return;
      }

      if (!result || result.success !== true) {
        showError(
          (result && result.message) ||
          "We could not save your details. Please try again."
        );
        return;
      }

      // Lead save ho chuki hai, ab download dikhao
      const pdfUrl =
        (result.guide && result.guide.pdfUrl) || guide.pdfUrl;

      if (!pdfUrl) {
        showError("The guide file is unavailable right now.");
        return;
      }

      showDownload(pdfUrl);

    } catch (error) {
      console.error("Lead submission error:", error);

      showError(
        "We could not submit your details. " +
        "Please check your connection and try again."
      );

    } finally {
      submitting = false;
      setSubmitting(false);
    }
  });
}


// =========================================================
// DOWNLOAD REVEAL
// =========================================================

function showDownload(pdfUrl) {
  clearStatus();

  if (form) {
    form.hidden = true;
  }

  if (downloadArea) {
    downloadArea.hidden = false;
  }

  if (downloadMessage) {
    downloadMessage.textContent =
      "Thank you! Your guide is ready. " +
      "Click the button below to download it.";
  }

  if (downloadBtn) {
    downloadBtn.hidden = false;

    if (downloadBtn.tagName === "A") {
      downloadBtn.href = pdfUrl;
      downloadBtn.target = "_blank";
      downloadBtn.rel = "noopener noreferrer";
    } else {
      downloadBtn.onclick = function() {
        window.open(pdfUrl, "_blank", "noopener");
      };
    }

    downloadBtn.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } else {
    // Page par download button hi na ho to seedha khol do
    window.open(pdfUrl, "_blank", "noopener");
  }
}


// =========================================================
// UI HELPERS
// =========================================================

function setSubmitting(isSubmitting) {
  if (!submitBtn) return;

  submitBtn.disabled = isSubmitting;

  submitBtn.innerHTML = isSubmitting
    ? "Submitting..."
    : originalButtonHTML;
}


function clearStatus() {
  if (!statusEl) return;

  statusEl.className = "form-status";
  statusEl.textContent = "";
}


function showError(message) {
  showStatus(message, "error");
}


function showStatus(message, type) {
  if (!statusEl) return;

  statusEl.className = "form-status " + type;
  statusEl.textContent = message;
}
