---
layout: default
permalink: /computer-science/
title: Computation
nav: true
nav_order: 3
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
    <h1>Computer Science</h1>
    <h2>Computational essays and experiments in Machine Learning, generative models, quantum computing and much more.</h2>
  </div>

  {% comment %}
  Filter only those posts in the "computer-science" category
  {% endcomment %}
  {% assign all_cs = site.posts | where: "categories", "computer-science" %}
  {% if page.pagination.enabled %}
    {% assign postlist = paginator.posts | where: "categories", "computer-science" %}
  {% else %}
    {% assign postlist = all_cs %}
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
