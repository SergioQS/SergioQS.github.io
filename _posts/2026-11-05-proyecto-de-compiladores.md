---
layout: post
title: Proyecto de compiladores (en proceso)
date: 2026-11-05 07:31:00-0500
description: Se documenta todo el proceso y el trabajo realizado para el
  proyecto de compiladores.
categories: computation
tags: Compiladores LenguajesDeProgramación
image: https://picsum.photos/id/952/4130/2908
published: true
related_posts: false
citation: true
---

Preparación de proyecto: ideas de aplicaciones útiles de compiladores

1.  Compilador y Optimizador de Circuitos Cuánticos.
2.  Compilador y optimizador de Grafos para Machine Learning: esto se hace compilando grafos de redes neuronales (como ONNX) a código de bajo nivel. Ejemplo: https://onnxruntime.ai/docs/.
    En qué consiste: Crear un compilador que tome un modelo simple (por ejemplo, una red neuronal de capas densas descrita en un JSON o formato gráfico) y aplique optimizaciones de compilador sobre el grafo de computación. Operator Fusion: (fusionar operaciones matemáticas consecutivas para ahorrar lecturas/escrituras en memoria de la GPU), eliminación de subexpresiones comunes y constant folding de tensores.

---

### 1° Idea: Compilador y Optimizador de Circuitos Cuánticos

#### 1. Frontend: Lexer, Parser y AST

El compilador debe comenzar leyendo un archivo de texto con un subconjunto simplificado de **OpenQASM** o un formato JSON estructurado.

- **Ejemplo de entrada (Mini-QASM):**

```qasm
OPENQASM 2.0;
qreg q[3];
h q[0];
cx q[0], q[1];
cx q[1], q[2];
measure q[0] -> c[0];
```

- **Diseño del Lexer y Parser:** Puedes usar herramientas como ANTLR, PLY (Python), o escribir un parser descendente recursivo a mano.
- **Estructura del AST:** Cada instrucción del lenguaje se convierte en un nodo del árbol sintáctico (`GateNode`, `DeclareRegNode`, `MeasureNode`).

---

#### 2. Representación Intermedia (IR): El Grafo de Flujo (DAG)

Una vez validada la sintaxis, el compilador traduce el AST a una Representación Intermedia basada en un **Grafo Acíclico Dirigido (DAG)**, que es infinitamente superior a una lista lineal de instrucciones para optimizar circuitos cuánticos.

- **Nodos ($V$):** Cada nodo representa una puerta cuántica (ej. `H`, `CNOT`, `X`) con sus atributos (matriz asociada, qubits afectados).
- **Aristas ($E$):** Representan la **línea de tiempo (lifeline)** de cada qubit individual. Una arista dirigida desde la puerta $A$ hasta la puerta $B$ en el qubit $q$ significa que $B$ debe ejecutarse estrictamente después de $A$ sobre ese mismo qubit.
- **Ventaja:** Si dos puertas operan sobre qubits independientes, no tienen aristas de dependencia entre sí, lo que permite al compilador reordenarlas libremente.

---

#### 3. Análisis Semántico y Verificación Unitaria

Durante esta fase, el compilador actúa como un validador estricto:

1. **Verificación de Índices:** Comprueba que si el registro cuántico tiene tamaño $N$, ningún comando intente operar sobre un qubit $q[k]$ donde $k \ge N$.
2. **Verificación de Unitaridad:** En la física cuántica, todas las puertas (excepto la medición) deben ser **operadores unitarios** (su matriz conjugada transpuesta debe ser su inversa: $U^\dagger U = I$). El compilador puede verificar mediante multiplicación de matrices que las puertas personalizadas cumplan con esta propiedad.

---

#### 4. Optimizaciones Matemáticas (Fase 1 - Reducción de Puertas)

Esta fase recorre el DAG buscando patrones algebraicos que puedan simplificarse aplicando identidades de matrices unitarias:

- **Anulación de Inversas:** Dos puertas de Hadamard consecutivas en el mismo qubit se cancelan ($H \cdot H = I$). El compilador elimina ambos nodos del DAG.
- **Fusión de Rotaciones de Fase:** Si hay múltiples puertas de rotación ($R_z(\theta_1)$ y $R_z(\theta_2)$) seguidas sobre el mismo qubit, se fusionan en una sola: $R_z(\theta_1 + \theta_2)$.

---

#### 5. Qubit Mapping y Routing (Fase 2 - El Núcleo de Hardware)

Aquí se adapta el software al hardware real.

- **El Problema:** Tienes un grafo de topología física de la computadora cuántica (por ejemplo, una rejilla lineal $0 - 1 - 2 - 3$). El programa lógico pide un `CNOT` entre el qubit $0$ y el $3$, pero no están conectados físicamente.
- **La Solución (Qubit Routing):**

1. El compilador define una **función de mapeo** $\pi: V_{virtual} \to V_{physical}$.
2. Cuando encuentra un `CNOT` entre qubits virtuales cuyos equivalentes físicos no son adyacentes en el grafo de hardware, el compilador debe **inyectar puertas SWAP** (intercambios de estado cuántico) para desplazar los datos hasta que queden adyacentes.
3. Cada `SWAP` se descompone en tres puertas `CNOT`, lo que aumenta el costo del circuito.

---

#### 6. Posible Aporte: Optimizador Heurístico de SWAP (A* o Recocido Simulado)

Dado que minimizar el número de puertas `SWAP` es un problema NP-hard, tu **aporte propio** consistirá en implementar un algoritmo inteligente para decidir _dónde_ insertar los `SWAP`:

- **Función de Costo (Heurística):** Para un estado de mapeo actual, calculas la distancia de Manhattan o la distancia de caminos mínimos en grafos (usando el algoritmo de Dijkstra) entre todos los pares de qubits que necesitan interactuar mediante `CNOT`.
- _*Búsqueda A*:_* El algoritmo explora árboles de decisiones de inserción de `SWAP` eligiendo en cada paso el movimiento que minimiza la distancia total al menor costo posible.
- **Reporte Visual de Salida:** Al finalizar, tu compilador genera un informe comparativo (en consola o mediante una pequeña interfaz gráfica/script de Python con `matplotlib`) que muestra:

1. Cantidad de puertas originales en el AST.
2. Cantidad de puertas tras la optimización algebraica (Fase 1).
3. Cantidad de puertas `SWAP` añadidas por el ruteador físico y el impacto estimado en la fidelidad del circuito cuántico.
