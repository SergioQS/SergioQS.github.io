---
layout: post
title: Proyecto de compiladores (en proceso)
date: 2026-11-05 07:31:00-0500
description: Se documenta todo el proceso de trabajo realizado para el proyecto
  de compiladores.
categories: computation
tags: Compiladores LenguajesDeProgramación
image: https://images.unsplash.com/photo-1792718291248-f09734a68d6f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D
published: true
related_posts: false
citation: true
---

Preparación de proyecto: ideas de aplicaciones útiles de compiladores

---

<details>
<summary>
1° Idea: Compilador y Optimizador de Circuitos Cuánticos
</summary>

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

- **Diseño del Lexer y Parser:** usar herramientas como ANTLR, PLY (Python).
- **Estructura del AST:** Cada instrucción del lenguaje se convierte en un nodo del árbol sintáctico (`GateNode`, `DeclareRegNode`, `MeasureNode`).

---

#### 2. Representación Intermedia: El Grafo de Flujo (DAG)

Una vez validada la sintaxis, el compilador traduce el AST a una Representación Intermedia basada en un **Grafo Acíclico Dirigido (DAG)**, que es superior a una lista lineal de instrucciones para optimizar circuitos cuánticos.

- **Nodos ($V$):** Cada nodo representa una puerta cuántica (ej. `H`, `CNOT`, `X`) con sus atributos (matriz asociada, qubits afectados).
- **Aristas ($E$):** Representan la **línea de tiempo (lifeline)** de cada qubit individual. Una arista dirigida desde la puerta $A$ hasta la puerta $B$ en el qubit $q$ significa que $B$ debe ejecutarse estrictamente después de $A$ sobre ese mismo qubit.

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

#### 5. Qubit Mapping y Routing.

Aquí se adapta el software al hardware real.

- **El Problema:** Se tiene un grafo de topología física de la computadora cuántica (por ejemplo, una rejilla lineal $0 - 1 - 2 - 3$). El programa lógico pide un `CNOT` entre el qubit $0$ y el $3$, pero no están conectados físicamente.
- **Solución (Qubit Routing):**

1. El compilador define una **función de mapeo** $\pi: V_{virtual} \to V_{physical}$.
2. Cuando encuentra un `CNOT` entre qubits virtuales cuyos equivalentes físicos no son adyacentes en el grafo de hardware, el compilador debe **añadir puertas SWAP** para desplazar los datos hasta que queden adyacentes.
3. Cada `SWAP` se descompone en tres puertas `CNOT`, lo que aumenta el costo del circuito.

---

#### 6. Posible Aporte: Optimizador Heurístico de SWAP (A* o Recocido Simulado)

Dado que minimizar el número de puertas `SWAP` es un problema NP-hard, el **aporte propio** consistiriá en implementar un algoritmo para decidir _dónde_ insertar los `SWAP`.
</details>
<details>
<summary>
2° Idea (escogida): Reproducción de "The Neural Compiler" + visualizador del AST
</summary>

Reproducir el compilador del artículo _The Neural Compiler_ (Sheneman, 2026): traduce expresiones matemáticas con sintaxis de **Scheme** a módulos de **PyTorch** (`nn.Module`) que calculan la expresión exactamente y se pueden derivar. Así una red neuronal puede usar una ecuación física conocida sin tener que aprenderla. Se entiende cada fase, se reproducen ejemplos y resultados del artículo, y se agrega un visualizador como aporte propio.

---

#### 1. Frontend: Lexer, Parser y AST

El compilador lee una sola expresión en notación de Scheme (prefija, entre paréntesis).

- **Ejemplo de entrada (ley de gravitación):**

```scheme
(/ (* G (* m1 m2)) (pow r 2))
```

- **Lexer:** separa paréntesis, corchetes, números, `#t`/`#f` e identificadores, e ignora comentarios `;`. `[1 2 3]` se convierte en `(vec 1 2 3)`.
- **Parser:** descendente recursivo, escrito a mano.
- **Nodos del AST:** `Const`, `Var`, `App` (aplicar una operación), `If`, `Let`, `Lambda`, `Letrec`, `Loop`, `Recur`.
- **Lenguaje:** 51 operaciones entre aritméticas, trigonométricas, comparaciones, lógicas, vectores (`dot`, `cross`, `norm`…), matrices (`matmul`, `det`, `inv`…) y control (`let`, `if`, `loop`/`recur`, `letrec`).

