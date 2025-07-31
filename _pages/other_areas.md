---
layout: default
permalink: /other-areas/
title: Other Areas
nav: true
nav_order: 4
---

<div class="post">

  <div class="header-bar">
    <h1>Other Areas</h1>
    <h2>Philosophy, Literature and more.</h2>
  </div>

  <blockquote>
    “Thought is no more than a flash of lightning in the midst of a long night.  
    But that flash is everything.”  
    — Henri Poincaré
  </blockquote>

  <p>In this space I share essays and projects in related fields:</p>
  <ul>
    <li>Theoretical physics</li>
    <li>Philosophy</li>
    <li>Literature</li>
  </ul>

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

</div>
