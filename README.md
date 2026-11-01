# Web de Ismael de la Cruz

Web estática (HTML, CSS y JS sin dependencias). Se puede alojar en GitHub Pages, Netlify o Cloudflare Pages tal cual.

## Editar proyectos y textos (sin tocar código)
1. Entra en https://app.pagescms.org con tu cuenta de GitHub y abre este repositorio.
2. **Proyectos**: añade, edita, borra o reordena proyectos. Los stills se suben arrastrándolos al campo *Stills* (el primero es la portada).
3. **Datos de la web**: nombre, email, redes, frase de portada y texto de «Sobre mí».
4. Al guardar, el cambio se publica solo en un minuto o dos.

Stills: JPG de unos 2000 px de ancho, calidad 80. Vídeo: pega el enlace de Vimeo o YouTube tal cual.

El contenido vive en `content/projects.json` y `content/site.json`, las imágenes en `img/`, y la configuración del panel en `.pages.yml`.

## Probar en local
La web carga el contenido desde los JSON, así que abrir `index.html` con doble clic no funciona.
`python3 -m http.server` dentro de esta carpeta y abre http://localhost:8000

Las imágenes de `img/` son de relleno, generadas para la maqueta.