---

#### 2. Representación Intermedia 1: A-Normal Form (ANF)

El AST se aplana para que cada operación reciba solo constantes o variables. Cada subexpresión compuesta queda guardada en una variable temporal.

```
(* (+ x 1) (- y 2))
→ let __arg0 = (+ x 1) in
  let __arg1 = (- y 2) in
  (* __arg0 __arg1)
```

- **Ventaja:** cada `let` corresponde exactamente a una operación, que será un nodo del grafo.

---

#### 3. Optimización: recursión de cola → ciclo

- Si una función recursiva (`letrec`) solo se llama a sí misma al final (posición de cola), se convierte en un ciclo `loop`/`recur`.
- **Ejemplo:** el factorial con acumulador pasa a ser un ciclo. Fibonacci, que hace dos llamadas que no son de cola, se queda como recursión.

---

#### 4. Representación Intermedia 2: Grafo de cómputo (DAG)

- **Nodos:** entradas, constantes y operaciones.
- **Aristas:** van de quien produce un valor a quien lo usa.
- Los cuerpos de ciclos y funciones recursivas se compilan como subgrafos aparte, así el grafo principal sigue sin ciclos.
- **Análisis semántico mínimo:** variables no definidas y `recur` fuera de un `loop` o con un número equivocado de argumentos.

---

#### 5. Backend: módulo de PyTorch (DirectModule)

El grafo se recorre en orden topológico y se convierte en una lista plana de instrucciones sobre _slots_.

```
slot[0] = x
slot[1] = y
slot[2] = 1.0
slot[3] = slot[0] + slot[2]
slot[4] = 2.0
slot[5] = slot[1] - slot[4]
slot[6] = slot[3] * slot[5]   ← salida
```

- Cada instrucción es una operación de PyTorch, así que autograd calcula los gradientes exactos.
- Evalúa un valor o un lote completo en paralelo, en CPU o GPU.
- El módulo no tiene pesos propios: las constantes que se quieren aprender (G, k…) entran como `nn.Parameter` externos.

---

#### 6. Uso: modelos híbridos y resultados a reproducir

Tres formas de combinar el módulo compilado con una red:

1. **Estructura conocida, constantes desconocidas:** se compila la ecuación y se entrenan solo sus constantes.
2. **Término conocido + corrección aprendida:** módulo compilado más una MLP.
3. **Composición:** varios módulos compilados en cadena, sin acumular error.

Resultados del artículo que se reproducen: recuperar constantes de 15 leyes de Feynman, dos EDOs (Lotka-Volterra y péndulo), la ecuación del calor, mecánica vectorial 3D y cadenas de composición, comparando contra PyTorch escrito a mano, PINNs y MLPs.

---

#### 7. Aporte propio: visualizador de las fases del compilador

Hoy el compilador no muestra ninguna fase intermedia. El aporte es un módulo en Python que dibuja, para un mismo programa:

1. el **AST**;
2. el **ANF**;
3. el **grafo de cómputo**, con el valor de cada nodo al evaluar;
4. la **secuencia de instrucciones**.

Librerías: `graphviz` o `networkx` + `matplotlib`. Sirve para entender el compilador y para el video, que pide mostrar qué ocurre en cada fase.

</details>

<details>
<summary>
2° idea Repositorio y código: recuento de los archivos disponibles
</summary>

#### 1. Referencias

- **Artículo:** L. Sheneman, _The Neural Compiler: Program-to-Network Translation for Hybrid Scientific Machine Learning_, arXiv:2605.22498 (21 de mayo de 2026), 21 páginas.
- **Repositorio:** https://github.com/sheneman/neural_compiler (licencia MIT). Revisado en el commit `8e15381` del 22 de mayo de 2026, que es el único commit público.
- **Requisitos:** Python 3.10+ y PyTorch 2.0+. Los ejemplos usan además `numpy` y `matplotlib`; el péndulo usa `torchdiffeq` (opcional) y los benchmarks usan `pandas` y, si está instalado, Guile Scheme.

