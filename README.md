# Simulador de Bloques

Construye una herramienta educativa interactiva en español llamada "Simulador de minería". Es una página autocontenida que enseña visualmente qué es minar Bitcoin. No necesita backend, ni base de datos, ni llamadas a APIs externas: todo se ejecuta en el navegador.

Público objetivo

Personas apasionadas por la minería de Bitcoin pero sin conocimientos técnicos, y también empresas que compran unidades por volumen para regalar a sus empleados. La herramienta debe resultar seria y creíble para ambos.








IDENTIDAD VISUAL (obligatoria y aplicable a toda la web, no solo a esta página)

Concepto rector

Instrumento de precisión, editorial técnico. La referencia mental es el instrumental de medición y la documentación técnica seria — no una fintech, no un producto cripto. El sector entero usa terminales oscuras con verde fosforito y naranja Bitcoin; nosotros nos diferenciamos por sobriedad, calidez tipográfica y un sistema de bitono: bloques que alternan entre fondo claro cálido y fondo oscuro cálido, nunca gris frío ni azulado.




Debe transmitir que esto NO es minería cloud, ni reventa, ni un proyecto de aficionados — es una plataforma seria y profesional, comprensible sin conocimiento técnico previo.

Paleta

Estos cuatro colores son toda la paleta. No añadas ninguno más. Es una paleta cálida — evita cualquier hex con componente azulado.




Nombre

Hex

Uso

Crema

#F0EDE4

Fondo de bloques claros y de tarjetas

Negro cálido

#1A1A18

Texto sobre fondo claro. Fondo de bloques oscuros (bitono)

Piedra

#7A756B

Texto secundario, etiquetas, bordes — SOLO sobre fondo Crema

Verde instrumental

#0E7C6B

Acento único sobre fondo claro. Botón principal, dato activo, estado de éxito




Regla de bitono — dos variantes obligatorias para fondo oscuro: Ningún color calibrado para Crema funciona igual sobre Negro cálido. Cuando un bloque use fondo Negro cálido:




