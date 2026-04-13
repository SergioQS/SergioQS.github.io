/**
 * Lazy-loads interactive embeds only when the user activates them.
 * Keeps baseline page weight at zero for interactive content.
 *
 * Usage in Liquid: {% include interactive_embed.liquid src="/assets/interactive/demo.html" %}
 */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".interactive-placeholder").forEach(function (el) {
    var btn = el.querySelector(".interactive-activate");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var src = el.getAttribute("data-src");
      var height = el.getAttribute("data-height") || "500";
      if (!src) return;

      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.style.width = "100%";
      iframe.style.height = height + "px";
      iframe.style.border = "1px solid var(--global-divider-color, #1A1A1A)";
      iframe.style.borderRadius = "8px";
      iframe.style.background = "#0A0A0A";
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      iframe.setAttribute("loading", "lazy");

      el.innerHTML = "";
      el.appendChild(iframe);
      el.classList.remove("interactive-placeholder");
      el.classList.add("interactive-loaded");
    });
  });
});