**Uso básico:**

```python
from neural_compiler.compiler import compile_scheme, run_scheme
from neural_compiler.evaluator import DirectModule

graph = compile_scheme("(/ (* G (* m1 m2)) (pow r 2))",
                       inputs={"G": None, "m1": None, "m2": None, "r": None})
model = DirectModule(graph)          # nn.Module listo para usar dentro de una red

run_scheme("(+ (* 3 x) (- y 1))", {"x": 4.0, "y": 7.0})   # 18.0
```

---

#### 2. Recuento del código disponible

| Carpeta            | Líneas de Python | Qué contiene                                                        |
| ------------------ | ---------------- | ------------------------------------------------------------------- |
| `neural_compiler/` | 2.961            | El compilador: parser, ANF, TCO, grafo, primitivas y evaluadores    |
| `tests/`           | 4.703            | 589 pruebas unitarias y de integración                              |
| `examples/`        | 8.486            | Los 6 experimentos del artículo y 9 demos de arquitecturas híbridas |
| `benchmarks/`      | 1.662            | Medición de rendimiento, gráficas y resultados en CSV               |

No hay ningún visualizador en el repositorio: ni del AST, ni del ANF, ni del grafo.

---

#### 3. Archivos de cada fase del compilador

| Fase                 | Archivo                                      | Líneas | Funciones y clases clave                                                                                                                                   |
| -------------------- | -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orquestación         | `neural_compiler/compiler.py`                | 65     | `compile_scheme()` (parse → ANF → TCO → grafo) y `run_scheme()`                                                                                            |
| Lexer y parser       | `neural_compiler/parser/scheme_parser.py`    | 219    | `tokenize`, `_parse_sexpr` (tokens → listas anidadas), `_sexpr_to_ast` (listas → AST), `parse`                                                             |
| AST                  | `neural_compiler/parser/ast_nodes.py`        | 104    | Nodos como dataclasses inmutables y `PRIMITIVES` (43 operaciones)                                                                                          |
| ANF                  | `neural_compiler/anf/transform.py`           | 184    | `to_anf`, `_normalize` y `_NameGen` (genera `__arg0`, `__cond0`…)                                                                                          |
| ANF                  | `neural_compiler/anf/anf_nodes.py`           | 93     | `ANFConst`, `ANFVar`, `ANFLet`, `ANFIf`, `ANFApp`, `ANFLambda`, `ANFLoop`, `ANFRecur`, `ANFLetrec`                                                         |
| TCO                  | `neural_compiler/anf/tco.py`                 | 215    | `optimize_tco` y `_replace_tail_calls` (falla si hay una llamada que no es de cola)                                                                        |
| Grafo                | `neural_compiler/graph/builder.py`           | 389    | `build_graph`, `ComputeGraph`, `GraphNode`, `LoopBody`, `FunctionBody`, `resolve` (error `Undefined variable`), `topological_order`, `depth`               |
| Primitivas           | `neural_compiler/ops/primitives.py`          | 278    | `OP_TABLE`: cada operación con su función de PyTorch. Vectores con `dim=-1` y matrices con `dim=-2` para soportar lotes                                    |
| Backend principal    | `neural_compiler/evaluator/direct_module.py` | 687    | `DirectModule`, `_compile_instructions` (tipos `CONST`, `INPUT`, `UNARY`, `BINARY`, `IF`, `LOOP`, `CALL`, `RECUR`, `VARIADIC`), `forward`, `forward_batch` |
| Evaluador secuencial | `neural_compiler/evaluator/engine.py`        | 321    | `evaluate()`: ciclo de Python sobre los nodos. Lento, pero el más fácil de leer                                                                            |
| Evaluador anterior   | `neural_compiler/evaluator/gnn_module.py`    | 242    | `SchemeGNN`. El nombre «GNN» es histórico: no se usa PyTorch Geometric                                                                                     |

Detalles del backend:

