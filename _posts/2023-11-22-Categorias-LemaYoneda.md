---
layout: post
title: Categorías y el lema de Yoneda
date: 2024-01-03 11:12:00-0400
description: 
tags: mathematics, philosophy, Cantor, ordinal, aleph
categories: other-areas
related_posts: false
citation: true
---

Tercera bitácora para la materia "Epistemología e historia de las matemáticas" con el profesor Fernando Zalamea Traba.
{::nomarkdown}
{% assign pdf_path = 'assets/pdf/Bit7.pdf' | relative_url %}
{% capture pdf_exists %}{% file_exists assets/pdf/Bit7.pdf %}{% endcapture %}
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
{:/nomarkdown}
Imagen de portada tomada de https://www.math3ma.com/blog/the-yoneda-lemma