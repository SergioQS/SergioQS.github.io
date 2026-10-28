---
layout: page
title: Wolfram Community
title_es: Wolfram Community
permalink: /wolfram/
description: Publications and notebooks posted to the Wolfram Community.
description_es: Publicaciones y notebooks compartidos en Wolfram Community.
nav: false
---

{% if site.data.wolfram.size > 0 %}
<div class="post-feed">
  {% assign sorted_wolfram = site.data.wolfram | sort: 'date' | reverse %}
  {% for item in sorted_wolfram %}
    <a href="{{ item.url }}" class="post-feed-item" target="_blank" rel="noopener">
      <div class="post-feed-meta">
        <span class="post-feed-category" style="color: #d9381e;">Wolfram Community</span>
        <span class="post-feed-date">{% include i18n_date.liquid date=item.date %}</span>
      </div>
      <h4 class="post-feed-title">{{ item.title }}</h4>
      {% if item.summary %}
        <p class="post-feed-desc">{{ item.summary }}</p>
      {% endif %}
    </a>
  {% endfor %}
</div>
{% else %}
<p>{% include t.liquid k="no_wolfram_posts" %}</p>
{% endif %}