- Las constantes se guardan como _buffers_ de PyTorch. El módulo **no tiene parámetros entrenables** (`parameters()` está vacío).
- Los ciclos se evalúan iterando el subgrafo del cuerpo, con un máximo de 10.000 iteraciones. La recursión general tiene un límite de profundidad de 10.000.

---

#### 4. Archivos de los ejemplos híbridos

| Patrón del artículo                                           | Archivos                                                                                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1. Estructura conocida, parámetros desconocidos               | `feynman_coefficient_learning.py`, `ode_lotka_volterra.py`, `pde_heat_equation.py`, `vector_mechanics.py`                  |
| 2. Término conocido + corrección aprendida                    | `ode_damped_pendulum.py` (escenario 2), `pde_heat_equation.py` (experimento 2), `hybrid_cnn_physics.py`                    |
| 3. Composición                                                | `compositional_generalization.py`, `hybrid_composition.py`, `hybrid_deep_composition.py`, `hybrid_residual_composition.py` |
| Extra, no está en el artículo (una red elige qué módulo usar) | `hybrid_routing.py`, `hybrid_library.py`, `hybrid_interfacing.py`, `hybrid_recursive.py`, `structural_routing.py`          |

Todos están en `examples/`.

---

#### 5. Experimentos del artículo y su script

| Sección del artículo                        | Script                                                                                       | Figura que genera                       | Notas                                                                                                                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 Ecuaciones de Feynman (Tabla 1, Fig. 3) | `examples/feynman_coefficient_learning.py`                                                   | `feynman_coefficient_learning.png`      | Por defecto usa 5.000 épocas y 1% de ruido; el artículo dice 3.000 y 2%. Hay que pasar `--epochs 3000 --noise 0.02`. `--equations` corre solo algunas y `--sample-efficiency` hace el análisis con pocos datos |
| 3.2 Lotka-Volterra (Tabla 2, Figs. 4 y 5)   | `examples/ode_lotka_volterra.py`                                                             | `ode_lotka_volterra.png` y `_phase.png` |                                                                                                                                                                                                                |
| 3.3 Péndulo amortiguado (Tabla 3, Fig. 6)   | `examples/ode_damped_pendulum.py`                                                            | `ode_damped_pendulum.png`               | `--no-forcing` para la variante sin fuerza externa; `--skip-neural-ode` si no hay `torchdiffeq`                                                                                                                |
| 3.4 Ecuación del calor (Tabla 4, Fig. 7)    | `examples/pde_heat_equation.py`                                                              | `pde_heat_equation.png`                 | 2.000 épocas por defecto                                                                                                                                                                                       |
| 3.5 Mecánica vectorial 3D (Fig. 8)          | `examples/vector_mechanics.py`                                                               | `vector_mechanics.png`                  |                                                                                                                                                                                                                |
| 3.6 Composición (Tabla 5, Fig. 9)           | `examples/compositional_generalization.py`                                                   | `compositional_generalization.png`      |                                                                                                                                                                                                                |
| 4 Costo computacional (Tablas 6 y 9)        | `benchmarks/run_benchmarks.py`, `benchmarks/plot_benchmarks.py`, `benchmarks/slurm_bench.sh` | 10 PDF en `benchmarks/figures/`         | Los resultados originales (RTX 4090) vienen en los CSV; las gráficas se pueden regenerar sin GPU con `plot_benchmarks.py`                                                                                      |

- Los seis scripts de experimentos aceptan `--save-fig` y `--plot-only`. Esta última redibuja la figura desde los datos guardados sin volver a entrenar.
- Las figuras 1, 2 y 10 del artículo no las genera ningún script.

---

#### 6. Pruebas

- **Carpetas:** `tests/unit/` (12 archivos) y `tests/integration/` (8 archivos).
- **Qué cubren:** parser, ANF, TCO, grafo, primitivas, vectores y matrices, evaluadores, lotes, ciclos, recursión y composición.
- **Resultado verificado:** `pytest tests/` da **570 que pasan y 19 que se omiten** (589 en total, como dice el README).

---

#### 7. Lo que ya se verificó al correr el código

