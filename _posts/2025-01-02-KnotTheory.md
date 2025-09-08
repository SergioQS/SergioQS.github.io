---
layout: distill
title: Fundamentals of Knot Theory
date: 2025-01-20 11:12:00-0400
description: An introduction to mathematical knot theory, exploring embeddings, knot complements, and fundamental concepts in topology.
thumbnail: assets/img/3.jpg
tags: mathematics, topology, knots
categories: mathematics
related_posts: false
citation: true
tikzjax: true
---

# Knots

In our daily life we use the words knot and tie, we memorize some knots as tools for handling objects, just as tying our shoes or a rope to climb a hill. However, it is important to think deeply on the concept of knot and define mathematical objects that resemble them; Not only because they exist in t he physical world but also because they underlay important properties of how objects are arranged in spaces, later you will see that we refer to spheres arranged into spheres, and as mathematicians we would like to understand deeply these properties of space.

**Definition.**  
A homeomorphism $\phi:X \rightarrow \phi(X) \subset Y $ is called an **embedding** from $X$ to $Y$.

## Knots and n-knots

To analyze a knot, we do not need to concentrate on the endpoints of the rope, and we would not want to maneuver the endpoints 
 the crossings; taking this into account every time a knot is created, we could put the endpoints in a distant position, sending them to infinity, or we could connect the endpoints of the rope.  
We will in fact connect the endpoints and we will think of knots having no thickness so that their cross-section is a single point. For these reasons every knot will be a way to entangle $\mathbb{S}^{1}$ in euclidean space $\mathbb{R}^{3}$ or the $3$-sphere $\mathbb{S}^{3}$.

**Claim.**  
An embedding $\phi: \mathbb{S}^{1} \rightarrow \mathbb{S}^{3}$ captures the intuitive notion of a **knot**.

However we will define knots in a higher dimensional setting, not only as an immersion of $\mathbb{S}^{1}$  into $\mathbb{S}^{3}$ but a immersions of arbitrary spheres into arbitrary spheres.

**Definition.**  
An embedding $\phi: \mathbb{S}^{n} \rightarrow \mathbb{S}^{m}$ is called a **(n,m) knot**.

For the purpose of the book we will focus on $(1,3)$-knots.

(((prove that $\mathbb{S}^{3}$ can replace $\mathbb{R}^{3}$. conceptos previos de topología necesarios: orientation preserving homeomorphism, planar isotopies)))

**Definition.**  
$K \subset \mathbb{S}^{3} $ is the **knot image of $\phi$** whenever $\phi: \mathbb{S}^{1} \rightarrow \mathbb{S}^{3}$ is an embedding and $\operatorname{Im}(\phi)= K$.

With this definition we are thinking of knot images as closed continuous curves in $\mathbb{R}^{3} $ that do not pass through themselves. This codifies our intuitions of a physical knot.

> It is essential to understand that embeddings and their images are closely related. **Knots** can be conceived as either the **embedding $\phi$** that takes place, or as the **image $\operatorname{Im}(\phi)$** produced by this embedding, the "knot image". Some authors use one or another definition, but in books like Rolfsen both of them are named knots and depending on the context they refer to the embedding or the image.

Artin produced the first non-trivial examples of (2,4)-knots in 1925 by spinning classical knot images $\mathbb{S}^{1} \subset \mathbb{S}^{3}$. (reference).\\ %Artin, Zur Isotopie zweidimensionaler Flächen in R4 , Abh. Math. Seminar Univ. Hamburg 4, 174–177.

## Knot complements

Knot complements are the complement of the knot image $K$.

**Definition.**  
$\mathbb{S}^{m} \smallsetminus K$ is a **Knot complement** if $ K = \operatorname{Im}(\phi)$ for some embedding $\phi: \mathbb{S}^{n} \rightarrow \mathbb{S}^{m}$.

Note that the knot complement $\mathbb{S}^{m} \smallsetminus \phi(\mathbb{S}^{n})$ is created by embedding some space $\mathbb{S}^{n}$ to another space $\mathbb{S}^{m} $ and subsequently removing it.

### Example — Embedding and removing $\mathbb{S}^{1}$ into $\mathbb{S}^{2}$

First we need to choose a homeomorphism $\phi:\mathbb{S}^{0} \rightarrow \mathbb{S}^{3}$

### Example — Embedding and removing $\mathbb{S}^{0}$ into $\mathbb{S}^{1}$

