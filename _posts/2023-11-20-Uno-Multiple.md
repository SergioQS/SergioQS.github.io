---
layout: post
title: Teoría de conjuntos y el uno-múltiple
date: 2024-01-02 11:12:00-0400
description: Se explora conceptos como los conjuntos derivados, conjuntos perfectos, multiplicidades inconsistentes y ordinales.
tags: mathematics, philosophy, Cantor, ordinal, aleph
categories: other-areas
related_posts: false
citation: true
img_id: 12
---
Primera bitácora para la materia "Epistemología e historia de las matemáticas" con el profesor Fernando Zalamea Traba.

{% assign pdf_path = 'assets/pdf/Bit4.pdf' | relative_url %}
{% capture pdf_exists %}{% file_exists assets/pdf/Bit4.pdf %}{% endcapture %}
{% if pdf_exists == 'true' %}
  <div class="embedded-pdf">
    <object data="{{ pdf_path }}" type="application/pdf" width="100%" height="1200">
      <p>
        Tu navegador no muestra PDFs embebidos.
        Puedes <a href="{{ pdf_path }}" target="_blank" rel="noopener">abrirlo en una nueva pestaña</a>
        o <a href="{{ pdf_path }}" download>descargar el PDF</a>.
      </p>
    </object>

    <!-- Enlaces visibles (útil para móviles o navegadores sin soporte) -->
    <p class="pdf-links">
      <a href="{{ pdf_path }}" target="_blank" rel="noopener">Abrir en nueva pestaña</a> ·
      <a href="{{ pdf_path }}" download>Descargar PDF</a>
    </p>
  </div>
{% else %}
  <p>Sorry, the PDF you are looking for does not exist.</p>
{% endif %}
