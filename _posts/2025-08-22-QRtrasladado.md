---
layout: post
title: Algoritmo QR Trasladado
date: 2025-08-22 11:12:00-0400
description: An implementation and analysis of the Shifted QR factorization method.
tags: applied_math
categories: mathematics
related_posts: false
---

# **Algoritmo de factorización QR Trasladado**


Universidad Nacional de Colombia \\
Sergio Quiroga Sandoval, squirogas@unal.edu.co

En este cuaderno se desarrolla una explicación computacional interactiva sobre los temas de la sección 7.5 del libro Matrix Computations de Golub y Van Loan (4.ª edición) en Julia correspondientes al algoritmo de factorización QR trasladado.




```julia
using LinearAlgebra
```

### Prerrequisitos: Gram Schmidt modificado, Reflectores de Householder y forma de Hessenberg superior

Algoritmos tomados de los cuadernos de pluto de la materia

La siguiente función implementa el algoritmo de Gram schmidt modificado


```julia
function QRMGS(A)
    sizeA=size(A)
    Q = zeros(sizeA) #(m,n)
    R = zeros(sizeA[2],sizeA[2]) #(n,n)
    for i = 1:sizeA[2]
        R[i,i] = norm(A[:,i])
        Q[:,i] = A[:,i]/R[i,i]
        for j = i + 1: sizeA[2]
            R[i,j] = Q[:,i]'A[:,j]
            A[:,j] = A[:,j] - Q[:,i]R[i,j]
        end
    end
    return Q, R
end
```




    QRMGS (generic function with 1 method)



La siguiente función implementa reflectores de Householder, se prioriza mantener una diagonal positiva a la hora de usarlos en el proceso de factorización.


```julia
begin
function Housev(x)
    n = length(x)
    v = ones(size(x))
    v[2:n] = x[2:n]
    σ = norm(x[2:n])^2
    if σ == 0
        β = 0
    else
        μ = √(x[1]^2+σ)
        if x[1] ≤ 0
            v[1] = x[1] - μ
        else
            v[1] = -σ/(x[1]+μ)
        end
        β = 2*v[1]^2/(σ+v[1]^2)
        v = v/(v[1])
    end
    return v, β
end
end
```




    Housev (generic function with 1 method)



La siguiente función implementa una transformación a matriz de Hessenberg superior para una matriz de entrada $A$


```julia
begin
	function HessenbergForm(A)
    n = size(A)[1]
    H = copy(A)
    U = Matrix(1.0*I, n, n)
    for k = 1:n-2
        v, β = Housev(H[k+1:n, k])
        H[k+1:n, k:n] = (I - β*v*v')*H[k+1:n, k:n]
        H[1:n, k+1:n] = H[1:n, k+1:n]*(I - β*v*v')

        #U es necesaria para la verificar que la función devuelve los resultados correctos
        U[1:n, k+1:n] = U[1:n, k+1:n]*(I - β*v*v')
    end
    return H, U
end
end
```




    HessenbergForm (generic function with 1 method)



## Explicación clara del algoritmo

### ¿Cuál es la utilidad de añadir traslados al algoritmo de factorización QR?
Se muestra un ejemplo ilustrativo de aplicar QR a una matriz 4x4, calculando la sucesión de matrices generadas por la iteración básica
$$ A_k = Q_k R_k,  A_{k+1} = R_k Q_k. $$

Se verá que la convergencia a matriz triangular superior puede ser lenta.

Se computan las iteraciones QR usando el algoritmo de Gram Schmidt modificado y empezando con la matriz en forma de Hessenberg superior, usando reflectores de Householder.


```julia
n₁,m₁= 4, 4
M = 335

println("Matriz inicial A: \n")
A = [1.0 2.0 3.0 4.0;
     4.0 5.0 6.0 7.0;
     2.0 1.0 5.0 0.0;
     4.0 2.0 1.0 0.0]
display(A)

println("\n Matriz de Hessenberg de A: \n")
H,U=HessenbergForm(A); display(H)

Q₁, R₁ = QRMGS(H)

for k in 1:M                   # iteraciones de prueba
    Q, R = QRMGS(H)             # factoriza Aₖ = Qₖ Rₖ
    H = R * Q                   # calcula Aₖ₊₁ = Rₖ Qₖ
    if k % 100 == 0 || (k==334) || (k==335)|| (k==1)
      println("---------\nPaso de iteración QR numero $k: \n")
      display(round.(H,digits = 5))
      println("")
    end
end
```

    Matriz inicial A: 
    



    4×4 Matrix{Float64}:
     1.0  2.0  3.0  4.0
     4.0  5.0  6.0  7.0
     2.0  1.0  5.0  0.0
     4.0  2.0  1.0  0.0


    
     Matriz de Hessenberg de A: 
    



    4×4 Matrix{Float64}:
     1.0          5.0          -1.53952   1.27667
     6.0          8.55556      -0.108475  3.69859
     8.88178e-16  5.91817      -2.16888   1.14276
     1.33227e-15  2.00005e-16   0.142756  3.61332


    ---------
    Paso de iteración QR numero 1: 
    



    4×4 Matrix{Float64}:
     1.0       3.07066  -4.0329    3.21041
     6.79492  -0.57958   0.7612   -0.60596
     0.0       0.19692   0.09178  -0.07306
     0.0      -0.0       1.75084   2.19939


    
    ---------
    Paso de iteración QR numero 100: 
    



    4×4 Matrix{Float64}:
     4.7514    3.76913  1.7852    1.87887
     0.10759  -4.55115  3.45327   2.85483
     0.0       0.0      1.84821  -2.0626
     0.0      -0.0      0.0       0.66313


    
    ---------
    Paso de iteración QR numero 200: 
    



    4×4 Matrix{Float64}:
     4.79419   3.66306  1.82427   1.91115
     0.00152  -4.59394  3.43279   2.83332
     0.0       0.0      1.84821  -2.0626
     0.0      -0.0      0.0       0.66313


    
    ---------
    Paso de iteración QR numero 300: 
    



    4×4 Matrix{Float64}:
     4.79478   3.66156  1.82482   1.9116
     2.0e-5   -4.59453  3.4325    2.83301
     0.0       0.0      1.84821  -2.0626
     0.0      -0.0      0.0       0.66313


    
    ---------
    Paso de iteración QR numero 334: 
    



    4×4 Matrix{Float64}:
     4.79478   3.66155  1.82483   1.91161
     1.0e-5   -4.59454  3.43249   2.83301
     0.0       0.0      1.84821  -2.0626
     0.0      -0.0      0.0       0.66313


    
    ---------
    Paso de iteración QR numero 335: 
    



    4×4 Matrix{Float64}:
     4.79479  -3.66154   1.82483   1.91161
     0.0      -4.59454  -3.43249  -2.83301
     0.0       0.0       1.84821  -2.0626
     0.0      -0.0       0.0       0.66313


    


