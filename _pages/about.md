---
layout: about
title: Home
permalink: /
nav: true
nav_order: 1
classes: about-wide
img: /assets/img/LionResting.jpg      # al-folio will set this as hero/background
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
<div class="container py-5">
  <div class="row">
    <div class="col-12">
      <!-- Grid of Post Cards -->
      <div class="row">
        {% for post in site.posts %}
          {% unless post.path contains '_Old_posts' %}
            <div class="col-lg-4 col-md-4 col-sm-6 mb-4">
            <div class="post-card" style="position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; height: 280px;"
                 onclick="window.location.href='{{ post.url | relative_url }}'"
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.2)'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'">
              
              <!-- Thumbnail Image -->
              {% assign idx = forloop.index | modulo: 12 | plus: 1 %}
              {% capture jpg_path %}/assets/img/{{ idx }}.jpg{% endcapture %}
              {% capture png_path %}/assets/img/{{ idx }}.png{% endcapture %}
              {% capture gif_path %}/assets/img/{{ idx }}.gif{% endcapture %}
              {% capture gif_exists %}{% file_exists assets/img/{{ idx }}.gif %}{% endcapture %}
              {% capture png_exists %}{% file_exists assets/img/{{ idx }}.png %}{% endcapture %}
              {% capture jpg_exists %}{% file_exists assets/img/{{ idx }}.jpg %}{% endcapture %}
              {% if gif_exists == 'true' %}
                {% assign thumb_path = gif_path %}
              {% elsif png_exists == 'true' %}
                {% assign thumb_path = png_path %}
              {% elsif jpg_exists == 'true' %}
                {% assign thumb_path = jpg_path %}
              {% else %}
                {% assign thumb_path = '/assets/img/1.jpg' %}
              {% endif %}
              <div style="position: relative; width: 100%; height: 100%; background-image: url('{{ thumb_path }}'); background-size: cover; background-position: center;">
                
                <!-- Dark Overlay for Better Text Readability -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.95));"></div>
                
                <!-- Post Title Overlay -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; color: white;">
                  <h4 style="margin: 0; font-size: 1.2rem; font-weight: 600; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.3;">
                    {{ post.title }}
                  </h4>
                  {% if post.description %}
                    <p style="margin: 8px 0 0 0; font-size: 0.9rem; opacity: 0.9; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                      {{ post.description | truncate: 80 }}
                    </p>
                  {% endif %}
                  <small style="display: block; margin-top: 8px; opacity: 0.8; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    {{ post.date | date: "%B %d, %Y" }}
                  </small>
                </div>
                
                <!-- Category Badge -->
                {% if post.categories %}
                  <div style="position: absolute; top: 15px; right: 15px;">
                    <span style="background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize;">
                      {{ post.categories | first }}
                    </span>
                  </div>
                {% endif %}
              </div>
            </div>
          </div>
          {% endunless %}
        {% endfor %}
      </div>
    </div>
  </div>
</div>

<!-- ──────────────────────────────────────────────────────── -->
<!-- ADDITIONAL STYLES FOR POST CARDS -->
<style>
/* Ensure full width for gallery container */
.container {
  max-width: 1400px !important;
}

.post-card {
  transition: all 0.3s ease !important;
}

.post-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
}

/* Keep card text colors constant across theme changes */

html[data-theme="light"] .post-card h4,
html[data-theme="dark"] .post-card h4 {
  color: rgb(179, 105, 30) !important;
}
.post-card p,
.post-card small,
.post-card a {
  color: #ffffff !important;
}
.post-card a:hover,
.post-card a:focus {
  color: #ffffff !important;
  text-decoration: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .post-card {
    height: 240px !important;
  }
  
  .post-card h4 {
    font-size: 1.1rem !important;
  }
  
  .post-card p {
    font-size: 0.85rem !important;
  }
}

@media (max-width: 576px) {
  .post-card {
    height: 200px !important;
  }
  
  .post-card h4 {
    font-size: 1rem !important;
  }
  
  .post-card p {
    font-size: 0.8rem !important;
  }
}
</style>

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