Texto principal: Crema al 100% (#F0EDE4).

Texto secundario: Crema en rgba(240,237,228,0.5) — no un gris nuevo, es el mismo Crema atenuado.

Bordes/separadores: Crema en rgba(240,237,228,0.15).

El Verde instrumental se aclara a #3FBFA6 sobre este fondo — única variante de color permitida, solo dentro de bloques oscuros.




Reglas de color:




El verde de acento (en cualquiera de sus dos variantes) se usa con avaricia: botón primario, el hash cuando se encuentra, y poco más.

Nada de naranja Bitcoin. Nada de verde fosforito. Nada de azul en ningún tono.

Para señalar un intento fallido no uses rojo de alarma: basta con dejar el hash en Piedra (o Crema atenuado sobre fondo oscuro) y reservar el Verde instrumental para el acierto. Minar es fallar millones de veces; fallar es lo normal, no un error.

Indexado numérico

Recurso de layout: prefijos tipo 001 /, 002 / en cabeceras de bloque, en IBM Plex Mono 11px, color Piedra sobre Crema o Verde instrumental sobre Negro cálido. No es decorativo — numera bloques reales en orden de aparición.

Tipografía

Carga desde Google Fonts:




Space Grotesk — titulares y todo el texto corrido. Pesos 400 y 500 únicamente.

IBM Plex Mono — hashes, nonces, cifras numéricas e indexado.




Reglas tipográficas:




Titulares: Space Grotesk 500, letter-spacing: -0.5px.

Texto: Space Grotesk 400, line-height: 1.7.

La monoespaciada no es decoración. Solo aparece donde hay un dato técnico real. No la uses en etiquetas de sistema, botones, títulos ni párrafos.

Nunca pesos 600 o 700. Nunca mayúsculas completas salvo en etiquetas mono muy cortas — el cuerpo de texto siempre en sentence case.

Prohibido

Gradientes · sombras · desenfoques · glow · iconos decorativos · animaciones de entrada · badges de colores · emoji · más de dos pesos tipográficos · cualquier tono azulado o frío en la paleta.

Tono de voz

Cercano-explicativo, nunca neutro-burocrático. Habla al usuario de tú, en presente, explicando lo que está viendo.




Bien: "Tu navegador ha probado 15.847 combinaciones. Ninguna ha valido."

Mal: "Se han realizado 15.847 intentos de hash en 3,2 segundos."




Más reglas de escritura:




Sin jerga sin explicar. Si aparece un término técnico, se explica al lado.

Sin signos de exclamación en los textos de sistema.

Sin "simplemente", "fácilmente", "solo tienes que". No presupongas.

Frases cortas. Un concepto por frase.








REQUISITO CRÍTICO: MÓVIL PRIMERO

La mayoría del tráfico será móvil. Diseña mobile-first y adapta hacia arriba:




Móvil (< 640px): una sola columna vertical. Los campos del bloque colapsados en acordeón. El hash y el contador siempre visibles sin hacer scroll durante la simulación.

Tablet (640–1024px): dos columnas donde tenga sentido.

Escritorio (> 1024px): panel de configuración a la izquierda, área de simulación a la derecha.

El hash hexadecimal es largo: en móvil debe partirse con word-break: break-all, nunca desbordar ni provocar scroll horizontal.

Área táctil mínima de 44x44px en todos los controles.

Nada dependiente de hover como única vía de acceso a información. Los tooltips deben abrirse también al tocar.








ESTRUCTURA DE LA PÁGINA

1. Cabecera

Título y una frase que explique qué van a ver. Tono cercano-explicativo. Ejemplo: "Minar Bitcoin consiste en probar combinaciones hasta dar con la correcta. Aquí lo vas a ver en directo, en tu propio navegador."

2. El bloque (panel de entrada)

Muestra un header de bloque simplificado con estos campos. Cada uno con etiqueta clara y explicación de una línea:




Bloque anterior — valor de ejemplo prerrellenado, editable. "Cada bloque apunta al anterior. Así se forma la cadena."

Raíz de transacciones (Merkle root) — valor de ejemplo prerrellenado, editable. "Un resumen de todas las transacciones que contiene el bloque."

Marca de tiempo — fecha/hora actual. "Cuándo se creó el bloque."

Nonce — NO editable por el usuario: es el número que el simulador va cambiando. Muéstralo cambiando en vivo. "El único campo que el minero puede cambiar libremente. Es lo que se prueba una y otra vez."




En móvil, este panel va dentro de un acordeón plegable titulado "Ver el contenido del bloque", cerrado por defecto.

3. Control de dificultad

Slider de 1 a 5, valor inicial 3. Etiqueta: "Dificultad: ¿cuántos ceros debe tener el resultado al principio?"




Aviso dinámico que cambia con el valor:




1–2: "Fácil. Lo encontrarás casi al instante."

3: "Equilibrado. Unos segundos."

4: "Difícil. Puede tardar bastante."

5: "Muy difícil. Puede tardar mucho, o no encontrarlo. Así se siente la minería real."




Este es el momento educativo más importante: que el usuario suba la dificultad y note cómo se dispara el tiempo.

4. Área de simulación

Botones: Empezar a minar / Parar / Reiniciar. El primario en Verde instrumental, los demás con borde Piedra sobre fondo transparente.




Mientras corre, muestra en IBM Plex Mono:




Hash actual en hexadecimal, en Negro cálido.

Historial corto de los últimos 5–8 intentos, desplazándose hacia arriba, en Piedra.

Nonce actual.

Contador de intentos total.

Tiempo transcurrido.

Velocidad estimada en hashes por segundo.




Al encontrar un hash válido:




Para el bucle.

Destaca ese hash en Verde instrumental.

Mensaje de éxito con intentos totales, tiempo empleado y velocidad media, en tono cercano-explicativo.

5. Panel "¿Qué está pasando?"

Desplegable visible pero plegado por defecto, que se pueda abrir y leer mientras la simulación corre sin que esta se pare. Secciones cortas en lenguaje llano:




Qué es un hash: una función que convierte cualquier dato en un código de longitud fija. Cambia una coma del dato y el código cambia por completo.

Por qué no se puede calcular el resultado: solo se puede probar. No hay atajo. De ahí el nombre "prueba de trabajo".

Qué es el nonce y por qué es el único campo que se toca.

Qué es la dificultad: cuantos más ceros se exigen, más raro es acertar y más intentos hacen falta de media.

Qué es un pool de minería: muchos participantes probando a la vez y repartiendo el resultado, porque en solitario las probabilidades son mínimas.

6. Cierre comparativo + llamada a la acción (fondo oscuro — bitono)

Este es el único bloque de la página en fondo Negro cálido: cambio de bitono deliberado para marcar que aquí se sale de la simulación y se entra en datos reales de la infraestructura.




Como textura de fondo, añade el ASCII art de hashes descrito en la identidad visual: cadenas hexadecimales tipo SHA-256, IBM Plex Mono 10px, rgba(240,237,228,0.07), en position: absolute, aria-hidden="true", user-select: none. El contenido real va encima, en position: relative.




Indexado 001 / en Verde instrumental (variante oscura #3FBFA6). Compara, usando la velocidad real medida:




"Tu navegador: ~X hashes por segundo"

"Un equipo ASIC moderno: unos 100 billones por segundo (100 TH/s)"

"1 PH/s: mil veces más que ese equipo"




Redacta el texto para que la diferencia de escala se entienda de forma intuitiva, no solo numérica, y en tono cercano-explicativo. Usa Crema al 100% para las cifras y Crema atenuado (rgba(240,237,228,0.5)) para las etiquetas.




Debajo, botón en Verde instrumental (variante oscura): "Ver cómo alquilar 1 PH/s", enlazando a /catalogo.








DETALLES TÉCNICOS

Usa SHA-256 doble (SHA-256 aplicado dos veces), que es lo que usa Bitcoin realmente.

Usa la Web Crypto API nativa (crypto.subtle.digest). No instales librerías de criptografía.

El bucle no debe bloquear la interfaz. Procesa los hashes en lotes pequeños dentro de requestAnimationFrame, o usa un Web Worker. La página debe seguir respondiendo a toques y scroll mientras mina.

La visualización debe ser legible por un humano: aunque internamente se calculen miles de hashes por segundo, la pantalla refresca el hash mostrado a un máximo de 10–20 actualizaciones por segundo. El contador de intentos sí refleja el total real.

Redondea toda cifra mostrada. Usa separador de miles español (punto) y coma decimal.

Si el usuario elige dificultad 5 y no encuentra nada, no debe quedarse colgado: permite parar en cualquier momento y muestra el mejor resultado conseguido hasta ese punto.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eba5758d-c042-4464-97ca-6ec5c6a055b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