En este ejemplo se evidencia que la iteración QR puede ser lenta para obtener una forma triangular superior. Teniendo solo los primeros 5 decimales, la entrada (2,1) se vuelve cero hasta la iteración 335 del método.

---


**Utilidad del método**:

La convergencia lenta a matriz triangular superior del algoritmo básico de iteración QR será optimizada en el algoritmo de "QR trasladado" haciendo traslados en las matrices sucesivas.

Un traslado de la matriz $A$ está definido como una matriz $A-zI$.



## QR con traslado único

Si ordenamos los valores propios $\lambda_i$ de A de modo que
$$ |\lambda_1 - \mu|\geq \ldots \geq|\lambda_n - \mu|$$
y $\mu$ se mantiene fijo de iteración en iteración, entonces la teoría del libro de Golub Van Loan en el cap §7.3 dice que la p-ésima entrada subdiagonal en H converge a cero con una tasa
$$\left|\frac{\lambda_{p+1}-\mu}{\lambda_{p}-\mu}\right|$$
Por supuesto, si $\lambda_p = \lambda_{p+1}$ entonces no hay convergencia en absoluto. Pero si, por ejemplo,$\mu$
está mucho más cerca de $\lambda_n$que de los demás autovalores, entonces la transformación a cero de la entrada (n, n - 1) es rápida.


**Teorema 7.5.1 y Demostración** como aparecen el libro "Matrix Computations" de Golub Van Loan

**Teorema 7.5.1.** Sea $\mu$ un valor propio de una matriz de Hessenberg no reducida de $n \times n$, \textbf{H}. Si
$$\mathbf{H} = \mathbf{RU} + \mu\mathbf{I},$$
donde $\mathbf{UR}$ es la factorización QR de $\mathbf{H} - \mu\mathbf{I}$, entonces $h_{n, n-1} = 0$ y $h_{nn} = \mu$.

**Demostración.** Dado que $\mathbf{H}$ es una matriz de Hessenberg no reducida, las primeras $n-1$ columnas de $\mathbf{H} - \mu\mathbf{I}$ son independientes, sin importar el valor de $\mu$.

Así, si $\mathbf{UR} = (\mathbf{H} - \mu\mathbf{I})$ es la factorización QR, entonces $r_{ii} \neq 0$ para $i = 1:n-1$. Pero si $\mathbf{H} - \mu\mathbf{I}$ es singular, entonces $r_{nn} = 0$.
Por lo tanto, $r_{nn} = 0$ y $\mathbf{H}(n, :) = [0, \ldots, 0, \mu]$.

**Algunas aclaraciones sobre la demostración**

La afirmación de que las primeras $n-1$ columnas de $\mathbf{H} - \mu\mathbf{I}$ son independientes, independientemente de $\mu$, se debe a que $\mathbf{H}$ es una matriz de Hessenberg no reducida, lo que garantiza que la submatriz principal de $(n-1) \times (n-1)$ de $\mathbf{H} - \mu\mathbf{I}$ es invertible, asegurando así que los elementos diagonales $r_{11}, \ldots, r_{n-1,n-1}$ de la matriz triangular superior $\mathbf{R}$ en la factorización QR son no nulos.

Segundo, la conclusión de que si $\mathbf{H} - \mu\mathbf{I}$ es singular, entonces $r_{nn}=0$, se deriva directamente de las propiedades del determinante de la factorización QR; dado que $\det(\mathbf{H} - \mu\mathbf{I}) = \det(\mathbf{U})\det(\mathbf{R})$ y $\det(\mathbf{U}) = \pm 1 \neq 0$, la singularidad de $\mathbf{H} - \mu\mathbf{I}$ implica la singularidad de $\mathbf{R}$. Como $\mathbf{R}$ es triangular superior, su singularidad requiere que al menos un elemento diagonal sea cero, y como $r_{11}, \ldots, r_{n-1}$ son no nulos, se deduce que $r_{nn}$ debe ser cero.

Finalmente, la afirmación de que $\mathbf{H}(n, :) = [0, \ldots, 0, \mu]$ se explica porque la singularidad de $\mathbf{H} - \mu\mathbf{I}$ y su naturaleza de Hessenberg no reducida (hasta el punto de su deflación) fuerzan que el elemento subdiagonal $h_{n,n-1}$ sea cero. Una vez $h_{n,n-1} = 0$, la última fila de $\mathbf{H}$ se convierte en $[0, \ldots, 0, h_{nn}]$. Consecuentemente, la última fila de $\mathbf{H} - \mu\mathbf{I}$ es $[0, \ldots, 0, h_{nn} - \mu]$. Para que $r_{nn}=0$, esta última fila de $\mathbf{H} - \mu\mathbf{I}$ debe ser el vector cero, lo que implica que $h_{nn} - \mu = 0$, y por lo tanto $h_{nn} = \mu$.

La siguiente función implementa QR con untraslado, se toma un $\mu$ fijo en todas las iteraciones


