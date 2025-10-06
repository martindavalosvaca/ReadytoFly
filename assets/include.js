document.addEventListener("DOMContentLoaded", async () => {
  const slots = Array.from(document.querySelectorAll("[data-include]"));
  await Promise.all(slots.map(async el => {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (e) {
      console.error("Include failed:", url, e);
      el.innerHTML = `<div style=\"color:#b91c1c;font:14px/1.4 system-ui\">Failed to load ${url}</div>`;
    }
  }));
  document.dispatchEvent(new CustomEvent("partials:loaded"));
});
