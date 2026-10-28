---
layout: default
permalink: /computer-science/
title: Computation
title_es: Computación
nav: true
nav_order: 3
img: /assets/img/LionResting.jpg
---

<div class="post">

  {% if page.img %}
    <div class="section-hero">
      <img src="{{ page.img | relative_url }}" alt="{{ page.title }}" loading="eager" />
    </div>
  {% endif %}

  <div class="header-bar">
    <h2>{% include t.liquid es="Ensayos computacionales sobre modelos generativos, computación cuántica y más." en="Computational essays in generative models, quantum computing, and more." %}</h2>
  </div>

  <blockquote class="l-es" lang="es">
    "O bien las matemáticas son demasiado grandes para la mente humana, o bien la mente humana es más que una máquina."
    — Kurt Gödel.
  </blockquote>
  <blockquote class="l-en" lang="en">
    "Either mathematics is too big for the human mind, or the human mind is more than a machine."
    — Kurt Godel.
  </blockquote>

  {% assign postlist = site.posts | where: "categories", "computation" %}

  <div class="post-feed">
    {% for post in postlist %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      <a href="{{ post.url | relative_url }}" class="post-feed-item {% if post.image %}has-thumb{% endif %}">
        <div class="post-feed-body">
          <div class="post-feed-meta">
            <span class="post-feed-date">{% include i18n_date.liquid date=post.date %} &middot; {{ read_time }} {% include t.liquid k="min_read" %}</span>
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

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>
