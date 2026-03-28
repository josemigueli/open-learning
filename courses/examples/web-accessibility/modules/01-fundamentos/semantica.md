---
title: "El Poder del HTML Semántico"
objectives:
  - "Comprender la importancia del HTML semántico para la accesibilidad"
  - "Conocer las etiquetas más relevantes"
  - "Entender cómo leen la web las tecnologías de asistencia"
difficulty: 2
estimated_time: 15
---

# El Poder del HTML Semántico

El primer paso y el más importante hacia una web accesible es usar **HTML Semántico**. Esto significa usar las etiquetas HTML para su propósito previsto.

Cuando usamos un `<div>` o un `<span>` para crear un botón, le estamos quitando toda la información de contexto al navegador y a las tecnologías de asistencia, como los **lectores de pantalla**.

## ¿Por qué es crucial?

1. **Lectores de Pantalla:** Las personas ciegas o con visión reducida usan software que les "lee" la página web. Este software se basa en la estructura del HTML para entender el contenido. Si usás un `<button>`, el lector dice "Botón, Enviar". Si usás un `<div>` estilizado como botón, el lector simplemente leerá "Enviar", y el usuario no sabrá que es interactivo.
2. **Navegación por Teclado:** Un botón real `<button>` o un enlace `<a>` reciben el foco del teclado (usando la tecla Tab) y se pueden activar con Enter o la barra espaciadora por defecto. Un `<div>` no lo hace, obligándote a escribir JavaScript adicional para simular ese comportamiento.
3. **SEO:** Los motores de búsqueda, al igual que los lectores de pantalla, aman la estructura. Usar `<header>`, `<main>`, `<article>`, y los encabezados (`<h1>` a `<h6>`) mejora la indexación de tu sitio.

## Etiquetas Semánticas Clave

- `<main>`: El contenido principal del documento.
- `<header>` / `<footer>`: Para la cabecera y el pie de página.
- `<nav>`: Para enlaces de navegación principales.
- `<section>` y `<article>`: Para agrupar contenido relacionado.
- `<h1>` a `<h6>`: Para definir la jerarquía de los títulos. NUNCA te saltes un nivel de encabezado solo por estilo visual.
- `<button>` vs `<a>`: Usa `<a>` si la acción te lleva a otra URL. Usa `<button>` si la acción cambia algo en la página actual (como abrir un modal o enviar un formulario).
- `<img>` con el atributo `alt="Texto alternativo"`: Vital para describir la imagen a quien no puede verla. Si la imagen es puramente decorativa, usá `alt=""` para que el lector de pantalla la ignore, pero **nunca** dejes de poner el atributo.

## Resumen

El HTML no es solo para dibujar cosas en la pantalla; es para **describir el significado y la estructura de tu contenido**. Aprender a escribir HTML semántico es el 80% del trabajo de accesibilidad. ¡Tu "Yo" del futuro y tus usuarios te lo agradecerán!
