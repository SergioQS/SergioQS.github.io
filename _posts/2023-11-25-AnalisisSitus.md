---
layout: post
title: El Analysis Situs y la caracterización de esferas
date: 2024-01-06 11:12:00-0400
description: Se explora desde la filosofía de las matemáticas el papel de la caracterización de esferas como una fuente de preguntas fundamentales sobre el espacio y se hace un primer acercamiento a la homología y la homotopía en topología algebraica.
tags: mathematics, philosophy, poincaré, topology
categories: mathematics
related_posts: false
citation: true
img_id: 6
image: assets/img/6.png
---
Proyecto final para la materia "Epistemología e historia de las matemáticas" con el profesor Fernando Zalamea Traba.

En 1895, Henri poincaré publica publica su "Analysis Situs", un trabajo pionero que sentó las bases de la topología algebraica.

En este artículo, Poincaré introdujo herramientas conceptuales y técnicas innovadoras como el grupo fundamental y los primeros indicios de la teoría de la homología.
Poincaré complementó su obra original con cinco suplementos, publicados entre 1899 y 1904, en los que refinó y amplió sus ideas iniciales. La obra de Poincaré, con su marcada visión y rigor, se convirtió en un punto de partida imprescindible para el desarrollo de numerosas teorías en matemáticas modernas.

El siguiente ensayo es una primera lectura y aproximación a ideas subyacentes a creaciones de Henri Poincaré, conectando y usando ideas de algunos filósofos de las matemáticas como Lautman, Desanti, Chatelet etc.


{% assign pdf_path = 'assets/pdf/Poincaré_y_la_caracterización_de_esferas.pdf' | relative_url %}
{% capture pdf_exists %}{% file_exists assets/pdf/Poincaré_y_la_caracterización_de_esferas.pdf %}{% endcapture %}
{% if pdf_exists == 'true' %}
  <div class="embedded-pdf">
    <object class="pdf-multi-page" data="{{ pdf_path }}" type="application/pdf" width="100%">
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


