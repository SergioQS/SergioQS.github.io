---
layout: about
title: Home
permalink: /
nav: true
nav_order: 1
classes: about-wide
img: /assets/img/KochStar.jpg      # al-folio will set this as hero/background
subtitle: >
  A collection of projects and blog posts on mathematics, computer science, philosophy and other areas.
sections:
  - title: "Mathematics"
    link:
      text: "View section"
      url: "/mathematics/"
  - title: "Computation"
    link:
      text: "View section"
      url: "/computer-science/"
  - title: "Other"
    link:
      text: "View section"
      url: "/other-areas/"
latest_posts:
  enabled: true
  scrollable: true
  limit: 5
selected_papers: true
social: true
---


<!-- ──────────────────────────────────────────────────────── -->
<!-- POSTS GALLERY -->
{% include post-grid.liquid %}

<!-- ──────────────────────────────────────────────────────── -->
<!-- QUOTE + PROFILE IMAGE BELOW ON PLAIN BACKGROUND -->
<div class="container py-5">
  <div class="row align-items-center">
    <div class="col-md-8">
      <blockquote class="blockquote quote-lower">
        <p class="mb-0">
          “Atención: acción inoperante de la parte divina del alma.”
        </p>
        <footer class="blockquote-footer text-muted mt-3">
          Simone Weil
        </footer>
      </blockquote>
      <blockquote class="blockquote quote-lower">
        <p class="mb-0">
          “Thought is no more than a flash of lightning in the midst of a long night.<br>
          But that flash is everything.”
        </p>
        <footer class="blockquote-footer text-muted mt-3">
          Henri Poincaré
        </footer>
      </blockquote>
    </div>
    <div class="col-md-4 text-center">
      <img src="/assets/img/prof_pic.jpeg" class="img-fluid rounded" alt="Profile">
    </div>
  </div>
</div>
