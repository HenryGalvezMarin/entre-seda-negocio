# Publicar este cuaderno en GitHub Pages

Esta guía utiliza la publicación desde la rama `main` y la carpeta raíz. No necesita compilación ni GitHub Actions propio.

## Desde la web de GitHub

1. Inicia sesión en tu cuenta de GitHub y elige **New repository**.
2. Nombre sugerido: `entre-seda-negocio`. Puedes usar otro; la web utiliza rutas relativas.
3. Para el camino gratuito habitual de GitHub Pages, crea un repositorio **Public**. Eso hace público el contenido base del repositorio. No añadas datos de clientes, contraseñas ni copias JSON de las notas.
4. Crea el repositorio. En **uploading an existing file** o **Add file → Upload files**, sube el contenido de esta carpeta descomprimida.
5. Asegúrate de que **index.html esté directamente en la raíz**, junto con `styles.css`, `app.js`, `model.js` y `content.js`. Conserva las carpetas `assets` y `docs`. No subas el ZIP como único archivo.
6. Guarda los archivos con **Commit changes** en la rama `main`.
7. Abre **Settings → Pages**. En **Build and deployment**, elige **Deploy from a branch**.
8. Selecciona **main** y **/(root)**. Pulsa **Save**.
9. Cuando GitHub termine de desplegar, esa misma pantalla mostrará el enlace. Normalmente tendrá esta forma: `https://TU-USUARIO.github.io/entre-seda-negocio/`.
10. Abre el enlace en tu computadora y tu celular. Revisa la navegación, el simulador y una exportación de prueba.

El archivo `.nojekyll` es una marca vacía para servir archivos estáticos. Algunos exploradores lo ocultan al arrastrar; si no se subió, puedes crearlo con **Add file → Create new file**. Este sitio no depende de plantillas Jekyll.

## Actualizar más adelante

Edita el archivo correspondiente en GitHub o sube la nueva versión. Al guardar el cambio en `main`, Pages volverá a desplegar. No es necesario volver a crear el repositorio.

Si has usado el archivo local, exporta tu avance e impórtalo en la dirección publicada. Cada dirección/navegador mantiene su propio almacenamiento.

## Si usas Git en tu computadora

Crea antes un repositorio vacío en tu cuenta. Dentro de esta carpeta:

```sh
git init -b main
git add .
git commit -m "Crear cuaderno interactivo del negocio"
git remote add origin https://github.com/TU-USUARIO/entre-seda-negocio.git
git push -u origin main
```

Sustituye `TU-USUARIO` por tu cuenta y autentícate con el mecanismo que GitHub te indique. No pongas tokens ni contraseñas en el código o en este documento.

Después activa Pages con los pasos 7–9. El repositorio y la página son dos cosas distintas: subir archivos por sí solo no activa siempre la web.

## Alcance de privacidad

`noindex` solicita a los buscadores que no indexen la página, pero **no es una protección de acceso**. El contenido publicado sigue siendo accesible por enlace. El sitio no incluye inicio de sesión.

Los apuntes guardados localmente no forman parte del contenido publicado, salvo que ustedes los incorporen manualmente al código o suban una copia JSON.

Fuente oficial: [Configurar el origen de publicación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Las opciones y disponibilidad pueden depender de la cuenta y su plan.
