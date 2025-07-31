---
layout: default
permalink: /other-areas/
title: "Other Areas"
nav: true
nav_order: 4
pagination:
  enabled: true
  collection: posts
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
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
    <li>Philosophy of science</li>
    <li>Mathematical outreach and education</li>
    <li>Academic reflections</li>
  </ul>

  <hr>

  {% comment %}
    Filter only those posts in the "other-areas" category
  {% endcomment %}
  {% assign all_other = site.posts | where: "categories", "other-areas" %}
  {% if page.pagination.enabled %}
    {% assign postlist = paginator.posts | where: "categories", "other-areas" %}
  {% else %}
    {% assign postlist = all_other %}
  {% endif %}

  <ul class="post-list">
    {% for post in postlist %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% assign year = post.date | date: "%Y" %}
      <li>
        <h3>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h3>
        <p>{{ post.description }}</p>
        <p class="post-meta">
          {{ read_time }} min read &nbsp; &middot; &nbsp;
          {{ post.date | date: "%B %d, %Y" }}
        </p>
      </li>
    {% endfor %}
  </ul>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>