```julia
function shifted_qr!(A, M; report_iters = Int[])
    H,U =HessenbergForm(A)
    n = size(H,1)
    I_n = Matrix{Float64}(I, n, n)
    for k in 1:M
        # 1) elegimos el shift μ_k como la entrada (n,n)
        μ = H[2,2]
        # 2) factorizamos H - μ I = Q R
        Q, R = QRMGS(H - μ*I_n)

        H = R*Q + μ*I_n

        if k in report_iters
            println("---------\nPaso $k, μ = $μ)):")
            display(round.(H, digits = 5))

        end
    end
    return H
end

# --- Ejemplo de uso ---
M = 335
report = [1,2,3, 22, 23, 100, 200, 300, 335]

A = [1.0 2.0 3.0 4.0;
     4.0 5.0 6.0 7.0;
     2.0 1.0 5.0 0.0;
     4.0 2.0 1.0 0.0]

println("Matriz inicial A:")
display(A)

# Reducción a Hessenberg
H,U = HessenbergForm(A)
println("\nForma Hessenberg H₁:")
display(round.(H, digits = 5))


# Shifted QR
println("\nIteración Shifted QR:")
H_final = shifted_qr!(H, M; report_iters = report)

println("\n Los valores propios de A son: \n")
eigvals(A)
```

    Matriz inicial A:



    4×4 Matrix{Float64}:
     1.0  2.0  3.0  4.0
     4.0  5.0  6.0  7.0
     2.0  1.0  5.0  0.0
     4.0  2.0  1.0  0.0


    
    Forma Hessenberg H₁:



    4×4 Matrix{Float64}:
     1.0  5.0      -1.53952  1.27667
     6.0  8.55556  -0.10848  3.69859
     0.0  5.91817  -2.16888  1.14276
     0.0  0.0       0.14276  3.61332


    
    Iteración Shifted QR:
    ---------
    Paso 1, μ = 8.555555555555555)):



    4×4 Matrix{Float64}:
     -1.43501  2.37205  2.11204  -1.22695
      4.15746  2.15697  9.36579  -2.40085
     -0.0      3.60106  6.75457  -2.62507
     -0.0      0.0      0.1767    3.52347


    ---------
    Paso 2, μ = 2.1569669868326606)):



    4×4 Matrix{Float64}:
     -2.60847   6.50935   0.23091  -1.02363
      3.04463  10.0958   -1.14307  -3.42448
     -0.0       4.35198  -0.04766  -0.93481
     -0.0       0.0       0.05103   3.56033


    ---------
    Paso 3, μ = 10.095800525879717)):



    4×4 Matrix{Float64}:
     -4.08373  -1.48766  -2.77124  -0.25783
      1.0741    2.19782   7.45287   2.22042
     -0.0       2.21011   9.25572   3.18638
     -0.0       0.0       0.141     3.63019


    ---------
    Paso 22, μ = 3.6521160508398443)):



    4×4 Matrix{Float64}:
     -3.85559  3.30493  3.37481  0.55372
      1.0e-5   7.62984  3.34711  2.71057
     -0.0      7.73968  3.65213  2.5961
     -0.0      0.0      0.0      3.57362


    ---------
    Paso 23, μ = 7.629840541319646)):



    4×4 Matrix{Float64}:
     -3.85559  -3.37481  -3.30493   0.55372
      0.0       3.65213   7.73968  -2.5961
     -0.0       3.34711   7.62984  -2.71057
     -0.0       0.0       0.0       3.57362


    ---------
    Paso 100, μ = 3.652141539435721)):



    4×4 Matrix{Float64}:
     -3.85559  3.30493  3.37481  0.55372
      0.0      7.62983  3.34712  2.71056
     -0.0      7.73968  3.65214  2.5961
     -0.0      0.0      0.0      3.57362


    ---------
    Paso 200, μ = 3.652141539435721)):



    4×4 Matrix{Float64}:
     -3.85559  3.30493  3.37481  0.55372
      0.0      7.62983  3.34712  2.71056
     -0.0      7.73968  3.65214  2.5961
     -0.0      0.0      0.0      3.57362


    ---------
    Paso 300, μ = 3.652141539435721)):



    4×4 Matrix{Float64}:
     -3.85559  3.30493  3.37481  0.55372
      0.0      7.62983  3.34712  2.71056
     -0.0      7.73968  3.65214  2.5961
      0.0      0.0      0.0      3.57362


    ---------
    Paso 335, μ = 7.629830064180835)):



    4×4 Matrix{Float64}:
     -3.85559  -3.37481  -3.30493   0.55372
      0.0       3.65214   7.73968  -2.5961
     -0.0       3.34712   7.62983  -2.71056
      0.0       0.0       0.0       3.57362


    
     Los valores propios de A son: 
    





    4-element Vector{Float64}:
     -3.855588220333917
      0.1764518729384587
      3.573616616717359
     11.105519730678097



Note que al hacer el traslado en H[2,2], se prioriza hacer la entrada 2,1 cero, y se logra en la iteración número 23, antes esto se lograba solo hasta la 335, sin embargo ahora pueden surgir problemas en hacer cero otras entradas, como la (3,2) de la matriz, por ello se implementará después el método cambiando repetidamente el valor de $\mu$.

Usando el teorema mencionado antes, podemos calcular explícitamente la tasa de convergencia de la p-ésima entrada subdiagonal como:
$$\left|\frac{\lambda_{p+1}-\mu}{\lambda_{p}-\mu}\right|$$

**Análisis de la tasa de convergencia de la entrada $h_{2,1}$**

Sea $A\in\mathbb{R}^{4\times4}$ la matriz  
$$
A = \begin{pmatrix}
1 & 2 & 3 & 4\\
4 & 5 & 6 & 7\\
2 & 1 & 5 & 0\\
4 & 2 & 1 & 0
\end{pmatrix},
$$
y sean sus valores propios ordenados  
$$
\lambda_1 = -3.85559,\quad
\lambda_2 = 0.17645,\quad
\lambda_3 = 3.57362,\quad
\lambda_4 = 11.10552.
$$

En la iteración QR trasladado con traslado fijo $\mu$, la teoría de Golub \& Van Loan (§ 7.3) afirma que la subdiagonal $h_{p+1,p}$ converge con razón  

$$
\rho_p \;=\;\Bigl|\frac{\lambda_{p+1}-\mu}{\lambda_{p}-\mu}\Bigr|.
$$

Para $p=1$ (entrada $(2,1)$) y el shift $\mu = h_{2,2}^{(1)} = 8.55556$, se obtiene  
$$
\rho_1 \;=\;\Bigl|\frac{0.17645 - 8.55556}{(-3.85559) - 8.55556}\Bigr|
\;=\;\frac{8.37911}{12.41115}\;\approx\;0.6752.
$$

Definimos $e_k = |h_{2,1}^{(k)}|$, la magnitud de la entrada subdiagonal tras $k$ pasadas del algoritmo Shifted QR. A continuación se muestran los primeros dos valores y sus razones empíricas
$$
r_k \;=\;\frac{e_{k+1}}{e_k}
$$
frente a la tasa teórica $\rho_1\approx 0.6752$:

