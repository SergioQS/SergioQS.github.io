---
layout: about
title: Home
permalink: /
nav: false
classes: about-wide
img: /assets/img/secondary-bg.jpg      # al-folio will set this as hero/background
subtitle: >
  This site explores theorems, creations, and ideas in pure mathematics,
  computer science, philosophy, and other fields — fully LaTeX-friendly.
sections:
  - title: "Mathematics"
    link:
      text: "View section"
      url: "/mathematics/"
  - title: "Computation"
    link:
      text: "View section"
      url: "/computer-science/"
  - title: "Other Areas"
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
<!-- SECTION BUTTONS OVER THE BACKGROUND IMAGE -->
<section class="about-bg text-center py-5">
  <div class="container">
    <div class="row">
      {% for section in page.sections %}
        <div class="col-md-4 mb-3">
          <a class="btn btn-lg btn-outline-light w-100" href="{{ section.link.url }}">
            {{ section.title }}
          </a>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<!-- ──────────────────────────────────────────────────────── -->
<!-- QUOTE + PROFILE IMAGE BELOW ON PLAIN BACKGROUND -->
<div class="container py-5">
  <div class="row align-items-center">
    <div class="col-md-8">
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



