---
layout: default
permalink: /other-areas/
title: Other
nav: true
nav_order: 4
---

<div class="post">

  <div class="header-bar">
    <h1>Other</h1>
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
    What an astonishing thing a book is. It's a flat object made from a tree with flexible parts on which are imprinted lots of funny dark squiggles. But one glance at it and you're inside the mind of another person, maybe somebody dead for thousands of years. Across the millennia, an author is speaking clearly and silently inside your head, directly to you. Writing is perhaps the greatest of human inventions, binding together people who never knew each other, citizens of distant epochs. Books break the shackles of time. A book is proof that humans are capable of working magic.
    <footer class="blockquote-footer">Carl Sagan, Cosmos, Part 11: The Persistence of Memory (1980)</footer>
  </blockquote>

  <h3>Currently Reading</h3>
  <ul>
    <li><em>Add your current books here</em></li>
  </ul>

  <h3>Recently Read</h3>
  <ul>
    <li><em>Add your recently read books here</em></li>
  </ul>

  <h3>To Read</h3>
  <ul>
    <li><em>Add books you plan to read here</em></li>
  </ul>

</div>