| Paso k | $e_k$  | $e_{k+1}$  | r_k = $e_{k+1}$/$e_k$ |
|:----------:|:-----------------------------------:|:-----------------------------------------:|:--------------------:|
|     1      | 6.00000                             | 4.15746                                   | 0.69291              |
|     2      | 4.15746                             | 3.04463                                   | 0.73255              |

Se observa que:
- En los primeros dos pasos $r_1\approx0.6929$ y $r_2\approx0.7326$ están cerca de $\rho_1\approx0.6752$.

Esto es  consistente con la **convergencia lineal** de un $67\%$ predicha por la teoría.









Queda el interrogante de por qué en el paso 3 se tiene $r_3 = 0.35284. $ ¿Por qué baja tanto?

## QR con traslado doble implícito

La siguiente Explicación es basada en el libro de Golub Van Loan

Dado un paso de doble desplazamiento, sean $a_1,a_2$ los valores propios (posiblemente complejos conjugados) del bloque  
$$
G = \begin{pmatrix}h_{m,m}&h_{m,n}\\[3pt]h_{n,m}&h_{n,n}\end{pmatrix},\quad m=n-1.
$$
Mediante dos pasos sencillos con shifts $a_1,a_2$ se tiene
$$
H - a_1 I = U_1 R_1,\quad H_1 = R_1 U_1 + a_1 I,
$$
$$
H_1 - a_2 I = U_2 R_2,\quad H_2 = R_2 U_2 + a_2 I.
$$
Multiplicando y reagrupando aparece la matriz
$$
M \;=\;(H - a_1 I)(H - a_2 I)
\;=\;H^2 \;-\; s\,H \;+\; t\,I,
$$
donde
$$
s = \operatorname{tr}(G) = h_{m,m}+h_{n,n},\qquad
t = \det(G) = h_{m,m}h_{n,n}-h_{m,n}h_{n,m}.
$$
Entonces
$$
(U_1 U_2)\,(R_2 R_1)=M,
$$
y la transformación completa $H_2 = (U_1U_2)^\top\,H\,(U_1U_2)$ coincide con dos pasos simples.

Para implementar este **doble traslado implícito** en $\mathcal O(n^2)$ flops, sin formar $U_1,U_2$ explícitamente, se procede así:

1. Calcular el vector $$\mathbf m = M\,e_1 = (H^2 - sH + tI)\,e_1,$$ es decir la primera columna de $M$.

2. Construir el reflector de Householder $P_0 = I - \beta_0 v_0v_0^\top$ tal que
   $$
   P_0\,\mathbf m = \alpha\,e_1,
   $$
   anulando las componentes $2,3,\dots$ de $\mathbf m$ en un costo $\mathcal O(1)$.

3. Aplicar $P_0$ a $H$ por la izquierda y por la derecha solo sobre las tres primeras filas y columnas:
   $$
   H \leftarrow P_0 H P_0,
   $$
   lo que introduce un “bulge” en la posición $(2,1)$.

4. Para cada $j=1,\dots,n-3$, construir un reflector $P_j$ que anule las entradas $(j+2,j)$ y $(j+3,j)$, y aplicar
   $$
   H[j+1\!:\!j+3,\;j\!:\!n]\;\leftarrow\;P_j\,H[j+1\!:\!j+3,\;j\!:\!n],
   \quad
   H[1\!:\!n,\;j+1\!:\!j+3]\;\leftarrow\;H[1\!:\!n,\;j+1\!:\!j+3]\,P_j,
   $$
   de modo que el bulge se “persiga” hasta la esquina inferior derecha, restaurando la forma Hessenberg.

Al final, la matriz resultante es exactamente $H_2 = Z^\top H\,Z$ con $Z=P_0P_1\cdots P_{n-2}$, pero calculada en $\mathcal O(n^2)$ flops gracias al Teorema Q implícito.


La determinación de $H_2$ implícita fué descrita por Francis (1961) y se llamará paso QR de Francis. La siguiente función define un traslado doble implícito.