{% raw %}
<script type="text/tikz">
% TikZJax block: \mathbb{S}^0 -> \mathbb{S}^1 visualization
\begin{tikzpicture}
  % Draw \mathbb{S}^0
  \filldraw (0,0.8cm) circle (2pt);
  \filldraw (0,-0.8cm) circle (2pt);
  \node at (0, -1.5) {$\mathbb{S}^0$};

  % Draw arrow to \mathbb{S}^1 with \mathbb{S}^0 inserted
  \draw[->] (1.2,0) -- (1.6,0);

  % Draw \mathbb{S}^1 with \mathbb{S}^0 inserted
  \draw (3,0) circle (1cm);
  \filldraw (3,1cm) circle (2pt);
  \filldraw (3,-1cm) circle (2pt);
  \node at (3, -1.5) {$\phi(\mathbb{S}^0)\subset \mathbb{S}^2$};
  
   % Draw arrow to S^{0}
  \draw[->] (4.2,0) -- (4.6,0);
   % Draw left hemisphere
  \draw (6, 1) arc (95:265:1cm);
  % Draw right hemisphere
  \draw (6.3, -1) arc (-85:85:1cm);
  \node at (6.2, -1.5) {$\mathbb{S}^1 \smallsetminus \phi(\mathbb{S}^0)$};
  
  % Draw arrow to $\mathbb{S}^0$
  \draw[->] (7.6,0) -- (8,0);
\end{tikzpicture}
</script>
{% endraw %}

First we need to choose a homeomorphism $\phi:\mathbb{S}^{0} \rightarrow \mathbb{S}^{1}$

### Example — Embedding and removing $\mathbb{S}^{0}$ into $\mathbb{S}^{2}$

{% raw %}
<script type="text/tikz">
  \centering
  \begin{tikzpicture}
    % Draw \mathbb{S}^0
    \filldraw (0,0.8cm) circle (2pt);
    \filldraw (0,-0.8cm) circle (2pt);
    \node at (0, -1.5) {$\mathbb{S}^0$};

    % Draw arrow to \mathbb{S}^1 with \mathbb{S}^0 inserted
    \draw[->] (1.2,0) -- (1.6,0);

    % Draw \mathbb{S}^1 with \mathbb{S}^0 inserted (shaded sphere)
    \shade[ball color=blue!20] (3,0) circle (1cm);
    \node at (3, -1.5) {$\phi(\mathbb{S}^0)\subset \mathbb{S}^2$};
    \filldraw (3,1cm) circle (2pt);
    \filldraw (3,-1cm) circle (2pt);
    
    % Draw arrow to S^{0}
    \draw[->] (4.2,0) -- (4.6,0);

    % Draw \mathbb{S}^1 with \mathbb{S}^0 removed (shaded)
    \shade[ball color=blue!20] (6,0) circle (1cm);
    \node at (6, -1.5) {$\mathbb{S}^2 \smallsetminus \phi(\mathbb{S}^0)$};
    \filldraw[fill=white] (6,0.95cm) circle (2pt);
    \filldraw[fill=white] (6,-0.95cm) circle (2pt);
    
    % Draw arrow to $\mathbb{S}^0$
    \draw[->] (7.6,0) -- (8,0);
    
    % Draw \mathbb{S}^0
    \draw (9.2,0) ellipse (1cm and 0.4cm);
    \node at (9.2, -1.5) {$\mathbb{S}^0$};
  \end{tikzpicture}
</script>
{% endraw %}

First we need to choose a homeomorphism $\phi:\mathbb{S}^{0} \rightarrow \mathbb{S}^{2}$

### Example — Embedding and removing $\mathbb{S}^{0}$ into $\mathbb{S}^{3}$

First we need to choose a homeomorphism $\phi:\mathbb{S}^{0} \rightarrow \mathbb{S}^{3}$

### Example — Embedding and removing $\mathbb{S}^{1}$ into $\mathbb{S}^{3}$

First we need to choose a homeomorphism $\phi:\mathbb{S}^{1} \rightarrow \mathbb{S}^{3}$

## Projections, crossings and Reidemeister moves

If you tie a knot with a string, you will notice that it can assume various shapes, even when you are tying the same type of knot, it will have a different appearance every time. To mathematically study this phenomenon we will delve into the concepts of knot presentations and Reidemeister moves.

A *Projection* is a two-dimensional representation of a knot in which we do not lose information about its structure.

**Definition.**  
$P:\mathbb{R}^{3}\rightarrow\mathbb{R}^{2}$ is a **projection** whenever $p(x,y,z)=(x,y)$.

Taking into account that the $x,y,z$ axes can be located arbitrarily there are always infinitely different projections of the same knot, but all of them are consistent.

**Definition.**  
A **Crossing** is a point $ x \in P(K)$ such that $P^{-1}(x)\cap K$ has more than one element.

**Definition.**  
A knot $K$ is said to be the **Unknotted** if $K$ is similar to $\mathbb{S}^{1}$.

