# Entre Seda · Nuestro negocio, paso a paso

Un cuaderno web interactivo, en español, para construir en pareja una marca de lencería en Lima. **Entre Seda es un nombre provisional**, pendiente de comprobar disponibilidad. Las propuestas comerciales todavía necesitan muestras, cotizaciones y ventas reales.

## Abrir la web

Descarga y descomprime esta carpeta. Abre **index.html** con tu navegador. No requiere instalación, cuenta ni conexión para las funciones principales. Los enlaces a fuentes sí requieren internet.

Para tener una dirección que ambos puedan abrir desde el celular, sigue [la guía para GitHub Pages](docs/GUIA-GITHUB-PAGES.md).

## Qué encontrarán

| Sección | Para qué sirve |
| --- | --- |
| El punto de partida | Entender la idea y ver el siguiente paso |
| La marca y su público | Concepto, misión, visión, valores y clientas propuestas |
| Nuestra primera colección | Elegir muestras y comparar formas de abastecimiento |
| Una compra especial | Diseñar una experiencia personal o de regalo y calcular sus extras |
| Cómo vamos a vender | Canales, ideas de contenido y estado de preparación |
| Que los números funcionen | Simular contribución, gastos, trabajo y recuperación orientativa |
| El camino al lanzamiento | 19 tareas en cinco etapas, con responsable y estado |
| Acuerdos de equipo | Personalizar nombres, registrar decisiones y compartir una copia |
| Lo que sabemos | Fuentes, observaciones, hipótesis y límites de la investigación |

## Una primera reunión de 45 minutos

1. Lean **La marca** y decidan qué propuesta quieren probar.
2. Revisen **Nuestra primera colección** y seleccionen las muestras.
3. Cambien los supuestos de **Que los números funcionen**, incluyendo su tiempo.
4. En **Acuerdos de equipo**, escriban el presupuesto máximo de prueba y sus roles.
5. En **El camino al lanzamiento**, asignen la primera tarea y su responsable.
6. Exporten una copia del avance y acuerden quién conserva la versión más reciente.

## Cómo se guardan los cambios

La web guarda el avance en `localStorage` del navegador. **No tiene sincronización entre personas, dispositivos ni navegadores.** Abrir el mismo enlace en dos celulares no comparte las notas.

- **Exportar avance** descarga un archivo JSON con sus notas, tareas y supuestos.
- **Importar copia**, dentro de Acuerdos, reemplaza el avance local después de confirmar.
- Mantengan una copia principal para evitar sobrescribir decisiones de la otra persona.
- El modo privado, borrar datos del navegador o cambiar de dirección puede perder el avance. Exporten antes.
- Las notas no se envían al repositorio. No suban los archivos de avance a un repositorio público.
- Las versiones en archivo local y GitHub Pages guardan avances separados: usen exportar/importar para trasladarlos.

## Sobre los números

Los importes iniciales son **supuestos editables**, no un presupuesto aprobado, cotizaciones ni promesas de ganancia. El resultado es anterior a impuestos del negocio. El flete, importación, costos de cobro, entrega asumida y trabajo deben adaptarse a su operación real.

Contribución por pedido = precio − mercadería − flete de entrada − empaque/extras − comisión − incidencias − publicidad atribuida − delivery asumido.

Resultado mensual = contribución × pedidos − gastos fijos − valor del trabajo.

Recuperación orientativa = capital inicial ÷ resultado mensual positivo. Supone resultados constantes y no refleja meses de arranque ni crecimiento de inventario. Si el resultado es cero o negativo, no se muestra una recuperación.

## Editar el proyecto

Sitio estático sin paquetes, rastreadores, fuentes remotas ni backend. Funciona tanto desde una carpeta como bajo una subruta de GitHub Pages.

- `index.html`: estructura, metadatos y carga de archivos.
- `styles.css`: diseño adaptable a celular, tablet y escritorio; impresión.
- `content.js`: productos propuestos, ruta, ideas de contenido y fuentes.
- `app.js`: interfaz, notas, navegación, exportación e importación.
- `model.js`: fórmulas y validación del simulador.
- `assets/mark.svg`: símbolo provisional original.
- `docs/`: plan legible y guía de publicación.
- `tests/`: verificaciones de fórmulas y consistencia del contenido.

El cambio de nombre dentro de la web solo personaliza ese navegador. Para cambiar el nombre base de la web, edita el estado inicial en `app.js`, el título y textos iniciales en `index.html`, y esta documentación.

## Verificación

Con Node.js instalado:

```sh
node --test tests/*.test.cjs
node --check app.js
node --check content.js
node --check model.js
```

La entrega incluye verificaciones automatizadas de cálculo y estructura. Queda pendiente una revisión visual en navegador y la comprobación del despliegue real en GitHub Pages.

## Siguiente evolución

Una versión posterior podría incorporar acceso de dos usuarios y una base de datos para sincronizar tareas. Esta versión ya sirve para explorar el plan, hacer acuerdos y compartir copias, pero no reemplaza un sistema de inventario, pedidos o contabilidad.

Contenido base: octubre de 2026. Las ilustraciones representan conceptos; no son fotografías de mercadería elegida.
