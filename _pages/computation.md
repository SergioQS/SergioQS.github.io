---
layout: default
permalink: /computer-science/
title: Computation
nav: true
nav_order: 3
---

<div class="post">

  <div class="header-bar">
    <h2>Computational essays in generative models, quantum computing, and more.</h2>
  </div>
  <blockquote>
    “Either mathematics is too big for the human mind, or the human mind is more than a machine.”  
    — Kurt Godel.
  </blockquote>

  {% comment %}
  Filter only those posts in the "computation" category
  {% endcomment %}
  {% assign all_cs = site.posts %}
  {% assign postlist = "" | split: "" %}
  {% for post in all_cs %}
    {% if post.categories contains 'computation' %}
      {% assign postlist = postlist | push: post %}
    {% endif %}
  {% endfor %}

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
