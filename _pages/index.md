---
layout: home
title: "GioMath"
permalink: /
subtitle: >
  This site explores theorems, creations, and ideas in pure mathematics,
  computer science, philosophy, and other fields.
hero_image: /assets/images/hero-bg.jpg     # <-- your main banner image
hero_opacity: 0.5                         # <-- darken it for better text contrast
nav: true
nav_order: 1

# Call-to-action buttons
sections:
  - title: "Mathematics"
    description: "Articles and projects in topology, algebra, analysis, and more."
    link:
      text: "Go to Mathematics"
      url: "/mathematics/"
  - title: "Computation"
    description: "Machine Learning, Quantum ML, generative models and interactive notebooks."
    link:
      text: "Go to Computation"
      url: "/computer-science/"
  - title: "Other Areas"
    description: "Essays on theoretical physics, philosophy of science, and literature."
    link:
      text: "Go to Other Areas"
      url: "/other-areas/"

# Optional: show latest posts, selected papers, social links
latest_posts:
  enabled: true
  scrollable: true
  limit: 3
selected_papers: true
social: true
---

<div class="row text-center my-5">
  {% for section in page.sections %}
    <div class="col-md-4 mb-3">
      <a class="btn btn-lg btn-outline-light w-100" href="{{ section.link.url }}">
        {{ section.title }}
      </a>
    </div>
  {% endfor %}
</div>

<section class="landing-section text-center text-white py-5"
         style="background-image: url('/assets/images/secondary-bg.jpg');">
  <div class="container">
    <blockquote class="blockquote">
      <p class="mb-0">
        “Thought is no more than a flash of lightning in the midst of a long night.<br>
        But that flash is everything.”
      </p>
      <footer class="blockquote-footer text-light mt-3">
        Henri Poincaré
      </footer>
    </blockquote>
  </div>
</section>