The simpler projection of the Unknot is $\mathbb{S}^{1}$, which has no crossings. However, take a look at the following projections and convince yourself that they are all, in fact, projections of the unknot.

The following is a projection of the simplest knot which is not the unknot, it is called Trefoil.

You can prove that if a projection of a knot having only one crossing must come from the Unknot. Furthermore, even though it may be challenging to visualize, knots with projections having only two crossings are still trivial knots.

As we observed in the previous section, you can have projections with an arbitrarily large number of crossings for any knot. In fact, you can always introduce additional crossings to a given projection without changing the underlying knot.

For this reason, one of the primary questions in knot theory revolves around devising methods for classifying knots. In particular, consider the following task:

> *Devise a method to establish if a given knot projection represents the unknot.*

This task is quite challenging, but there is a method, conceived by Wolfgang Haken in 1961, that can establish whether a given knot is, in fact, the unknot. For further information see (Haken, 1961).

### Reidemeister Moves

These moves are transformations that preserve the fundamental nature of a specific knot, providing us with our initial tools for recognizing sets of identical knots.

Reidemeister moves are **planar isotopies** that change the relations between the crossings of a projection. There are 3 Reidemeister moves:

1. Adding or removing a twist in the knot.
2. Add or remove two crossings simultaneously.
3. Slide a strand of the knot from one side of a crossing to the other side.

## Similar and equivalent knots

The initial approach to establish the equivalence of two spaces is to check whether they are homeomorphic. However, convince yourself that for knot images, this criterion does not provide useful information. Then, the nature of a knot does not reside on its own points but rather is characterized by how its points are arranged in $\mathbb{S}^{3}$ or the codomain space $\mathbb{S}^{m}$.

**Definition.**  
$K$ and $J$ are said to be **similar knots** if there exists an homeomorphism $\phi:\mathbb{S}^{3} \rightarrow \mathbb{S}^{3}$ such that $\phi(K) = J$.

**Claim.**  
Knot similarity is an equivalence relation.

**Proof.**  
Let us see that it is reflexive, symmetric and transitive.

- Reflexive: a knot $K$ is equivalent to itself by taking $\phi(x) = x$ (which trivially is a homeomorphism).
- Symmetric: given $J,K$ knots, if there exists an homeomorphism $\phi:\mathbb{S}^{3} \rightarrow \mathbb{S}^{3}$ such that $\phi(K) = J$ then, its inverse $\phi^{-1}$ is also a homeomorphism and $\phi^{-1}(J) = K$.
- Transitive: given $J,K,L$ knots, if there exists homeomorphisms $\phi$, $\psi$: $\mathbb{S}^{3} \rightarrow \mathbb{S}^{3}$ such that $\phi(J) = K$ and $\psi(K) = L$. Note that $ (\psi \circ \phi)(x)$ is a homeomorphism and $ (\psi \circ \phi)(J) = (\psi(\phi(J))) = (\psi(K)) = L$, then $J$ and $L$ are similar knots.

**Definition.**  
$K$ and $J$ are said to be **equivalent knots** if there exists an orientation preserving homeomorphism $\phi:\mathbb{S}^{3} \rightarrow \mathbb{S}^{3}$ where $\phi(K) = J$.

## Composite and prime knots

Now we will explore the concept of knot composition: Can intricate knots be decomposed into simpler ones?

**Definition.**  
$k\textit{#}J$ denotes the composition of knots $k$ and $J$. This operation is defined by cutting a portion of a knot image $k$ and a portion of a knot image $J$ and then joining the resulting endpoints together, ensuring that no crossings are created or destroyed in the process.

**Definition.**  
$K$ is a Composite knot if there exist two non-trivial knots $I,J$, named factor knots, such that $I\textit{#}J = K$.

**Example.**  
The granny knot is composite.

**Definition.**  
$K$ is a Prime knot if it is not composite.

**Examples.**  
- The figure eight knot is prime.  
- The Cinquefoil knot is prime.  
- The three-twist knot is prime.

## Level preserving and Ambient isotopies

**Definition.**  
Two embeddings $\phi,\psi: X\rightarrow Y$ are called **Isotopic** if there exists an embedding $F:X\times I \rightarrow Y \times I$ (here $I$ denotes the unit interval).

**Definition.**  
Two embeddings are **Ambient isotopic** if ... (completar definición).

Planar isotopies are continuous transformations of the projection of a knot.

## Knot invariants

There exists a variety of knot invariants; in this chapter we will study some of them.

### Tricoloration of knots
### Crossing number
### Fundamental group of a knot
### Jones Polynomial
### Alexander polynomial