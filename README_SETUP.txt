SIGNAL AI — GITHUB PAGES FILES

UPLOAD
1. Download and unzip this package.
2. Upload all files in this folder to the ROOT of your existing GitHub Pages repository, replacing the old files when prompted. Keep index.html, style.css and script.js because they preserve the existing homepage.
3. In GitHub, open Settings > Pages and confirm GitHub Pages is enabled for the branch/folder you use.

FILES
- index.html: existing Signal AI homepage
- style.css: homepage and guide landing page styles
- script.js: homepage script
- guide.html: landing page used by links sent from Instagram
- guide.js: looks up the requested guide dynamically from the Google Sheet via Apps Script JSONP; no daily edits needed

IMPORTANT: UPDATE APPS SCRIPT FOR JSONP
The current Apps Script doGet(e) must support the callback parameter for cross-origin guide lookup. In Apps Script, replace your existing doGet(e) with this version, keeping your existing doPost(), syncGuides(), getGuides(), makeGuideId(), createDailySyncTrigger(), and jsonResponse() functions:

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  if (params.action === "guides") {
    const data = getGuides();
    const callback = String(params.callback || "");
    if (callback) {
      if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
        return ContentService.createTextOutput("Invalid callback").setMimeType(ContentService.MimeType.TEXT);
      }
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(data) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(data);
  }
  return ContentService.createTextOutput("AI Guide Lead Capture API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

Then Save > Deploy > Manage deployments > pencil/Edit > select New version > Deploy. Keep the same Web App URL. Make sure deployment access is set to Anyone if this is intended to be publicly accessed.

PDF WORKFLOW
1. Upload each PDF to the connected Google Drive folder.
2. Run syncGuides once manually after uploading (or wait for the hourly trigger).
3. A row is added to the Guides tab. Guide ID comes from the filename, e.g. ChatGPT_New_Features.pdf becomes chatgpt-new-features.
4. Use the URL pattern below for that specific guide:
   https://mayureshahujaai-spec.github.io/mayuresh.ai/guide.html?id=chatgpt-new-features&reel=chatgpt-oct-13
   Replace the id and reel values for each Reel.
5. Test that the page shows only the requested guide, submit a test form, and verify the lead appears in the lead sheet before launch.

GOOGLE SHEET
The first tab is used for leads; the Guides tab contains the guide database. Lead columns expected by doPost(): Timestamp, Name, Email, Phone, Guide_ID, Source_Reel, Email_Updates_Consent, WhatsApp_Updates_Consent.

IMPORTANT LIMITATIONS
- Browser submission uses no-cors, so the website cannot read the Apps Script response. Always verify test submissions appear in the Google Sheet before launch.
- Marketing checkboxes are optional and unchecked by default. Only send marketing updates to people who explicitly opted in, and provide unsubscribe/opt-out options.
- A public PDF link can be forwarded by recipients; this is not DRM or secure access control.
- Uploading a PDF automatically adds it to the Guides sheet, but the relevant guide ID still needs to be used in the link/ManyChat automation for each Reel.
