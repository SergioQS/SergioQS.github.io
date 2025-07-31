---
layout: default
permalink: /mathematics/
title: Mathematics
nav: true
nav_order: 2
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
    <h1>Mathematics</h1>
    <h2>Explorations of classical and modern works in mathematics.</h2>
  </div>

  {% comment %}
  Filter only those posts in the "mathematics" category
  {% endcomment %}
  {% assign all_math = site.posts | where: "categories", "mathematics" %}
  {% if page.pagination.enabled %}
    {% assign postlist = paginator.posts | where: "categories", "mathematics" %}
  {% else %}
    {% assign postlist = all_math %}
  {% endif %}

  <ul class="post-list">
    {% for post in postlist %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% assign year = post.date | date: "%Y" %}
      <li>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
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
