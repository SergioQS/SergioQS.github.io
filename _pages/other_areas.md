---
layout: default
permalink: /other-areas/
title: Other
nav: true
nav_order: 4
img: /assets/img/Other.jpeg
---

<div class="post">

  {% if page.img %}
    <div class="section-hero">
      <img src="{{ page.img | relative_url }}" alt="{{ page.title }}" loading="eager" />
    </div>
  {% endif %}

  <div class="header-bar">
    <h2>Philosophy, literature, physics and more.</h2>
  </div>

  <blockquote>
    "Thought is no more than a flash of lightning in the midst of a long night.  
    But that flash is everything."  
    — Henri Poincaré
  </blockquote>

  <div class="post-feed">
    {% assign other_posts = site.posts | where: "categories", "other-areas" %}
    {% for post in other_posts %}
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

  <hr>

  <h2>Books</h2>
  <blockquote>
    Across the millennia, an author is speaking clearly and silently inside your head, directly to you. Writing is perhaps the greatest of human inventions, binding together people who never knew each other, citizens of distant epochs. Books break the shackles of time. A book is proof that humans are capable of working magic.
    <footer class="blockquote-footer">Carl Sagan, Cosmos, Part 11: The Persistence of Memory (1980)</footer>
  </blockquote>

  <h3>Currently Reading</h3>
  <ul>
    <li><em>Actos humanos</em> — Han Kang</li>
  </ul>

  <h3>Recently Read</h3>
  <ul>
    <li><em>Sobre dios</em> — Byung-Chul Han</li>
    <li><em>A Brief History of Time</em> — Stephen Hawking</li>
    <li><em>Confieso que he vivido: memorias</em> — Pablo Neruda</li>
    <li><em>Tao Te Ching</em> — Lao Tse</li>
    <li><em>Ficciones</em> — Jorge Luis Borges</li>
  </ul>

  <h3>To Read</h3>
  <ul>
    <li><em>Simone Weil</em></li>
  </ul>

</div>
