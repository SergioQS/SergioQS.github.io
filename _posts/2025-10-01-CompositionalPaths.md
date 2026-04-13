---
layout: post
title: "Poster: Compositional Paths on Hypergraphs"
date: 2025-10-01 12:00:00-0400
description: "Formalizing compositions of n-ary relations to generate algebras from hypergraphs, recovering classical path algebras and producing new associative and non-associative structures."
tags: mathematics, algebra, graphs
categories: mathematics
related_posts: false
citation: true
img_id: 13
---

Poster for my undergraduate thesis on compositional path algebras, presented at Universidad Nacional de Colombia in 2025.

The formalization of compositions of n-ary relations provides a coherent framework for generating algebras from hypergraphs. It recovers the classical case of path algebras on directed graphs and produces new algebraic structures. The thesis exhibits both associative and non-associative examples.

{% assign pdf_path = 'assets/pdf/Poster_CompositionalPaths_SergioQuiroga-1.pdf' | relative_url %}
{% capture pdf_exists %}{% file_exists assets/pdf/Poster_CompositionalPaths_SergioQuiroga-1.pdf %}{% endcapture %}
{% if pdf_exists == 'true' %}
  <div class="embedded-pdf">
    <object data="{{ pdf_path }}" type="application/pdf" width="100%" height="1400">
      <p>
        Your browser does not support embedded PDFs.
        You can <a href="{{ pdf_path }}" target="_blank" rel="noopener">open it in a new tab</a>
        or <a href="{{ pdf_path }}" download>download the PDF</a>.
      </p>
    </object>

    <p class="pdf-links">
      <a href="{{ pdf_path }}" target="_blank" rel="noopener">Open in new tab</a> ·
      <a href="{{ pdf_path }}" download>Download PDF</a>
    </p>
  </div>
{% else %}
  <p>Sorry, the PDF you are looking for does not exist.</p>
{% endif %}

[See the related Wolfram Community post: Compositional paths on hypergraphs](https://community.wolfram.com/groups/-/m/t/3210556)