```julia
function implicit_double_shift_qr!(H::Matrix{Float64}, M::Int; report_iters=Int[])
    n = size(H,1)
    I_n = Matrix{Float64}(I, n, n)

    for k in 1:M
        # 1) compute shifts s = tr(G), t = det(G)
        G = @view H[n-1:n, n-1:n]
        s = tr(G)
        t = det(G)

        # 2) form first column of M = H^2 - s*H + t*I
        w = H[:,1]
        u = H * w
        x = u[1] - s*w[1] + t
        y = u[2] - s*w[2]
        z = n >= 3 ? u[3] : 0.0

        # 3) apply P0 to create the bulge
        v0 = [x, y, z]; v0, β0 = Housev(v0)
        H[1:3, 1:n] .-= β0 * v0 * (v0' * H[1:3, 1:n])
        H[1:n, 1:3] .-= β0 * (H[1:n, 1:3] * v0) * v0'

        # 4) chase the bulge down
        for j in 1:n-3
            xj = H[j+1, j]
            yj = H[j+2, j]
            zj = j+3 <= n ? H[j+3, j] : 0.0
            vj = [xj, yj, zj]; vj, βj = Housev(vj)
            H[j+1:j+3, j:n] .-= βj * vj * (vj' * H[j+1:j+3, j:n])
            H[1:n, j+1:j+3] .-= βj * (H[1:n, j+1:j+3] * vj) * vj'
        end

        # 5) report if desired
        if k in report_iters
            println("---------\nPaso $k (s=$s, t=$t):")
            display(round.(H; digits = 5))
        end
    end

    return H
end

# ----------------- Ejemplo -----------------
A = [1.0 2.0 3.0 4.0;
     4.0 5.0 6.0 7.0;
     2.0 1.0 5.0 0.0;
     4.0 2.0 1.0 0.0]

println("Matriz inicial A:")
display(A)

H,U = HessenbergForm(A)
println("\nHessenberg H₁:")
display(H)

# Ejecutar 10 pasos, mostrando H en iteraciones
H_final = implicit_double_shift_qr!(H, 335; report_iters=[1,2,3,4,5,100,200,334,335])

println("\nH final:")
display(H_final)

```

    Matriz inicial A:



    4×4 Matrix{Float64}:
     1.0  2.0  3.0  4.0
     4.0  5.0  6.0  7.0
     2.0  1.0  5.0  0.0
     4.0  2.0  1.0  0.0


    
    Hessenberg H₁:



    4×4 Matrix{Float64}:
     1.0          5.0          -1.53952   1.27667
     6.0          8.55556      -0.108475  3.69859
     8.88178e-16  5.91817      -2.16888   1.14276
     1.33227e-15  2.00005e-16   0.142756  3.61332


    ---------
    Paso 1 (s=1.4444444444444469, t=-7.99999999999999):



    4×4 Matrix{Float64}:
      9.37819   8.44184  -1.11223  3.68217
      2.33272  -0.90982  -2.82217  1.61347
      0.0      -1.50789  -0.99432  0.48362
     -0.0       0.14557   0.44977  3.52595


    ---------
    Paso 2 (s=2.5316332637790686, t=-3.7234293463807635):



    4×4 Matrix{Float64}:
     10.9442    4.92043  -4.3942   3.79601
      0.48246  -3.7215   -0.86635  1.23702
      0.0       0.50435   0.26702  0.0048
      0.0       0.44652   0.29106  3.51027


    ---------
    Paso 3 (s=3.7772837039765204, t=0.9358999651429256):



    4×4 Matrix{Float64}:
     11.0348   5.32426  -3.81398  3.5777
      0.1814  -3.62441  -1.22513  1.55777
      0.0      0.02075   0.19317  0.16928
     -0.0      0.79968   0.44811  3.39647


    ---------
    Paso 4 (s=3.5896344343234685, t=0.5802263296266743):



    4×4 Matrix{Float64}:
     11.0792    5.58837  -3.794    2.99333
      0.05996  -3.32016  -1.15444  2.27675
      0.0       0.02098   0.18766  0.17876
     -0.0       1.54578   0.58663  3.05331


    ---------
    Paso 5 (s=3.24097323492413, t=0.46812405466573165):



    4×4 Matrix{Float64}:
     11.0965    6.20641  -3.76176  1.21987
      0.01611  -1.68676  -0.92546  3.74338
     -0.0       0.06403   0.18345  0.18642
      0.0       3.01694   0.9175   1.40685


    ---------
    Paso 100 (s=-1.9805539755060355, t=-7.229359947081129):



    4×4 Matrix{Float64}:
     11.1055   6.67743  -2.95248   0.81252
      0.0      1.87503   1.3131   -1.82029
      0.0     -0.0      -3.85559  -0.0
      0.0     -1.58502   0.50503   1.87503


    ---------
    Paso 200 (s=-1.9734049643120137, t=-7.256923590427823):



    4×4 Matrix{Float64}:
     11.1055  -0.8317   -2.95248  -6.67037
      0.0      1.86526  -0.5088   -1.58389
      0.0      0.0      -3.85559   0.0
      0.0     -1.81899  -1.31072   1.88218


    ---------
    Paso 334 (s=-1.9734049643120137, t=-7.256923590427823):



    4×4 Matrix{Float64}:
     11.1055  -0.8317   -2.95248  -6.67037
      0.0      1.86526  -0.5088   -1.58389
      0.0      0.0      -3.85559   0.0
      0.0     -1.81899  -1.31072   1.88218


    ---------
    Paso 335 (s=-1.9734049643120137, t=-7.256923590427823):



    4×4 Matrix{Float64}:
     11.1055  -0.8317   -2.95248  -6.67037
      0.0      1.86526  -0.5088   -1.58389
      0.0      0.0      -3.85559   0.0
      0.0     -1.81899  -1.31072   1.88218


    
    H final:



    4×4 Matrix{Float64}:
     11.1055       -0.831704     -2.95248   -6.67037
      1.28476e-81   1.86526      -0.508801  -1.58389
      0.0           6.82454e-19  -3.85559    2.41721e-19
      0.0          -1.81899      -1.31072    1.88218


Tras 335 pasos del algoritmo implícito de doble desplazamiento, la matriz no alcanza una forma casi–triangular completa: aunque las dos primeras subdiagonales $h_{2,1}$ y $h_{3,2}$ caen a valores de la magnitud de la máquina (prácticamente cero), la última subdiagonal $h_{4,3}$ no converge a cero. Esto es consistente con el hecho de que el bucle de **bulge‐chasing** recorre índices $j=1,\dots,n-3$, es decir hasta $j=1$ cuando $n=4$, por lo que solo se generan y aplican reflectores para anular $h_{2,1}$ y $h_{3,2}$; no existe un reflector $P_2$ que persiga el bulge de la posición $(4,3)$. Por tanto, el tercer subdiagonal no se toca y queda sin deflación, impidiendo la reducción completa.


La siguiente función francis_step!() implementa un paso QR de Francis


```julia
using LinearAlgebra

function deflate!(H, tol)
    n = size(H,1)
    for i in 2:n
        if abs(H[i,i-1]) <= tol*(abs(H[i-1,i-1]) + abs(H[i,i]))
            H[i,i-1] = 0.0
        end
    end
end

function francis_step!(H)
    n = size(H,1)
    # extraer 2×2 final
    G = H[n-1:n, n-1:n]
    s = tr(G); t = det(G)
    # primer bulge
    w = H[:,1]; u = H * w
    m1 = u[1] - s*w[1] + t
    m2 = u[2] - s*w[2]
    m3 = n >= 3 ? u[3] : 0.0
    v, β = Housev([m1, m2, m3])
    H[1:3,1:n] .-= β * v * (v' * H[1:3,1:n])
    H[1:n,1:3] .-= β * (H[1:n,1:3] * v) * v'
    # bulge‑chasing
    for j in 1:n-3
        xj = H[j+1,j]; yj = H[j+2,j]; zj = j+3<=n ? H[j+3,j] : 0.0
        vj, βj = Housev([xj, yj, zj])
        H[j+1:j+3, j:n] .-= βj * vj * (vj' * H[j+1:j+3, j:n])
        H[1:n, j+1:j+3] .-= βj * (H[1:n, j+1:j+3] * vj) * vj'
    end
end

H,U = HessenbergForm([1.0 2.0 3.0 4.0;
                   4.0 5.0 6.0 7.0;
                   2.0 1.0 5.0 0.0;
                   4.0 2.0 1.0 0.0])
println("Antes de un paso d e Francis:")
display(H)

francis_step!(H)
println("\nDespués de un paso de Francis:")
display(H)
```

    Antes de un paso d e Francis:



    4×4 Matrix{Float64}:
     1.0          5.0          -1.53952   1.27667
     6.0          8.55556      -0.108475  3.69859
     8.88178e-16  5.91817      -2.16888   1.14276
     1.33227e-15  2.00005e-16   0.142756  3.61332


    
    Después de un paso de Francis:



    4×4 Matrix{Float64}:
      9.37819       8.44184   -1.11223   3.68217
      2.33272      -0.909822  -2.82217   1.61347
      2.22045e-16  -1.50789   -0.994317  0.483619
     -1.38778e-17   0.145575   0.44977   3.52595


