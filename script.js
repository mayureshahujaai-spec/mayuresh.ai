document.getElementById("year").textContent = new Date().getFullYear();
const shareBtn = document.getElementById("shareBtn");
shareBtn.addEventListener("click", async () => {
  const shareData = { title: document.title, text: "Explore this AI tools and news guide.", url: window.location.href };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      shareBtn.textContent = "Link copied ✓";
    } else {
      window.prompt("Copy this website link:", window.location.href);
    }
  } catch (error) {
    // The visitor may cancel the native share sheet.
  }
});
