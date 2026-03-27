---
title: "¿Qué es Docker?"
objectives:
  - "Entender la diferencia entre máquinas virtuales y contenedores"
  - "Conocer los componentes principales de Docker"
  - "Aprender los beneficios de la contenedorización"
difficulty: 1
estimated_time: 15
---

# Introducción a Docker

Docker es una plataforma de software que permite a los desarrolladores empaquetar, distribuir y ejecutar aplicaciones en contenedores. Un **contenedor** es una unidad de software estándar que empaqueta el código y todas sus dependencias para que la aplicación se ejecute de forma rápida y confiable de un entorno informático a otro.

## ¿Por qué usar Docker?

Históricamente, el mayor dolor de cabeza de los desarrolladores ha sido el famoso: _"En mi máquina funciona"_. Docker soluciona esto garantizando que el entorno sea idéntico en desarrollo, testing y producción.

### Contenedores vs Máquinas Virtuales (VM)

A diferencia de las máquinas virtuales, los contenedores **no incluyen un sistema operativo completo**. En su lugar, comparten el kernel del sistema operativo anfitrión, lo que los hace:

- **Más ligeros:** Consumen menos recursos (RAM y CPU).
- **Más rápidos:** Arrancan en segundos.
- **Más portátiles:** Se pueden mover fácilmente entre nubes y servidores locales.

## Componentes Principales

1.  **Docker Engine:** El motor que ejecuta los contenedores.
2.  **Imágenes:** Plantillas de solo lectura que definen el contenido del contenedor (como una "clase" en POO).
3.  **Contenedores:** Instancias ejecutables de una imagen (como un "objeto" en POO).
4.  **Docker Hub:** Un registro público para compartir y descargar imágenes.

## Resumen

Docker revolucionó la forma en que construimos software al estandarizar el despliegue. Si podés empaquetarlo en un contenedor, podés ejecutarlo en cualquier lugar que tenga Docker instalado.