- **La Figura 2 del artículo** se reproduce: mismo AST, mismo ANF, mismo grafo y misma secuencia de instrucciones.
- **Los ejemplos del README** dan lo esperado: `17.0`, `32.0` (producto punto) y `3628800.0` (factorial con `loop`).
- **Ecuación del calor con 300 épocas,** en CPU, unos 2 minutos:

| Modelo         | Error en α | MSE interpolación | MSE extrapolación |
| -------------- | ---------- | ----------------- | ----------------- |
| Compilado      | 0,00%      | 5,1e-15           | 8,7e-15           |
| Escrito a mano | 0,00%      | 5,1e-15           | 8,7e-15           |
| PINN           | 955%       | 8,9e-1            | 5,6e-1            |
| MLP            | —          | 2,5e-2            | 7,5e-2            |

Compilado y escrito a mano coinciden exactamente, como en la Tabla 4. El PINN sale peor que en el artículo (92,7%) porque entrenó con menos épocas.

---

#### 8. Diferencias entre el artículo y el código

1. **`sqrt` y `log` no son exactos en 0.** El código hace `sqrt(clamp(x, min=1e-8))` (en `ops/primitives.py` y `evaluator/direct_module.py`). Por eso `(sqrt 0)` da `0,0001` y no `0`, y `(log 0)` da `-18,4` en vez de error. La raíz de un negativo tampoco da error: devuelve `0,0001` en silencio. Esto contradice el Teorema 2 en el borde del dominio, porque 0 sí está en el dominio de `sqrt`.
2. **El `if` evalúa las dos ramas.** Se implementa como `sel·then + (1−sel)·else`. Así, `(if (= x 0) 7 (/ 1 x))` con `x = 0` da `NaN` en vez de `7`: la rama no tomada da infinito y `0·∞ = NaN`. En Scheme real esa rama nunca se calcularía.
3. **`freeze()` no existe.** El README llama a `compiled.freeze()`, pero `DirectModule` no tiene ese método y daría `AttributeError`.
4. **Las ecuaciones del script no son exactamente las de la Tabla 7.** Por ejemplo:
   - la Tabla 7 tiene «Heat mcΔT» y el script tiene conducción de Fourier `κ(T2−T1)A/d`;
   - la gaussiana del script no tiene el factor de normalización;
   - la Tabla 7 usa el factor de Lorentz y el script la masa relativista `m0/√(1−v²/c²)`.
5. **Parámetros por defecto distintos** en el script de Feynman: épocas y ruido (ver la sección 5).
6. **Los lotes no soportan todo.** `forward_batch()` lanza `NotImplementedError` con recursión general (`letrec`) y con ciclos anidados.
7. **Nombres de temporales:** el artículo muestra `__t0` y `__t1`; el código genera `__arg0` y `__arg1`.

---

#### 9. Dónde se conecta el visualizador

| Fase a dibujar     | De dónde sale                                                  | Cómo recorrerla                                                                                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| AST                | `parse(src)` en `parser/scheme_parser.py`                      | Dataclasses: recorrer los hijos con `dataclasses.fields()`                                                                     |
| ANF                | `to_anf(ast)` en `anf/transform.py` (y `optimize_tco` después) | Igual que el AST: cadena de `ANFLet` anidados                                                                                  |
| Grafo              | `compile_scheme(src, inputs)` en `compiler.py`                 | `graph.nodes` (con `op_type` y `value`) e `input_edges` para las aristas; `graph.loops` y `graph.functions` para los subgrafos |
| Instrucciones      | `DirectModule(graph)._instructions`                            | Lista de tuplas `(tipo, slot, datos)`                                                                                          |
| Valores al evaluar | `DirectModule.forward_batch_with_intermediates(inputs)`        | Devuelve el valor de cada slot                                                                                                 |

- **Librerías:** `graphviz` (dibujos de árboles limpios, exporta PNG o SVG; necesita instalar el programa Graphviz), `networkx` + `matplotlib` (no necesita nada externo) o `anytree` (árboles en texto en la terminal).
- **Archivos nuevos propuestos:** `neural_compiler/visualize.py`, un script de demostración en `examples/` y pruebas en `tests/unit/`.

</details>
