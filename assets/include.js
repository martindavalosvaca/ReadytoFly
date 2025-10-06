document.addEventListener("DOMContentLoaded", async () => {
  const slots = Array.from(document.querySelectorAll("[data-include]"));

  await Promise.all(slots.map(async el => {
    let url = el.getAttribute("data-include");

    // ✅ Fix for GitHub Pages: convert absolute "/partials/..." to relative "./partials/..."
    if (url.startsWith("/")) {
      url = "." + url;
    }

    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      el.outerHTML = html; // replace placeholder with fetched content
    } catch (e) {
      console.error("Include failed:", url, e);
      el.innerHTML = `<div style="color:#b91c1c;font:14px/1.4 system-ui">Failed to load ${url}</div>`;
    }
  }));

  // Signal that all partials are loaded (used by app.js)
  document.dispatchEvent(new CustomEvent("partials:loaded"));
});
