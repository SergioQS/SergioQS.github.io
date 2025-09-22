---
layout: post
title: Boltzmann Machines and quantum computing, QRBM implementation.
date: 2025-08-22 11:12:00-0400
description: An implementation of a quantum boltzmann machine with basic theory explanations for the MNIST dataset.
tags: generativemodels
categories: computation
related_posts: false
citation: true
---

{::nomarkdown}
{% assign jupyter_path = 'assets/jupyter/Modelos_difusion.ipynb' | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/QRBM_Implementation_and_Theory.ipynb %}{% endcapture %}
{% if notebook_exists == 'true' %}
  <div class="embedded-notebook">
    {% jupyter_notebook jupyter_path %}
  </div>
{% else %}
  <p>Sorry, the notebook you are looking for does not exist.</p>
{% endif %}
{:/nomarkdown}
