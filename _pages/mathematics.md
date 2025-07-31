---
layout: default
permalink: /mathematics/
title: Mathematics
nav: true
nav_order: 2
---

<div class="post">

  <div class="header-bar">
    <h1>Mathematics</h1>
    <h2>Explorations of classical and modern works in mathematics.</h2>
  </div>

  <ul class="post-list">
    {% assign math_posts = site.posts | where: "categories", "mathematics" %}
    {% for post in math_posts %}
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
