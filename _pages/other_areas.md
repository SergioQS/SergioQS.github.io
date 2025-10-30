---
layout: default
permalink: /other-areas/
title: Other
nav: true
nav_order: 4
---

<div class="post page-with-bg page-other">

  <div class="header-bar">
    <h2>Philosophy, literature, physics and more.</h2>
  </div>

  <blockquote>
    “Thought is no more than a flash of lightning in the midst of a long night.  
    But that flash is everything.”  
    — Henri Poincaré
  </blockquote>


  <hr>

  <ul class="post-list">
    {% assign other_posts = site.posts | where: "categories", "other-areas" %}
    {% for post in other_posts %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      <li>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.description }}</p>
        <p class="post-meta">
          {{ read_time }} min read &middot; {{ post.date | date: "%B %d, %Y" }}
        </p>
      </li>
    {% endfor %}
  </ul>

  <hr>

  <h2 style="color: #0076df;">Books</h2>
  <blockquote>
    Across the millennia, an author is speaking clearly and silently inside your head, directly to you. Writing is perhaps the greatest of human inventions, binding together people who never knew each other, citizens of distant epochs. Books break the shackles of time. A book is proof that humans are capable of working magic.
    <footer class="blockquote-footer">Carl Sagan, Cosmos, Part 11: The Persistence of Memory (1980)</footer>
  </blockquote>

  <h3>Currently Reading</h3>
  <ul>
    <li><em>Confieso que he vivido, memorias -Pablo Neruda</em></li>
  </ul>

  <h3>Recently Read</h3>
  <ul>
    <li><em>Tao Te Ching -Lao Tse</em></li>
    <li><em>Ficciones -Jorge Luis Borges</em></li>
  </ul>

  <h3>To Read</h3>
  <ul>
    <li><em>Simone Weil</em></li>
  </ul>

</div>
