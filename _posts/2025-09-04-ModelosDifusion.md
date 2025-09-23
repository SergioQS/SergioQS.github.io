---
layout: post
title: Modelos de difusión DDPM
date: 2025-08-22 11:12:00-0400
description: Modelo de difusión para eliminación de ruido en dos distribuciones Gaussianas 2-dimensionales implementado en Julia.
tags: generativemodels, ML, julia, classification
categories: computation
related_posts: false
citation: true
---

{::nomarkdown}
{% assign jupyter_path = 'assets/jupyter/Modelos_difusion_Julia.ipynb' | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/Modelos_difusion_Julia.ipynb %}{% endcapture %}
{% if notebook_exists == 'true' %}
  <div class="embedded-notebook">
    {% jupyter_notebook jupyter_path %}
  </div>
{% else %}
  <p>Sorry, the notebook you are looking for does not exist.</p>
{% endif %}
{:/nomarkdown}