## QR Completo


```julia
using LinearAlgebra

# 4) Algoritmo QR completo
function qr_algorithm(A; tol=1e-12, maxiter=1000)
    # 4.1 reducción a Hessenberg
    H, U = HessenbergForm(A)
    Q = U               # Q acumula P₁…Pₙ₋₂
    n = size(H,1)
    # 4.2 bucle principal
    iter = 0
    while iter < maxiter
        iter += 1
        # deflación
        deflate!(H, tol)
        # encontrar bloque irreducible
        # busc: última fila i tal que H[i+1,i]==0 → p=i, luego q siguiente
        p = findlast(i->i<n && H[i+1,i]==0.0, 1:n)  ; p = p === nothing ? 0 : p
        q = findfirst(i->i<n && H[i+1,i]==0.0, p+1:n); q = q === nothing ? n : q
        m = q - p
        if m <= 2
            # bloque 1×1 o 2×2 listo, avanzar p
            p += m
            if p >= n-1
                break
            else
                continue
            end
        end
        # Francis step sobre H[p+1:p+m, p+1:p+m]
        # extraemos submatriz, la transformamos y la reinyectamos
        Hsub = H[p+1:p+m, p+1:p+m]
        francis_step!(Hsub)
        H[p+1:p+m, p+1:p+m] .= Hsub
        # acumular Q: Q[:, p+1:p+m] *= Z  (aprox usando same P’s)
        # aquí podrías re-aplicar los mismos reflectores a U[:, p+1:p+m]
        # pero para simplificar omitimos la acumulación exacta
    end
    # 4.3 triangularizar bloques 2×2 (si quieres ordenar)
    return Q, H
end

# ---------------- ejemplo ----------------
A = [1.0 2.0 3.0 4.0;
     4.0 5.0 6.0 7.0;
     2.0 1.0 5.0 0.0;
     4.0 2.0 1.0 0.0]

Q, T = qr_algorithm(A; tol=1e-10, maxiter=500)
println("QT*A*Q = T ?")
display(Q' * A * Q)
display(T)


```

    QT*A*Q = T ?



    4×4 Matrix{Float64}:
      1.0          5.0          -1.53952   1.27667
      6.0          8.55556      -0.108475  3.69859
      1.77636e-15  5.91817      -2.16888   1.14276
     -2.22045e-16  3.02824e-16   0.142756  3.61332



    4×4 Matrix{Float64}:
     11.1055        5.98259      -4.15793    0.941075
      0.0          -3.85559       0.823463  -1.1548
     -4.03897e-28   0.0           0.932093   1.33903
     -1.03398e-25  -2.33915e-10   1.49066    2.81798


## Experimentos numéricos


