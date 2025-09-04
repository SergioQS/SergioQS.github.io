---
layout: post
title: Generative models, DDPM.
date: 2025-08-22 11:12:00-0400
description: 
tags: computation, generativemodels
categories: computation
related_posts: false
citation: true
---

{::nomarkdown}
{% assign jupyter_path = 'assets/jupyter/Modelos_difusion.ipynb' | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/Modelos_difusion.ipynb %}{% endcapture %}
{% if notebook_exists == 'true' %}
  {% jupyter_notebook jupyter_path %}
{% else %}
  <p>Sorry, the notebook you are looking for does not exist.</p>
{% endif %}
{:/nomarkdown}