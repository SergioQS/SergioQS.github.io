---
layout: default
permalink: /mathematics/
title: Mathematics
nav: true
nav_order: 2
img: /assets/img/TormentaMarGalilea.jpg
---

<div class="post">

  {% if page.img %}
    <div class="section-hero">
      <img src="{{ page.img | relative_url }}" alt="{{ page.title }}" loading="eager" />
    </div>
  {% endif %}

  <div class="header-bar">
    <h2>Essays exploring classical and contemporary works in mathematics.</h2>
  </div>

  <blockquote>
    "Mathematics is the work of the human mind, which is destined rather to study than to know. To seek the truth rather than to find it."  
    — Evariste Galois.
  </blockquote>

  <p>The works of Henri Poincaré, Galois, Riemann, Grothendieck, Artin, Hilbert, Euler, and several other important mathematicians will be explored, with the goal of formulating intriguing questions.</p>
  
  <div class="post-feed">
    {% assign math_posts = site.posts | where: "categories", "mathematics" %}
    {% for post in math_posts %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      <a href="{{ post.url | relative_url }}" class="post-feed-item {% if post.image %}has-thumb{% endif %}">
        <div class="post-feed-body">
          <div class="post-feed-meta">
            <span class="post-feed-date">{{ post.date | date: '%b %d, %Y' }} &middot; {{ read_time }} min read</span>
          </div>
          <h4 class="post-feed-title">{{ post.title }}</h4>
          {% if post.description %}
            <p class="post-feed-desc">{{ post.description | truncate: 120 }}</p>
          {% endif %}
        </div>
        {% if post.image %}
          <div class="post-feed-thumb">
            <img src="{{ post.image | relative_url }}" alt="{{ post.title }}" loading="lazy" />
          </div>
        {% endif %}
      </a>
    {% endfor %}
  </div>

</div>