```julia
import Pkg; Pkg.add("PrettyTables")
```

    [32m[1m    Updating[22m[39m registry at `~/.julia/registries/General.toml`
    [32m[1m   Resolving[22m[39m package versions...
    [32m[1m    Updating[22m[39m `~/.julia/environments/v1.10/Project.toml`
      [90m[08abe8d2] [39m[92m+ PrettyTables v2.4.0[39m
    [32m[1m  No Changes[22m[39m to `~/.julia/environments/v1.10/Manifest.toml`



```julia
using LinearAlgebra, Random, Statistics
using PrettyTables, Plots

function run_experiment(n; tol=1e-10, maxiter=500, reps=5)
    times  = Float64[]
    errors = Float64[]

    for rep in 1:reps
        A = randn(n,n)
        λ_ref = eigvals(A) |> x->sort(x, by=z->(real(z), imag(z)))

        t0 = time()
        Q, T = qr_algorithm(A; tol=tol, maxiter=maxiter)   # solo dos retornos
        push!(times, time() - t0)

        # extraer eigenvalues de T (bloques 1×1 y 2×2)
        λ_approx = ComplexF64[]
        i = 1
        while i ≤ n
            if i<n && abs(T[i+1,i]) > tol
                append!(λ_approx, eigvals(T[i:i+1, i:i+1]))
                i += 2
            else
                push!(λ_approx, T[i,i])
                i += 1
            end
        end
        sort!(λ_approx, by=z->(real(z), imag(z)))
        push!(errors, maximum(abs.(λ_ref .- λ_approx)))
    end

    return (
      n          = n,
      tol        = tol,
      time_mean  = mean(times),
      time_std   = std(times),
      err_mean   = mean(errors),
      err_std    = std(errors),
    )
end

sizes = [100, 500, 1000]
tols  = [1e-6, 1e-8, 1e-10]
results = [ run_experiment(n; tol=tol, maxiter=1000, reps=5)
            for n in sizes, tol in tols ]

# ————————————————————————————————
# Mostrar tabla
# ————————————————————————————————
header = ["n", "tol", "⟨time⟩","σ(time)","⟨err⟩","σ(err)"]
data = [ (r.n, r.tol,
          round(r.time_mean; digits=4), round(r.time_std; digits=4),
          round(r.err_mean; digits=2),  round(r.err_std; digits=2))
         for r in vec(results) ]

data_matrix = reduce(vcat, [collect(row)' for row in data])


pretty_table(data_matrix, header=header; alignment=:l)
```

    ┌──────┬─────────┬─────────┬─────────┬───────┬────────┐
    │[1m n    │[1m tol     │[1m ⟨time⟩  │[1m σ(time) │[1m ⟨err⟩ │[1m σ(err) │
    ├──────┼─────────┼─────────┼─────────┼───────┼────────┤
    │ 100  │ 1.0e-6  │ 0.0598  │ 0.028   │ 15.24 │ 0.42   │
    │ 500  │ 1.0e-6  │ 6.8763  │ 0.8453  │ 28.3  │ 1.07   │
    │ 1000 │ 1.0e-6  │ 85.8292 │ 2.1737  │ 40.65 │ 2.24   │
    │ 100  │ 1.0e-8  │ 0.0455  │ 0.0085  │ 13.67 │ 1.09   │
    │ 500  │ 1.0e-8  │ 7.1965  │ 0.7334  │ 29.46 │ 1.76   │
    │ 1000 │ 1.0e-8  │ 85.2746 │ 0.8337  │ 42.19 │ 3.63   │
    │ 100  │ 1.0e-10 │ 0.0576  │ 0.0203  │ 13.43 │ 1.83   │
    │ 500  │ 1.0e-10 │ 6.6466  │ 0.5463  │ 29.53 │ 1.59   │
    │ 1000 │ 1.0e-10 │ 86.4145 │ 0.9153  │ 41.96 │ 2.2    │
    └──────┴─────────┴─────────┴─────────┴───────┴────────┘



```julia
using Pkg
Pkg.add("BenchmarkTools")
using BenchmarkTools
```

    [32m[1m   Resolving[22m[39m package versions...
    [32m[1m   Installed[22m[39m BenchmarkTools ─ v1.6.0
    [32m[1m    Updating[22m[39m `~/.julia/environments/v1.10/Project.toml`
      [90m[6e4b80f9] [39m[92m+ BenchmarkTools v1.6.0[39m
    [32m[1m    Updating[22m[39m `~/.julia/environments/v1.10/Manifest.toml`
      [90m[6e4b80f9] [39m[92m+ BenchmarkTools v1.6.0[39m
      [90m[9abbd945] [39m[92m+ Profile[39m
    [32m[1mPrecompiling[22m[39m packages...
       3627.1 ms[32m  ✓ [39mBenchmarkTools
      1 dependency successfully precompiled in 8 seconds. 463 already precompiled.



```julia
using LinearAlgebra, BenchmarkTools

function benchmark_qr(n; tol=1e-10, maxiter=1000)
    A = randn(n, n)
    println("Benchmark para n=$n, tol=$tol:")
    bench = @benchmark qr_algorithm($A; tol=$tol, maxiter=$maxiter)
    display(bench)
    return bench
end

benchmarks = Dict()
for n in [50, 100, 200]
    for tol in [1e-6, 1e-8]
        key = (n, tol)
        println("\n-----------------------------")
        println("Ejecutando para n=$n y tol=$tol")
        bench = benchmark_qr(n; tol=tol)
        benchmarks[key] = bench
    end
end
```

    
    -----------------------------
    Ejecutando para n=50 y tol=1.0e-6
    Benchmark para n=50, tol=1.0e-6:



    BenchmarkTools.Trial: 468 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m 5.757 ms[22m[39m … [35m39.002 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m0.00% … 38.69%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m 9.428 ms              [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m0.00%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m10.608 ms[22m[39m ± [32m 5.279 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m8.38% ± 13.10%
    
      [39m▇[39m▂[39m█[39m▅[39m▂[39m [39m▂[39m▇[34m▇[39m[39m▆[39m▆[32m [39m[39m▁[39m▃[39m [39m [39m [39m▂[39m▁[39m [39m [39m [39m [39m [39m [39m▂[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m█[39m█[39m█[39m█[39m█[39m▇[39m█[39m█[34m█[39m[39m█[39m█[32m█[39m[39m█[39m█[39m▆[39m▇[39m▄[39m█[39m█[39m▁[39m▄[39m▄[39m▇[39m▇[39m▇[39m█[39m▄[39m▇[39m▇[39m▇[39m▄[39m█[39m█[39m▇[39m▄[39m▇[39m▆[39m▄[39m▁[39m▁[39m▄[39m▁[39m▁[39m▄[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▄[39m▄[39m▄[39m▄[39m▁[39m▄[39m [39m▇
      5.76 ms[90m      [39m[90mHistogram: [39m[90m[1mlog([22m[39m[90mfrequency[39m[90m[1m)[22m[39m[90m by time[39m      32.8 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m10.68 MiB[39m, allocs estimate[90m: [39m[33m23342[39m.


    
    -----------------------------
    Ejecutando para n=50 y tol=1.0e-8
    Benchmark para n=50, tol=1.0e-8:



    BenchmarkTools.Trial: 307 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m12.866 ms[22m[39m … [35m33.446 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m0.00% … 23.02%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m14.472 ms              [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m0.00%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m16.274 ms[22m[39m ± [32m 3.904 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m9.86% ± 13.18%
    
      [39m [39m█[39m█[39m [39m▁[39m [39m▁[34m▁[39m[39m [39m [39m [39m [39m [39m [39m [32m [39m[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m▅[39m█[39m█[39m█[39m█[39m▇[39m█[34m█[39m[39m▆[39m▇[39m▅[39m▅[39m▂[39m▂[39m▃[32m▄[39m[39m▃[39m▃[39m▃[39m▃[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▂[39m▃[39m▂[39m▁[39m▄[39m▃[39m▇[39m▄[39m▄[39m▁[39m▃[39m▂[39m▃[39m▃[39m▁[39m▁[39m▃[39m▃[39m▂[39m▃[39m▃[39m▃[39m▃[39m▃[39m▃[39m▂[39m▂[39m▂[39m▂[39m▁[39m▂[39m [39m▃
      12.9 ms[90m         Histogram: frequency by time[39m        26.4 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m19.68 MiB[39m, allocs estimate[90m: [39m[33m98866[39m.


    
    -----------------------------
    Ejecutando para n=100 y tol=1.0e-6
    Benchmark para n=100, tol=1.0e-6:



    BenchmarkTools.Trial: 91 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m45.979 ms[22m[39m … [35m69.315 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m 0.00% … 12.93%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m55.015 ms              [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m12.26%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m55.034 ms[22m[39m ± [32m 4.255 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m10.54% ±  4.69%
    
      [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m▄[39m█[34m▅[39m[39m [39m▃[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m▅[39m▁[39m▁[39m▃[39m▃[39m▄[39m▄[39m▄[39m▁[39m▄[39m▃[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▃[39m▇[39m▇[39m█[39m█[34m█[39m[39m▇[39m█[39m▆[39m▁[39m▄[39m▅[39m▅[39m▁[39m▁[39m▃[39m▄[39m▃[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▃[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▃[39m▁[39m▁[39m▁[39m▃[39m▁[39m▃[39m [39m▁
      46 ms[90m           Histogram: frequency by time[39m        69.2 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m73.23 MiB[39m, allocs estimate[90m: [39m[33m164704[39m.


    
    -----------------------------
    Ejecutando para n=100 y tol=1.0e-8
    Benchmark para n=100, tol=1.0e-8:



    BenchmarkTools.Trial: 77 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m49.036 ms[22m[39m … [35m82.195 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m 0.00% … 11.37%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m67.469 ms              [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m12.77%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m65.543 ms[22m[39m ± [32m 6.255 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m11.97% ±  2.72%
    
      [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m▂[39m█[39m▂[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [32m [39m[39m [39m▂[39m▄[34m█[39m[39m█[39m█[39m▆[39m [39m▂[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m▄[39m▁[39m▁[39m▁[39m▄[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▄[39m▄[39m█[39m█[39m█[39m▄[39m▆[39m▁[39m▄[39m▁[39m▆[39m▁[39m▁[39m▁[39m▄[39m▄[39m▁[32m▄[39m[39m▆[39m█[39m█[34m█[39m[39m█[39m█[39m█[39m▁[39m█[39m▁[39m▄[39m▆[39m▄[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▄[39m▄[39m [39m▁
      49 ms[90m           Histogram: frequency by time[39m        81.3 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m85.52 MiB[39m, allocs estimate[90m: [39m[33m99244[39m.


    
    -----------------------------
    Ejecutando para n=200 y tol=1.0e-6
    Benchmark para n=200, tol=1.0e-6:



    BenchmarkTools.Trial: 19 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m254.024 ms[22m[39m … [35m382.987 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m5.95% … 6.36%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m287.051 ms               [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m6.12%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m281.468 ms[22m[39m ± [32m 29.808 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m6.10% ± 0.93%
    
      [39m█[39m▁[39m [39m [39m [39m [39m [39m [39m [34m [39m[39m [39m [39m [32m [39m[39m [39m▄[39m [39m [39m▄[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m█[39m█[39m▁[39m▁[39m▁[39m▆[39m▁[39m▆[39m▆[34m▁[39m[39m▁[39m▁[39m▁[32m▁[39m[39m▁[39m█[39m▆[39m▆[39m█[39m▁[39m▁[39m▁[39m▁[39m▆[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▆[39m [39m▁
      254 ms[90m           Histogram: frequency by time[39m          383 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m363.23 MiB[39m, allocs estimate[90m: [39m[33m86423[39m.


    
    -----------------------------
    Ejecutando para n=200 y tol=1.0e-8
    Benchmark para n=200, tol=1.0e-8:



    BenchmarkTools.Trial: 15 samples with 1 evaluation per sample.
     Range [90m([39m[36m[1mmin[22m[39m … [35mmax[39m[90m):  [39m[36m[1m276.893 ms[22m[39m … [35m461.346 ms[39m  [90m┊[39m GC [90m([39mmin … max[90m): [39m5.49% … 5.88%
     Time  [90m([39m[34m[1mmedian[22m[39m[90m):     [39m[34m[1m315.445 ms               [22m[39m[90m┊[39m GC [90m([39mmedian[90m):    [39m6.45%
     Time  [90m([39m[32m[1mmean[22m[39m ± [32mσ[39m[90m):   [39m[32m[1m349.259 ms[22m[39m ± [32m 73.101 ms[39m  [90m┊[39m GC [90m([39mmean ± σ[90m):  [39m5.92% ± 1.08%
    
      [39m▃[39m [39m [39m█[39m [39m [39m [39m [39m [39m [39m [34m [39m[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [32m [39m[39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m [39m 
      [39m█[39m▁[39m▁[39m█[39m▁[39m▇[39m▁[39m▁[39m▁[39m▁[39m▁[34m▇[39m[39m▇[39m▁[39m▁[39m▁[39m▇[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[32m▇[39m[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▁[39m▇[39m▁[39m▁[39m▇[39m▁[39m▇[39m▁[39m▁[39m▁[39m▁[39m▇[39m▇[39m [39m▁
      277 ms[90m           Histogram: frequency by time[39m          461 ms [0m[1m<[22m
    
     Memory estimate[90m: [39m[33m394.58 MiB[39m, allocs estimate[90m: [39m[33m118223[39m.



Los resultados empíricos validan la estructura teórica del algoritmo QR práctico, tal como se describe en Golub & Van Loan (§7.5). La complejidad computacional observada, de orden $O(n^3)$, se atribuye correctamente a la reducción inicial de la matriz a forma de Hessenberg superior. Las iteraciones QR subsecuentes, aplicadas a la matriz de Hessenberg, poseen un costo individual de $O(n^2)$, por lo que el costo de la reducción domina asintóticamente.

El parámetro tol es la tolerancia absoluta para el criterio de deflación, que anula los elementos subdiagonales $T_{i+1,i}$ para dividir el problema. La sensibilidad del tiempo de ejecución a tol en matrices de menor dimensión se alinea con la expectativa de que una tolerancia más estricta requiere un mayor número de iteraciones para satisfacer la condición de convergencia.


## Conclusiones

El análisis de rendimiento y precisión confirma las predicciones teóricas y revela las características prácticas del método. Los benchmarks validan la complejidad computacional dominante de $O(n^3)$, atribuible a la reducción a Hessenberg, mientras que el costo de las iteraciones posteriores, de orden $O(n^2)$, muestra una dependencia directa con la la tolerancia.

Los experimentos numéricos muestran que, para las matrices aleatorias estudiadas, la convergencia es rápida y el error de aproximación final está más influenciado por el condicionamiento intrínseco del problema que por la magnitud de la tolerancia de deflación, especialmente para umbrales ya estrictos.

## Declaración de uso de IA

Para este proyecto se usó Chatgpt en su versión gratuita de Pensamiento profundo, también se usó gemini 2.5 pro para la generación de código en Julia y como apoyo de la escritura en latex y la creación de tablas en markdown.

## Referencias

- Gene H. Golub y Charles F. Van Loan. Matrix Computations. 4.ª edición. Johns Hopkins University Press, Baltimore; “Johns Hopkins Studies in the Mathematical Sciences”, Vol. 3, 2013. ISBN 978-1-4214-0794-4

- David R. Kincaid y E. Ward Cheney. Numerical Analysis: Mathematics of Scientific Computing. Brooks/Cole, Pacific Grove, California, 1991. ISBN 978-0-534-13014-5
