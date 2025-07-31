---
layout: about
title: Home
classes: about-wide
permalink: /
subtitle: 

profile:
  align: right
  image: prof_pic.jpeg
  image_circular: false # crops the image to make it circular.
sections:
  - title: "Mathematics"
    description: >
      Articles and projects in topology, algebra, analysis, and more,
      with implementations in Python and Wolfram Language.
    link:
      text: "View section"
      url: "/mathematics/"
  - title: "Computation"
    description: >
      Machine learning, Quantum ML, Generative models.
      Practical examples and interactive notebooks.
    link:
      text: "View section"
      url: "/computation/"
  - title: "Other Areas"
    description: >
      Essays on physics, philosophy and literature.
    link:
      text: "View section"
      url: "/other-areas/"
    
latest_posts:
  enabled: true
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 5 # leave blank to include all the blog posts
  
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page
---

This site explores theorems, creations, and ideas in pure mathematics, computer science, philosophy, and other fields.


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


